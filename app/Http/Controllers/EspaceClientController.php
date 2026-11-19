<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EspaceClientController extends Controller
{
    /**
     * Afficher uniquement les commandes du client connecté.
     */
    public function index(Request $request): Response
    {
        $commandes = DB::table('commandes')
            ->join('menus', 'menus.id', '=', 'commandes.menu_id')
            ->where('commandes.user_id', $request->user()->id)
            ->select(
                'commandes.id',
                'commandes.menu_id',
                'commandes.telephone',
                'commandes.nombre_personnes',
                'commandes.date_livraison',
                'commandes.heure_livraison',
                'commandes.adresse_livraison',
                'commandes.code_postal',
                'commandes.ville',
                'commandes.distance_km',
                'commandes.prix_menu',
                'commandes.reduction',
                'commandes.frais_livraison',
                'commandes.total',
                'commandes.statut',
                'commandes.created_at',
                'commandes.updated_at',
                'menus.titre as menu_titre',
                'menus.prix as menu_prix',
                'menus.personnes_min',
                'menus.conditions as menu_conditions'
            )
            ->orderByDesc('commandes.created_at')
            ->get();


        // Identifier les commandes ayant déjà reçu un avis
        $commandesAvecAvis = DB::table('avis')
            ->where('user_id', $request->user()->id)
            ->pluck('commande_id');


        $historiques = collect();

        if ($commandes->isNotEmpty()) {
            $historiques = DB::table('commande_statuts')
                ->whereIn('commande_id', $commandes->pluck('id'))
                ->orderBy('created_at')
                ->orderBy('id')
                ->get()
                ->groupBy('commande_id');
        }

       
$commandes = $commandes->map(function ($commande) use ($historiques, $commandesAvecAvis) {

            $evenements = $historiques->get($commande->id, collect());

            $commande->historique = $evenements
                ->map(function ($evenement) {
                    return [
                        'id' => $evenement->id,
                        'ancien_statut' => $evenement->ancien_statut,
                        'nouveau_statut' => $evenement->nouveau_statut,
                        'date_heure_fr' => Carbon::parse(
                            $evenement->created_at,
                            'UTC'
                        )
                            ->timezone('Europe/Paris')
                            ->format('d/m/Y à H:i'),
                    ];
                })
                ->values()
                ->all();

            // Indiquer si le client a déjà déposé un avis
            $commande->avis_deja_depose = $commandesAvecAvis->contains($commande->id);

            return $commande;
        });

        return Inertia::render('EspaceClient', [
            'commandes' => $commandes,
        ]);
    }

    /**
     * Modifier une commande uniquement avant son acceptation.
     */
    public function modifier(
        Request $request,
        int $commande
    ): RedirectResponse {
        $data = $request->validate([
            'telephone' => ['required', 'string', 'max:30'],
            'adresse_livraison' => ['required', 'string', 'max:255'],
            'code_postal' => ['required', 'string', 'max:10'],
            'ville' => ['required', 'string', 'max:100'],
            'date_livraison' => [
                'required',
                'date',
                'after_or_equal:today'
            ],
            'heure_livraison' => [
                'required',
                'date_format:H:i'
            ],
            'nombre_personnes' => [
                'required',
                'integer',
                'min:1'
            ],
            'distance_km' => [
                'required',
                'numeric',
                'min:0',
                'max:99999'
            ],
        ]);

        $livraison = Carbon::parse(
            $data['date_livraison'].' '.$data['heure_livraison']
        );

        if ($livraison->isPast()) {
            throw ValidationException::withMessages([
                'date_livraison' =>
                    'Choisissez une date et une heure futures.',
            ]);
        }

        $ville = Str::lower(
            Str::ascii(trim($data['ville']))
        );

        $bordeaux = $ville === 'bordeaux';

        if (!$bordeaux && (float) $data['distance_km'] <= 0) {
            throw ValidationException::withMessages([
                'distance_km' =>
                    'Indiquez la distance depuis Bordeaux.',
            ]);
        }

        DB::transaction(function () use ($request, $commande, $data, $bordeaux) {
            $reservation = DB::table('commandes')
                ->where('id', $commande)
                ->where('user_id', $request->user()->id)
                ->lockForUpdate()
                ->first();

            abort_unless($reservation, 404);

            if ($reservation->statut !== 'en_attente') {
                throw ValidationException::withMessages([
                    'commande' =>
                        'Cette commande ne peut plus être modifiée.',
                ]);
            }

            // Le menu reste obligatoirement inchangé.
            $menu = DB::table('menus')
                ->where('id', $reservation->menu_id)
                ->first();

            abort_unless($menu, 404);

            $quantite = (int) $data['nombre_personnes'];
            $minimum = (int) $menu->personnes_min;

            if ($minimum < 1 || $quantite < $minimum) {
                throw ValidationException::withMessages([
                    'nombre_personnes' =>
                        'Ce menu nécessite au moins '.
                        $minimum.' personnes.',
                ]);
            }

            // Même calcul que lors de la création.
            $prixMenu = round(
                ((float) $menu->prix / $minimum) * $quantite,
                2
            );

            $reduction = $quantite >= $minimum + 5
                ? round($prixMenu * 0.10, 2)
                : 0;

            $distance = $bordeaux
                ? 0
                : (float) $data['distance_km'];

            $fraisLivraison = round(
                5 + (0.59 * $distance),
                2
            );

            $total = round(
                $prixMenu - $reduction + $fraisLivraison,
                2
            );

            DB::table('commandes')
                ->where('id', $commande)
                ->where('user_id', $request->user()->id)
                ->where('statut', 'en_attente')
                ->update([
                    'telephone' => $data['telephone'],
                    'adresse_livraison' => $data['adresse_livraison'],
                    'code_postal' => $data['code_postal'],
                    'ville' => $data['ville'],
                    'date_livraison' => $data['date_livraison'],
                    'heure_livraison' => $data['heure_livraison'],
                    'nombre_personnes' => $quantite,
                    'distance_km' => $distance,
                    'prix_menu' => $prixMenu,
                    'reduction' => $reduction,
                    'frais_livraison' => $fraisLivraison,
                    'total' => $total,
                    'updated_at' => now(),
                ]);

            // Aucun changement de stock : même menu,
            // même commande.
        });

        return redirect()
            ->route('espace-client.index')
            ->with(
                'success',
                'Votre commande a été modifiée avec succès.'
            );
    }

    /**
     * Annuler une commande uniquement avant son acceptation.
     */
    public function annuler(
        Request $request,
        int $commande
    ): RedirectResponse {
        $resultat = DB::transaction(function () use ($request, $commande) {
            $reservation = DB::table('commandes')
                ->where('id', $commande)
                ->where('user_id', $request->user()->id)
                ->first();

            abort_unless($reservation, 404);

            $modifiee = DB::table('commandes')
                ->where('id', $commande)
                ->where('user_id', $request->user()->id)
                ->where('statut', 'en_attente')
                ->update([
                    'statut' => 'annulee',
                    'updated_at' => now(),
                ]);

            if ($modifiee === 1) {
                DB::table('menus')
                    ->where('id', $reservation->menu_id)
                    ->increment('stock');

                DB::table('commande_statuts')->insert([
                    'commande_id' => $commande,
                    'user_id' => $request->user()->id,
                    'ancien_statut' => 'en_attente',
                    'nouveau_statut' => 'annulee',
                    'commentaire' => 'Annulation par le client.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $modifiee;
        });

        return redirect()
            ->route('espace-client.index')
            ->with(
                'success',
                $resultat === 1
                    ? 'Votre commande a été annulée.'
                    : 'Cette commande ne peut plus être annulée.'
            );
    }
}
