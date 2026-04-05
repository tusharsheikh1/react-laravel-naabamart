<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderTimelineController extends Controller
{
    // Safety cap: never fill more than this many buckets (prevents timeout/OOM)
    const MAX_BUCKETS = 500;

    public function index(Request $request)
    {
        $granularity = $request->input('granularity', 'day');
        $now         = Carbon::now();

        // FIX 1: Normalise 'custom' — the frontend sends this, backend has no case for it
        if ($granularity === 'custom') {
            $granularity = 'day';
        }

        switch ($granularity) {
            case 'minute':
                $defaultStart = $now->copy()->subHours(2);
                $dateFormat   = '%Y-%m-%d %H:%i';
                $labelFormat  = 'Y-m-d H:i';
                break;
            case 'hour':
                $defaultStart = $now->copy()->subHours(24);
                $dateFormat   = '%Y-%m-%d %H:00';
                $labelFormat  = 'Y-m-d H:00';
                break;
            case 'month':
                $defaultStart = $now->copy()->subYear();
                $dateFormat   = '%Y-%m';
                $labelFormat  = 'Y-m';
                break;
            case 'year':
                $defaultStart = $now->copy()->subYears(5);
                $dateFormat   = '%Y';
                $labelFormat  = 'Y';
                break;
            case 'day':
            default:
                $granularity  = 'day';
                $defaultStart = $now->copy()->subDays(30);
                $dateFormat   = '%Y-%m-%d';
                $labelFormat  = 'Y-m-d';
                break;
        }

        $startStr = $request->input('start');
        $endStr   = $request->input('end');

        $start = $request->filled('start')
            ? (strlen($startStr) === 10
                ? Carbon::parse($startStr)->startOfDay()
                : Carbon::parse($startStr)->startOfMinute())
            : $defaultStart->startOfMinute();

        $end = $request->filled('end')
            ? (strlen($endStr) === 10
                ? Carbon::parse($endStr)->endOfDay()
                : Carbon::parse($endStr)->endOfMinute())
            : $now->copy()->endOfMinute();

        if ($end->lte($start)) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'granularity'   => $granularity,
                    'start'         => $start->toISOString(),
                    'end'           => $end->toISOString(),
                    'total_orders'  => 0,
                    'total_revenue' => 0,
                    'buckets'       => 0,
                ],
            ]);
        }

        // FIX 2: Auto-upgrade granularity so the fill loop never times out
        $granularity = $this->autoUpgradeGranularity($granularity, $start, $end);
        [$dateFormat, $labelFormat] = $this->getFormats($granularity);

        // FIX 3: Include all cancelled-like statuses in the cancelled count
        $rows = Order::select(
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as bucket"),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw("SUM(CASE WHEN order_status NOT IN ('cancelled','returned','way_to_return') THEN total_amount ELSE 0 END) as revenue"),
                DB::raw("SUM(CASE WHEN order_status = 'pending'   THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN order_status = 'shipped'   THEN 1 ELSE 0 END) as shipped"),
                DB::raw("SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered"),
                DB::raw("SUM(CASE WHEN order_status IN ('cancelled','Number off','Vule order korche') THEN 1 ELSE 0 END) as cancelled"),
                DB::raw("SUM(CASE WHEN order_status IN ('returned','way_to_return') THEN 1 ELSE 0 END) as returned")
            )
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->keyBy('bucket');

        // FIX 4: Hard cap on the fill loop to prevent OOM even after auto-upgrade
        $filled = [];
        $cursor = $start->copy();

        while ($cursor->lte($end) && count($filled) < self::MAX_BUCKETS) {
            $key  = $cursor->format($labelFormat);
            $row  = $rows->get($key);

            $filled[] = [
                'bucket'       => $key,
                'total_orders' => $row ? (int)   $row->total_orders : 0,
                'revenue'      => $row ? round((float) $row->revenue, 2) : 0,
                'pending'      => $row ? (int)   $row->pending       : 0,
                'shipped'      => $row ? (int)   $row->shipped       : 0,
                'delivered'    => $row ? (int)   $row->delivered     : 0,
                'cancelled'    => $row ? (int)   $row->cancelled     : 0,
                'returned'     => $row ? (int)   $row->returned      : 0,
            ];

            switch ($granularity) {
                case 'minute': $cursor->addMinute(); break;
                case 'hour':   $cursor->addHour();   break;
                case 'month':  $cursor->addMonth();  break;
                case 'year':   $cursor->addYear();   break;
                default:       $cursor->addDay();    break;
            }
        }

        $meta = [
            'granularity'   => $granularity,
            'start'         => $start->toISOString(),
            'end'           => $end->toISOString(),
            'total_orders'  => array_sum(array_column($filled, 'total_orders')),
            'total_revenue' => round(array_sum(array_column($filled, 'revenue')), 2),
            'buckets'       => count($filled),
        ];

        return response()->json(['data' => $filled, 'meta' => $meta]);
    }

    private function autoUpgradeGranularity(string $gran, Carbon $start, Carbon $end): string
    {
        $ladder = ['minute', 'hour', 'day', 'month', 'year'];

        while ($this->estimateBuckets($gran, $start, $end) > self::MAX_BUCKETS) {
            $idx = array_search($gran, $ladder);
            if ($idx === false || $idx >= count($ladder) - 1) break;
            $gran = $ladder[$idx + 1];
        }

        return $gran;
    }

    private function estimateBuckets(string $gran, Carbon $start, Carbon $end): int
    {
        $diff = $start->diffInSeconds($end);
        switch ($gran) {
            case 'minute': return (int) ceil($diff / 60);
            case 'hour':   return (int) ceil($diff / 3600);
            case 'day':    return (int) ceil($diff / 86400);
            case 'month':  return (int) ceil($diff / (86400 * 30));
            case 'year':   return (int) ceil($diff / (86400 * 365));
        }
        return 1;
    }

    private function getFormats(string $gran): array
    {
        switch ($gran) {
            case 'minute': return ['%Y-%m-%d %H:%i', 'Y-m-d H:i'];
            case 'hour':   return ['%Y-%m-%d %H:00', 'Y-m-d H:00'];
            case 'month':  return ['%Y-%m',           'Y-m'];
            case 'year':   return ['%Y',              'Y'];
            default:       return ['%Y-%m-%d',        'Y-m-d'];
        }
    }
}