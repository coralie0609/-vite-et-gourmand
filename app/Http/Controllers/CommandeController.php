<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CommandeController extends Controller
{
    /**
     * Afficher le formulaire de commande.
     */
    public function create(Request $request): Response
    {
        $request->validate([
            'menu' => [
                'required',
                'integer',
                'exists:menus,id',
            ],
        ]);

        $menu = Menu::findOrFail(
            $request->integer('menu')
        );

        return Inertia::render('Commande', [
            'menu' => $menu->only([
                'id',
                'titre',
                'prix',
                'personnes_min',
                'stock',
                'conditions',
            ]),

            'client' => [
                'nom' => $request->user()->name,
                'email' => $request->user()->email,
                'telephone' =>
                    $request->user()->telephone ?? '',
                'adresse' =>
                    $request->user()->adresse ?? '',
                'code_postal' =>
                    $request->user()->code_postal ?? '',
                'ville' =>
                    $request->user()->ville ?? '',
            ],
        ]);
    }

    /**
     * Enregistrer une nouvelle commande.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'menu_id' => [
                'required',
                'integer',
                'exists:menus,id',
            ],

            'telephone' => [
                'required',
                'string',
                'max:30',
            ],

            'adresse_livraison' => [
                'required',
                'string',
                'max:255',
            ],

            'code_postal' => [
                'required',
                'string',
                'max:10',
            ],

            'ville' => [
                'required',
                'string',
                'max:100',
            ],

            'date_livraison' => [
                'required',
                'date',
                'after_or_equal:today',
            ],

            'heure_livraison' => [
                'required',
                'date_format:H:i',
            ],

            'nombre_personnes' => [
                'required',
                'integer',
                'min:1',
            ],

            'distance_km' => [
                'required',
                'numeric',
                'min:0',
                'max:99999',
            ],

            // Demande de prêt de matériel.
            'materiel_demande' => [
                'sometimes',
                'required',
                'boolean',
            ],

            'materiel_quantites' => [
                'nullable',
                'array:assiettes,verres,couverts,tables,chaises,bancs',
            ],

            'materiel_quantites.assiettes' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

            'materiel_quantites.verres' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

            'materiel_quantites.couverts' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

            'materiel_quantites.tables' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

            'materiel_quantites.chaises' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

            'materiel_quantites.bancs' => [
                'sometimes',
                'integer',
                'min:0',
                'max:999',
            ],

    
'date_reception_materiel' => [
    'nullable',
    'date',
],


'heure_reception_materiel' => [
    'required_if:materiel_demande,true',
    'nullable',
    'date_format:H:i',
],

'heure_restitution_materiel' => [
    'required_if:materiel_demande,true',
    'nullable',
    'date_format:H:i',
],


            // Acceptée dans le formulaire, mais
            // recalculée côté serveur.
            'date_limite_restitution' => [
                'nullable',
                'date',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | 1. Vérifier la date et l'heure de livraison
        |--------------------------------------------------------------------------
        */

        $livraison = Carbon::parse(
            $data['date_livraison']
            .' '
            .$data['heure_livraison']
        );

        if ($livraison->isPast()) {
            throw ValidationException::withMessages([
                'date_livraison' =>
                    'Choisissez une date et une heure futures.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Vérifier les frais de livraison
        |--------------------------------------------------------------------------
        */

        $ville = Str::lower(
            Str::ascii(
                trim($data['ville'])
            )
        );

        $bordeaux = $ville === 'bordeaux';

        if (
            !$bordeaux &&
            (float) $data['distance_km'] <= 0
        ) {
            throw ValidationException::withMessages([
                'distance_km' =>
                    'Indiquez la distance depuis Bordeaux.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Préparer la demande de matériel
        |--------------------------------------------------------------------------
        */

        $materielDemande = (bool) (
            $data['materiel_demande'] ?? false
        );

        $typesMateriel = [
            'assiettes',
            'verres',
            'couverts',
            'tables',
            'chaises',
            'bancs',
        ];

        $quantitesMateriel = [];

        foreach ($typesMateriel as $type) {
            $quantitesMateriel[$type] = (int) (
                $data['materiel_quantites'][$type] ?? 0
            );
        }

        $dateReception = null;
        $dateLimiteRestitution = null;

        if ($materielDemande) {
            // Au moins un article doit être demandé.
            $totalArticles = array_sum(
                $quantitesMateriel
            );

            if ($totalArticles <= 0) {
                throw ValidationException::withMessages([
                    'materiel_demande' =>
                        'Sélectionnez au moins un article de matériel.',
                ]);
            }

            // La date de réception est obligatoire
            // lorsqu'il y a une demande de matériel.
            $dateReceptionSaisie =
                $data['date_reception_materiel'] ?? null;

            if (!$dateReceptionSaisie) {
                throw ValidationException::withMessages([
                    'date_reception_materiel' =>
                        'Indiquez la date de réception souhaitée du matériel.',
                ]);
            }

            $dateReception = CarbonImmutable::parse(
                $dateReceptionSaisie
            )->startOfDay();

            $datePrestation = CarbonImmutable::parse(
                $data['date_livraison']
            )->startOfDay();

            // Ne pas autoriser une réception
            // antérieure à aujourd'hui.
            if (
                $dateReception->lt(
                    CarbonImmutable::today()
                )
            ) {
                throw ValidationException::withMessages([
                    'date_reception_materiel' =>
                        'La date de réception du matériel ne peut pas être passée.',
                ]);
            }

            // Le matériel doit arriver au plus tard
            // le jour de la prestation.
            if (
                $dateReception->gt($datePrestation)
            ) {
                throw ValidationException::withMessages([
                    'date_reception_materiel' =>
                        'La réception du matériel doit avoir lieu au plus tard le jour de la prestation.',
                ]);
            }

            // Calcul officiel côté serveur :
            // 10 jours ouvrés après la prestation.
            $dateLimiteRestitution =
                $this->calculerDateLimiteRestitution(
                    $data['date_livraison']
                );
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Enregistrer la commande et le matériel
        |--------------------------------------------------------------------------
        */

        $commande = DB::transaction(
            function () use (
                $data,
                $request,
                $bordeaux,
                $materielDemande,
                $quantitesMateriel,
                $dateReception,
                $dateLimiteRestitution
            ) {
                // Verrouiller le menu pour protéger
                // la gestion du stock.
                $menu = Menu::query()
                    ->lockForUpdate()
                    ->findOrFail(
                        $data['menu_id']
                    );

                if ($menu->stock <= 0) {
                    throw ValidationException::withMessages([
                        'menu_id' =>
                            'Ce menu est actuellement épuisé.',
                    ]);
                }

                if (
                    $data['nombre_personnes'] <
                    $menu->personnes_min
                ) {
                    throw ValidationException::withMessages([
                        'nombre_personnes' =>
                            'Ce menu nécessite au moins '
                            .$menu->personnes_min
                            .' personnes.',
                    ]);
                }

                $quantite = (int) (
                    $data['nombre_personnes']
                );

                $minimum = (int) (
                    $menu->personnes_min
                );

                /*
                | Calcul du prix du menu.
                | Le prix affiché correspond au
                | minimum de convives.
                */

                $prixMenu = round(
                    (
                        (float) $menu->prix /
                        $minimum
                    ) * $quantite,
                    2
                );

                // Réduction de 10 % à partir
                // de minimum + 5 personnes.
                $reduction =
                    $quantite >= $minimum + 5
                        ? round(
                            $prixMenu * 0.10,
                            2
                        )
                        : 0;

                $distance = $bordeaux
                    ? 0
                    : (float) $data['distance_km'];

                $fraisLivraison = round(
                    5 + (0.59 * $distance),
                    2
                );

                $total = round(
                    $prixMenu
                    - $reduction
                    + $fraisLivraison,
                    2
                );

                /*
                | Enregistrement de la commande.
                */

                $id = DB::table('commandes')
                    ->insertGetId([
                        'user_id' =>
                            $request->user()->id,

                        'menu_id' =>
                            $menu->id,

                        'nom_client' =>
                            $request->user()->name,

                        'email_client' =>
                            $request->user()->email,

                        'telephone' =>
                            $data['telephone'],

                        'adresse_livraison' =>
                            $data['adresse_livraison'],

                        'code_postal' =>
                            $data['code_postal'],

                        'ville' =>
                            $data['ville'],

                        'date_livraison' =>
                            $data['date_livraison'],

                        'heure_livraison' =>
                            $data['heure_livraison'],

                        'nombre_personnes' =>
                            $quantite,

                        'distance_km' =>
                            $distance,

                        'prix_menu' =>
                            $prixMenu,

                        'reduction' =>
                            $reduction,

                        'frais_livraison' =>
                            $fraisLivraison,

                        'total' =>
                            $total,

                        'statut' =>
                            'en_attente',

                        'created_at' =>
                            now(),

                        'updated_at' =>
                            now(),
                    ]);

                /*
                | Enregistrer le matériel demandé
                | dans sa propre table.
                */

                if ($materielDemande) {
                    DB::table(
                        'commande_materiel_demandes'
                    )->insert([
                        'commande_id' =>
                            $id,

                        'quantites' =>
                            json_encode(
                                $quantitesMateriel,
                                JSON_THROW_ON_ERROR
                            ),

                        'date_reception_souhaitee' =>
                            $dateReception->toDateString(),

'heure_reception_souhaitee' =>
    $data['heure_reception_materiel'],

                        'date_limite_restitution' =>
                            $dateLimiteRestitution,

'heure_restitution_souhaitee' =>
    $data['heure_restitution_materiel'],

                        'statut' =>
                            'demandee',

                        'created_at' =>
                            now(),

                        'updated_at' =>
                            now(),
                    ]);
                }

                /*
                | Décrémenter le stock seulement
                | après l'enregistrement réussi.
                */

                $menu->decrement('stock');

                return DB::table('commandes')
                    ->find($id);
            }
        );

        /*
        |--------------------------------------------------------------------------
        | 5. E-mail de confirmation de commande
        |--------------------------------------------------------------------------
        */

        $messageMateriel = '';

        if ($materielDemande) {
            $messageMateriel =
                "\n\nDemande de prêt de matériel :\n";

            $nomsMateriel = [
                'assiettes' => 'Assiettes',
                'verres' => 'Verres',
                'couverts' => 'Couverts',
                'tables' => 'Tables',
                'chaises' => 'Chaises',
                'bancs' => 'Bancs',
            ];

            foreach (
                $quantitesMateriel as $type => $nombre
            ) {
                if ($nombre > 0) {
                    $messageMateriel .=
                        "- "
                        .$nomsMateriel[$type]
                        ." : "
                        .$nombre
                        ."\n";
                }
            }

            $messageMateriel .=
                "\nRéception souhaitée : "
                .$dateReception->format('d/m/Y')
                ."\n";

            $messageMateriel .=
                "Date limite de restitution : "
                .CarbonImmutable::parse(
                    $dateLimiteRestitution
                )->format('d/m/Y')
                ."\n";

            $messageMateriel .=
                "Le prêt reste soumis à la validation du traiteur.\n";
        }

        try {
            Mail::raw(
                "Bonjour {$commande->nom_client},\n\n"
                ."Votre commande n°{$commande->id} a bien été enregistrée.\n"
                ."Elle est en attente de validation.\n\n"
                ."Livraison : {$commande->date_livraison} à {$commande->heure_livraison}\n"
                ."Total : {$commande->total} €"
                .$messageMateriel
                ."\n\nMerci pour votre confiance.\n"
                ."Vite & Gourmand",

                function ($message) use ($commande) {
                    $message
                        ->to(
                            $commande->email_client
                        )
                        ->subject(
                            'Vite & Gourmand - Confirmation de commande'
                        );
                }
            );
        } catch (\Throwable $exception) {
            Log::warning(
                'Email de confirmation non envoyé',
                [
                    'commande_id' =>
                        $commande->id,

                    'erreur' =>
                        $exception->getMessage(),
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Redirection vers la confirmation
        |--------------------------------------------------------------------------
        */

        return redirect()->route(
            'commandes.confirmation',
            $commande->id
        );
    }

    /**
     * Afficher la confirmation de commande.
     */
    public function confirmation(
        Request $request,
        int $commande
    ): Response {
        $resultat = DB::table('commandes')
            ->join(
                'menus',
                'menus.id',
                '=',
                'commandes.menu_id'
            )
            ->where(
                'commandes.id',
                $commande
            )
            ->where(
                'commandes.user_id',
                $request->user()->id
            )
            ->select(
                'commandes.*',
                'menus.titre as menu_titre'
            )
            ->first();

        abort_unless(
            $resultat,
            404
        );

        /*
        | Rechercher une éventuelle demande
        | de matériel associée à cette commande.
        */

        $materiel = DB::table(
            'commande_materiel_demandes'
        )
            ->where(
                'commande_id',
                $commande
            )
            ->first();

        if ($materiel) {
            $resultat->materiel_demande = true;

            $resultat->materiel_quantites =
                json_decode(
                    $materiel->quantites,
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );

            $resultat->date_reception_materiel =
                $materiel->date_reception_souhaitee;

            $resultat->date_limite_restitution =
                $materiel->date_limite_restitution;
   $resultat->heure_reception_materiel =
    $materiel->heure_reception_souhaitee;

$resultat->heure_restitution_materiel =
    $materiel->heure_restitution_souhaitee;

        } else {
            $resultat->materiel_demande = false;

            $resultat->materiel_quantites = null;

            $resultat->date_reception_materiel = null;

            $resultat->date_limite_restitution = null;
  $resultat->heure_reception_materiel = null;
$resultat->heure_restitution_materiel = null;          
        }

        return Inertia::render(
            'Commande',
            [
                'confirmation' => $resultat,
            ]
        );
    }

    /**
     * Calculer la limite de restitution :
     * 10 jours ouvrés après la prestation.
     *
     * Samedi, dimanche et jours fériés
     * nationaux français sont exclus.
     */
    private function calculerDateLimiteRestitution(
        string $datePrestation
    ): string {
        $date = CarbonImmutable::parse(
            $datePrestation
        )->startOfDay();

        $joursOuvres = 0;

        while ($joursOuvres < 10) {
            $date = $date->addDay();

            if ($date->isWeekend()) {
                continue;
            }

            if ($this->estJourFerieFrancais($date)) {
                continue;
            }

            $joursOuvres++;
        }

        return $date->toDateString();
    }

    /**
     * Vérifier les jours fériés nationaux
     * en France métropolitaine.
     */
    private function estJourFerieFrancais(
        CarbonImmutable $date
    ): bool {
        $annee = $date->year;

        $dateTest = $date->toDateString();

        // Jours fériés à date fixe.
        $joursFixes = [
            "$annee-01-01",
            "$annee-05-01",
            "$annee-05-08",
            "$annee-07-14",
            "$annee-08-15",
            "$annee-11-01",
            "$annee-11-11",
            "$annee-12-25",
        ];

        if (
            in_array(
                $dateTest,
                $joursFixes,
                true
            )
        ) {
            return true;
        }

        /*
        | Pâques et jours fériés mobiles.
        |
        | easter_days() fournit le nombre de
        | jours après le 21 mars jusqu'à Pâques.
        */

        $paques = CarbonImmutable::create(
            $annee,
            3,
            21,
            0,
            0,
            0
        )->addDays(
            easter_days($annee)
        );

        $lundiPaques =
            $paques->addDay()->toDateString();

        $ascension =
            $paques->addDays(39)->toDateString();

        $lundiPentecote =
            $paques->addDays(50)->toDateString();

        return in_array(
            $dateTest,
            [
                $lundiPaques,
                $ascension,
                $lundiPentecote,
            ],
            true
        );
    }
}
