<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerifierCompteActif
{
    /**
     * Vérifier qu'un employé connecté possède
     * toujours un compte actif.
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $utilisateur = $request->user();

        if (
            $utilisateur &&
            $utilisateur->role === 'employe' &&
            !$utilisateur->actif
        ) {
            // Déconnecter immédiatement l'employé désactivé
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Rediriger vers la connexion avec un message
            return redirect()
                ->route('login')
                ->with(
                    'status',
                    'Votre compte employé a été désactivé. Veuillez contacter votre administrateur.'
                );
        }

        return $next($request);
    }
}
