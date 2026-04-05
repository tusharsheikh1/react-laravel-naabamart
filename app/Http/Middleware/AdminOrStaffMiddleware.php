<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrStaffMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the user is authenticated and has staff/admin privileges
        // (Remember: we set isStaff() in the User model to return true for both 'admin' and 'staff')
        if (auth()->check() && auth()->user()->isStaff()) {
            return $next($request);
        }

        // If the request is coming from your React frontend (API request), return a JSON error
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action. You must be an Admin or Staff member to access this.'
            ], 403);
        }

        // If it's a standard web request, show the 403 Forbidden page
        abort(403, 'Unauthorized action. You must be an Admin or Staff member.');
    }
}