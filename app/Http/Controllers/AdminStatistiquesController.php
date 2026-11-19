<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminStatistiquesController extends Controller
{
    private function verifierAdmin(): void
    {
        abort_unless(
            auth()->check() && auth()->user()->role === 'admin',
            403,
            'Accès réservé à l’administrateur.'
        );
    }

    public function index(Request $request)
    {
        $this->verifierAdmin();

        // 1. Copier les données utiles de SQLite vers MongoDB.
        // SQLite reste la base principale de l'application.
        $collection = DB::connection('mongodb')
            ->getDatabase()
            ->selectCollection('statistiques_commandes');

        $commandes = DB::table('commandes')
            ->join('menus', 'menus.id', '=', 'commandes.menu_id')
            ->select(
                'commandes.id',
                'commandes.menu_id',
                'commandes.total',
                'commandes.statut',
                'commandes.created_at',
                'menus.titre as menu_titre'
            )
            ->get();

        foreach ($commandes as $commande) {
            $collection->updateOne(
                ['commande_id' => (int) $commande->id],
                [
                    '$set' => [
                        'commande_id' => (int) $commande->id,
                        'menu_id' => (int) $commande->menu_id,
                        'menu_titre' => $commande->menu_titre,
                        'montant' => (float) $commande->total,
                        'statut' => $commande->statut,
                        'date_commande' => substr(
                            (string) $commande->created_at,
                            0,
                            10
                        ),
                    ],
                ],
                ['upsert' => true]
            );
        }

        // 2. Récupérer les filtres du tableau de bord.
        $menuId = $request->query('menu_id');
        $dateDebut = $request->query('date_debut');
        $dateFin = $request->query('date_fin');

        // 3. Lire les statistiques depuis MongoDB.
        $documents = $collection->find()->toArray();

        $statistiques = collect($documents)
            ->map(fn ($document) => [
                'commande_id' => (int) $document['commande_id'],
                'menu_id' => (int) $document['menu_id'],
                'menu_titre' => (string) $document['menu_titre'],
                'montant' => (float) $document['montant'],
                'statut' => (string) $document['statut'],
                'date_commande' => (string) $document['date_commande'],
            ])
            ->filter(fn ($commande) =>
                $commande['statut'] !== 'refusee'
            );

       

        // 5. Filtrer le chiffre d'affaires.
        $filtrees = $statistiques
            ->filter(function ($commande) use (
                $menuId,
                $dateDebut,
                $dateFin
            ) {
                if ($menuId && $commande['menu_id'] != $menuId) {
                    return false;
                }

                if ($dateDebut &&
                    $commande['date_commande'] < $dateDebut) {
                    return false;
                }

                if ($dateFin &&
                    $commande['date_commande'] > $dateFin) {
                    return false;
                }

                return true;
            });

        $chiffreAffaires = round(
            $filtrees->sum('montant'),
            2
        );
// Graphique avec les mêmes filtres que le chiffre d'affaires.
$parMenu = $filtrees
    ->groupBy('menu_titre')
    ->map(fn ($commandes, $titre) => [
        'menu' => $titre,
        'nombre' => $commandes->count(),
    ])
    ->values()
    ->all();
        // 6. Transmettre les résultats à la page React.
        return Inertia::render('AdminStatistiques', [
            'parMenu' => $parMenu,
            'chiffreAffaires' => $chiffreAffaires,
            'nombreCommandes' => $filtrees->count(),
            'menus' => DB::table('menus')
                ->select('id', 'titre')
                ->orderBy('titre')
                ->get(),
            'filtres' => [
                'menu_id' => $menuId,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
        ]);
    }
}
