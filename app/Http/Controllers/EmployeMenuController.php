<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Plat;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmployeMenuController extends Controller
{
    private function verifierAcces(): void
    {
        abort_unless(
            auth()->check()
            && in_array(auth()->user()->role, ['admin', 'employe'], true),
            403
        );
    }

    public function index()
    {
        $this->verifierAcces();

        return Inertia::render('EmployeMenus', [
            'menus' => Menu::with('plats')
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function updateMenu(Request $request, Menu $menu)
    {
        $this->verifierAcces();

        $donnees = $request->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'theme' => ['required', 'string', 'max:255'],
            'regime' => ['required', 'string', 'max:255'],
            'personnes_min' => ['required', 'integer', 'min:1'],
            'prix' => ['required', 'numeric', 'min:0'],
            'conditions' => ['nullable', 'string'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $menu->update($donnees);

        return back()->with('success', 'Menu modifié avec succès.');
    }

    public function updatePlat(Request $request, Plat $plat)
    {
        $this->verifierAcces();

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'categorie' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'ingredients' => ['nullable', 'string'],
        ]);

        $plat->update($donnees);

        return back()->with('success', 'Plat modifié avec succès.');
    }

    public function storePlat(Request $request)
    {
        $this->verifierAcces();

        $donnees = $request->validate([
            'menu_id' => ['required', 'integer', Rule::exists('menus', 'id')],
            'nom' => ['required', 'string', 'max:255'],
            'categorie' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'ingredients' => ['nullable', 'string'],
        ]);

        Plat::create($donnees);

        return back()->with('success', 'Plat ajouté avec succès.');
    }

    public function destroyPlat(Plat $plat)
    {
        $this->verifierAcces();

        // Ne pas supprimer un plat lié à des allergènes
        // sans prévoir le traitement de ses relations.
        if ($plat->allergenes()->exists()) {
            return back()->withErrors([
                'suppression' => 'Ce plat possède des allergènes associés. '
                    . 'Modifiez-le plutôt que de le supprimer.',
            ]);
        }

        $plat->delete();

        return back()->with('success', 'Plat supprimé avec succès.');
    }
}
