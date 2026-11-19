<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeAvisController extends Controller
{
    /**
     * Autoriser uniquement les employés actifs
     * et les administrateurs.
     */
    private function verifierAcces(Request $request): void
    {
        $utilisateur = $request->user();

        abort_unless(
            $utilisateur
                && in_array(
                    $utilisateur->role,
                    ['employe', 'admin'],
                    true
                )
                && (
                    $utilisateur->role === 'admin'
                    || (bool) $utilisateur->actif
                ),
            403
        );
    }

    /**
     * Afficher les avis à modérer.
     */
    public function index(Request $request): Response
    {
        $this->verifierAcces($request);

        $avis = DB::table('avis')
            ->join(
                'commandes',
                'commandes.id',
                '=',
                'avis.commande_id'
            )
            ->join(
                'menus',
                'menus.id',
                '=',
                'commandes.menu_id'
            )
            ->join(
                'users',
                'users.id',
                '=',
                'avis.user_id'
            )
            ->select(
                'avis.id',
                'avis.commande_id',
                'avis.note',
                'avis.commentaire',
                'avis.statut',
                'avis.created_at',
                'avis.valide_le',
                'users.name as client_nom',
                'menus.titre as menu_titre'
            )
            ->orderByRaw(
                "CASE WHEN avis.statut = 'en_attente' THEN 0 ELSE 1 END"
            )
            ->orderByDesc('avis.created_at')
            ->get();

        return Inertia::render('EmployeAvis', [
            'avis' => $avis,
        ]);
    }

    /**
     * Accepter ou refuser un avis.
     */
    public function moderer(
        Request $request,
        int $avis
    ): RedirectResponse {
        $this->verifierAcces($request);

        $data = $request->validate([
            'statut' => [
                'required',
                'in:valide,refuse',
            ],
        ]);

        DB::transaction(function () use ($request, $avis, $data) {
            $avisExistant = DB::table('avis')
                ->where('id', $avis)
                ->lockForUpdate()
                ->first();

            abort_unless($avisExistant, 404);

            // Un avis déjà modéré ne peut plus être
            // validé ou refusé une seconde fois.
            abort_unless(
                $avisExistant->statut === 'en_attente',
                422,
                'Cet avis a déjà été traité.'
            );

            DB::table('avis')
                ->where('id', $avis)
                ->update([
                    'statut' => $data['statut'],
                    'valide_par' => $request->user()->id,
                    'valide_le' => now(),
                    'updated_at' => now(),
                ]);
        });

        return redirect()
            ->route('employe.avis.index')
            ->with(
                'success',
                $data['statut'] === 'valide'
                    ? 'L’avis a été validé.'
                    : 'L’avis a été refusé.'
            );
    }
}
