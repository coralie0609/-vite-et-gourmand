<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AvisController extends Controller
{
    /**
     * Enregistrer un avis sur une commande terminée.
     */
    public function store(
        Request $request,
        int $commande
    ): RedirectResponse {
        $data = $request->validate([
            'note' => [
                'required',
                'integer',
                'between:1,5',
            ],
            'commentaire' => [
                'required',
                'string',
                'min:5',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use ($request, $commande, $data) {

            // Vérifier que la commande appartient au client.
            $reservation = DB::table('commandes')
                ->where('id', $commande)
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            abort_unless($reservation, 404);

            // Un avis est possible uniquement
            // après la fin de la prestation.
            if ($reservation->statut !== 'terminee') {
                throw ValidationException::withMessages([
                    'note' =>
                        'Vous pourrez donner votre avis '.
                        'lorsque votre commande sera terminée.',
                ]);
            }

            // Empêcher plusieurs avis pour une même commande.
            $avisExistant = DB::table('avis')
                ->where('commande_id', $commande)
                ->exists();

            if ($avisExistant) {
                throw ValidationException::withMessages([
                    'note' =>
                        'Vous avez déjà donné votre avis '.
                        'sur cette commande.',
                ]);
            }

            DB::table('avis')->insert([
                'user_id' => $request->user()->id,
                'commande_id' => $commande,
                'note' => (int) $data['note'],
                'commentaire' => trim($data['commentaire']),
                'statut' => 'en_attente',
                'valide_par' => null,
                'valide_le' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('espace-client.index')
            ->with(
                'success',
                'Merci pour votre avis ! '.
                'Il sera publié après validation '.
                'par notre équipe.'
            );
    }
}
