<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminEmployeController extends Controller
{
    /**
     * Réserver toutes les actions à l'administrateur.
     */
    private function verifierAdmin(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->role === 'admin',
            403,
            'Accès réservé à l’administrateur.'
        );
    }

    /**
     * Afficher la liste des employés.
     */
    public function index(Request $request): Response
    {
        $this->verifierAdmin($request);

        $employes = User::query()
            ->where('role', 'employe')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'actif', 'created_at']);

        return Inertia::render('AdminEmployes', [
            'employes' => $employes,
        ]);
    }

    /**
     * Créer un compte employé.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->verifierAdmin($request);

        $donnees = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            'name' => $donnees['name'],
            'email' => $donnees['email'],
            'password' => Hash::make($donnees['password']),
            'role' => 'employe',
            'actif' => true,
        ]);

        return redirect()
            ->route('admin.employes.index')
            ->with('success', 'Le compte employé a été créé.');
    }

    /**
     * Activer ou désactiver un employé.
     */
    public function changerStatut(
        Request $request,
        User $employe
    ): RedirectResponse {
        $this->verifierAdmin($request);

        abort_unless($employe->role === 'employe', 404);

        $donnees = $request->validate([
            'actif' => ['required', 'boolean'],
        ]);

        $employe->update([
            'actif' => $donnees['actif'],
        ]);

        return redirect()
            ->route('admin.employes.index')
            ->with(
                'success',
                $employe->actif
                    ? 'Le compte employé a été réactivé.'
                    : 'Le compte employé a été désactivé.'
            );
    }
}
