<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // --- ADDED: Exclude the analytics tracking route from CSRF verification ---
        $middleware->validateCsrfTokens(except: [
            '/analytics/track'
        ]);
        // ------------------------------------------------------------------------

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'admin_or_staff' => \App\Http\Middleware\AdminOrStaffMiddleware::class, // Added the new middleware here
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        
        // --- ADDED: Catch 404 Not Found errors and render custom Inertia Page ---
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            if ($response->getStatusCode() === 404) {
                return Inertia::render('Errors/404')
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
        // ------------------------------------------------------------------------

    })
    ->create();