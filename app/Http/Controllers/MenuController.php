<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filtres = $request->validate([
            'theme' => 'nullable|string|max:100',
            'regime' => 'nullable|string|max:100',
            'prix_min' => 'nullable|numeric|min:0',
            'prix_max' => 'nullable|numeric|min:0',
            'personnes' => 'nullable|integer|min:1',
        ]);

        $query = Menu::query();

        if (!empty($filtres['theme'])) {
            $query->where('theme', $filtres['theme']);
        }

        if (!empty($filtres['regime'])) {
            $query->where('regime', $filtres['regime']);
        }

        if (isset($filtres['prix_min'])) {
            $query->where('prix', '>=', $filtres['prix_min']);
        }

        if (isset($filtres['prix_max'])) {
            $query->where('prix', '<=', $filtres['prix_max']);
        }

        if (isset($filtres['personnes'])) {
            $query->where('personnes_min', '<=', $filtres['personnes']);
        }

        return response()->json(
            $query->orderBy('titre')->get()
        );
    }

    
public function show(Menu $menu): JsonResponse
{
    return response()->json(
        $menu->load('plats.allergenes')
    );
}

}
