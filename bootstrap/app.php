<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
   
->withMiddleware(function (Middleware $middleware): void {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
        \App\Http\Middleware\VerifierCompteActif::class,
        \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
    ]);
})


->withExceptions(function (Exceptions $exceptions): void {

    // Conserver les réponses JSON pour les API
    $exceptions->shouldRenderJsonWhen(
        fn (Request $request) =>
            $request->is('api/*') || $request->expectsJson(),
    );

    // Pages d'erreur personnalisées 403 et 405
    $exceptions->render(function (
        \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e,
        Request $request
    ) {
        // Ne pas modifier les réponses JSON
        if ($request->is('api/*') || $request->expectsJson()) {
            return null;
        }

        // Erreur 403 : accès interdit
        if ($e->getStatusCode() === 403) {
            return \Inertia\Inertia::render('Erreur403')
                ->toResponse($request)
                ->setStatusCode(403);
        }

        // Erreur 405 : méthode non autorisée
        if ($e->getStatusCode() === 405) {
            return \Inertia\Inertia::render('Erreur405')
                ->toResponse($request)
                ->setStatusCode(405);
        }

        return null;
    });

})->create();
