<?php

namespace App\Http\Controllers;

use App\Models\Horaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeHoraireController extends Controller
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

        return Inertia::render('EmployeHoraires', [
            'horaires' => Horaire::orderBy('jour_numero')->get(),
        ]);
    }

    public function update(Request $request, Horaire $horaire)
    {
        $this->verifierAcces();

        $donnees = $request->validate([
            'ouverture' => ['nullable', 'date_format:H:i'],
            'fermeture' => ['nullable', 'date_format:H:i'],
            'ferme' => ['required', 'boolean'],
        ]);

        if (!$donnees['ferme']) {
            $request->validate([
                'ouverture' => ['required', 'date_format:H:i'],
                'fermeture' => [
                    'required',
                    'date_format:H:i',
                    'after:ouverture',
                ],
            ]);
        }

        $horaire->update([
            'ouverture' => $donnees['ferme']
                ? null
                : $donnees['ouverture'],
            'fermeture' => $donnees['ferme']
                ? null
                : $donnees['fermeture'],
            'ferme' => $donnees['ferme'],
        ]);

        return back()->with(
            'success',
            'Horaires du ' . $horaire->jour . ' enregistrés.'
        );
    }
}
