<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Afficher la page de connexion.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Gérer la connexion de l'utilisateur.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Vérifier les identifiants habituels
        $request->authenticate();

        // Vérifier si un employé a été désactivé
        $utilisateur = $request->user();

        if (
            $utilisateur &&
            $utilisateur->role === 'employe' &&
            !$utilisateur->actif
        ) {
            // Refuser la connexion et supprimer la session
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Ce compte employé est désactivé. Veuillez contacter votre administrateur.',
            ]);
        }

        // Connexion autorisée
        $request->session()->regenerate();

        return redirect()->intended(
            route('dashboard', absolute: false)
        );
    }

    /**
     * Déconnecter l'utilisateur.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
