<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeCommandeController extends Controller
{
    private function verifierAcces(Request $request): void
    {
        $role = (string) ($request->user()?->role ?? '');

        abort_unless(
            in_array($role, ['employe', 'admin'], true),
            403,
            'Accès réservé au personnel.'
        );
    }

    public function index(Request $request): Response
    {
        $this->verifierAcces($request);

        $filtres = $request->validate([
            'statut' => ['nullable', 'string', 'max:50'],
            'recherche' => ['nullable', 'string', 'max:100'],
        ]);

       
$query = DB::table('commandes')
    ->join('menus', 'menus.id', '=', 'commandes.menu_id')
    ->leftJoin(
        'commande_materiel_demandes',
        'commande_materiel_demandes.commande_id',
        '=',
        'commandes.id'
    )
    ->select(
        'commandes.*',
        'menus.titre as menu_titre',
        'commande_materiel_demandes.id as demande_materiel_id',
        'commande_materiel_demandes.quantites as materiel_quantites',
        'commande_materiel_demandes.statut as statut_materiel',
        'commande_materiel_demandes.date_reception_souhaitee',
        'commande_materiel_demandes.heure_reception_souhaitee',
        'commande_materiel_demandes.date_limite_restitution',
        'commande_materiel_demandes.heure_restitution_souhaitee',
        'commande_materiel_demandes.date_remise_reelle',
        'commande_materiel_demandes.date_restitution_reelle'
    );


        if (!empty($filtres['statut'])) {
            $query->where('commandes.statut', $filtres['statut']);
        }

        if (!empty($filtres['recherche'])) {
            $recherche = $filtres['recherche'];

            $query->where(function ($q) use ($recherche) {
                $q->where(
                    'commandes.nom_client',
                    'like',
                    "%{$recherche}%"
                )
                ->orWhere(
                    'commandes.email_client',
                    'like',
                    "%{$recherche}%"
                )
                ->orWhere(
                    'commandes.id',
                    'like',
                    "%{$recherche}%"
                );
            });
        }

        $commandes = $query
            ->orderByDesc('commandes.created_at')
            ->get();

        return Inertia::render('EmployeCommandes', [
            'commandes' => $commandes,
            'filtres' => $filtres,
        ]);
    }

    public function changerStatut(Request $request, int $commande)
    {
        $this->verifierAcces($request);

        $statutsPossibles = [
            'en_attente',
            'acceptee',
            'en_preparation',
            'en_livraison',
            'livree',
            'en_attente_retour_materiel',
            'terminee',
            'refusee',
        ];

        $data = $request->validate([
            'statut' => [
                'required',
                Rule::in($statutsPossibles),
            ],
            'mode_contact' => [
                'required_if:statut,refusee',
                'nullable',
                Rule::in(['telephone', 'email']),
            ],
            'motif_annulation' => [
                'required_if:statut,refusee',
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $transitions = [
            'en_attente' => ['acceptee', 'refusee'],
            'acceptee' => ['en_preparation'],
            'en_preparation' => ['en_livraison'],
            'en_livraison' => ['livree'],
            'livree' => [
                'terminee',
                'en_attente_retour_materiel',
            ],
            'en_attente_retour_materiel' => ['terminee'],
        ];

        $resultat = DB::transaction(function () use (
            $request,
            $commande,
            $data,
            $transitions
        ) {
            $existante = DB::table('commandes')
                ->where('id', $commande)
                ->lockForUpdate()
                ->first();

            abort_unless($existante, 404);

            $ancienStatut = $existante->statut;
            $nouveauStatut = $data['statut'];

            if ($ancienStatut === $nouveauStatut) {
                return 'identique';
            }

            $suivants = $transitions[$ancienStatut] ?? [];

            if (!in_array($nouveauStatut, $suivants, true)) {
                return 'transition_invalide';
            }

            if (
                $nouveauStatut === 'en_attente_retour_materiel'
                && !$existante->materiel_prete
            ) {
                return 'materiel_non_declare';
            }

            $modifications = [
                'statut' => $nouveauStatut,
                'updated_at' => now(),
            ];

            if ($nouveauStatut === 'refusee') {
                $modifications['contact_client_le'] = now();
                $modifications['mode_contact'] = $data['mode_contact'];
                $modifications['motif_annulation'] =
                    $data['motif_annulation'];
            }

            if (
                $ancienStatut === 'en_attente_retour_materiel'
                && $nouveauStatut === 'terminee'
            ) {
                $modifications['materiel_restitue_le'] = now();
            }

            DB::table('commandes')
                ->where('id', $commande)
                ->update($modifications);

            DB::table('commande_statuts')->insert([
                'commande_id' => $commande,
                'user_id' => $request->user()->id,
                'ancien_statut' => $ancienStatut,
                'nouveau_statut' => $nouveauStatut,
                'commentaire' => $nouveauStatut === 'refusee'
                    ? $data['motif_annulation']
                    : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($nouveauStatut === 'refusee') {
                DB::table('menus')
                    ->where('id', $existante->menu_id)
                    ->increment('stock');
            }

            return 'ok';
        });

        if ($resultat === 'identique') {
            return back()->with(
                'error',
                'La commande possède déjà ce statut.'
            );
        }

        if ($resultat === 'transition_invalide') {
            return back()->with(
                'error',
                'Ce changement de statut n’est pas autorisé.'
            );
        }

        if ($resultat === 'materiel_non_declare') {
            return back()->with(
                'error',
                'Aucun prêt de matériel n’est déclaré.'
            );
        }

        // Notifier le client uniquement après un changement
        // de statut enregistré avec succès.
       if ($resultat === 'ok') {
            try {
                $client = DB::table('commandes')
                    ->join('users', 'commandes.user_id', '=', 'users.id')
                    ->where('commandes.id', $commande)
                    ->select('users.email', 'users.name', 'users.prenom')
                    ->first();

                if ($client && !empty($client->email)) {
                    $libelles = [
                        'en_attente' => 'En attente',
                        'acceptee' => 'Acceptée',
                        'en_preparation' => 'En préparation',
                        'en_livraison' => 'En livraison',
                        'livree' => 'Livrée',
                        'en_attente_retour_materiel' => 'En attente du retour du matériel',
                        'terminee' => 'Terminée',
                        'refusee' => 'Refusée',
                    ];

                    $statut = $data['statut'];
                    $libelle = $libelles[$statut] ?? $statut;
                    $prenom = $client->prenom ?: $client->name;

                    $message = "Bonjour {$prenom},\n\n"
                        . "Le statut de votre commande n°{$commande} "
                        . "chez Vite & Gourmand a été mis à jour.\n\n"
                        . "Nouveau statut : {$libelle}\n\n"
                        . "Vous pouvez consulter le suivi de votre commande "
                        . "dans votre espace client :\n"
                        . url('/mon-espace') . "\n\n"
                        . "Merci de votre confiance.\n\n"
                        . "L'équipe Vite & Gourmand";

                    \Illuminate\Support\Facades\Mail::raw(
                        $message,
                        function ($mail) use ($client, $commande) {
                            $mail->to($client->email)
                                ->subject(
                                    "Vite & Gourmand - Suivi de la commande n°{$commande}"
                                );
                        }
                    );
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }


        return back()->with(
            'success',
            'Le statut a été mis à jour et enregistré dans l’historique.'
        );
    }
 
    /**
     * Valider une demande de prêt de matériel.
     */
    public function validerMateriel(Request $request, int $commande)
    {
        $this->verifierAcces($request);

        $resultat = DB::transaction(function () use ($commande) {
            $demande = DB::table('commande_materiel_demandes')
                ->where('commande_id', $commande)
                ->lockForUpdate()
                ->first();

            if (!$demande) {
                return 'introuvable';
            }

            if ($demande->statut !== 'demandee') {
                return 'deja_traitee';
            }

            $commandeExistante = DB::table('commandes')
                ->where('id', $commande)
                ->first();

            if (
                !$commandeExistante ||
                in_array(
                    $commandeExistante->statut,
                    ['refusee', 'annulee', 'terminee'],
                    true
                )
            ) {
                return 'commande_invalide';
            }

            DB::table('commande_materiel_demandes')
                ->where('id', $demande->id)
                ->update([
                    'statut' => 'validee',
                    'updated_at' => now(),
                ]);

            return 'ok';
        });

        if ($resultat === 'introuvable') {
            return back()->with(
                'error',
                'Aucune demande de matériel pour cette commande.'
            );
        }

        if ($resultat === 'deja_traitee') {
            return back()->with(
                'error',
                'Cette demande de matériel a déjà été traitée.'
            );
        }

        if ($resultat === 'commande_invalide') {
            return back()->with(
                'error',
                'Cette commande ne permet plus de valider un prêt.'
            );
        }

        return back()->with(
            'success',
            'La demande de matériel a été validée.'
        );
    }
  
    /**
     * Confirmer la remise effective du matériel au client.
     */
    public function remettreMateriel(Request $request, int $commande)
    {
        $this->verifierAcces($request);

        $resultat = DB::transaction(function () use ($commande) {
            $commandeExistante = DB::table('commandes')
                ->where('id', $commande)
                ->lockForUpdate()
                ->first();

            if (!$commandeExistante) {
                return 'introuvable';
            }

            if (in_array(
                $commandeExistante->statut,
                ['refusee', 'annulee', 'terminee'],
                true
            )) {
                return 'commande_invalide';
            }

            $demande = DB::table('commande_materiel_demandes')
                ->where('commande_id', $commande)
                ->lockForUpdate()
                ->first();

            if (!$demande) {
                return 'introuvable';
            }

            if ($demande->statut !== 'validee') {
                return 'statut_invalide';
            }

            DB::table('commande_materiel_demandes')
                ->where('id', $demande->id)
                ->update([
                    'statut' => 'remis',
                    'date_remise_reelle' => now(),
                    'updated_at' => now(),
                ]);

            DB::table('commandes')
                ->where('id', $commande)
                ->update([
                    'materiel_prete' => true,
                    'updated_at' => now(),
                ]);

            return 'ok';
        });

        if ($resultat !== 'ok') {
            return back()->with(
                'error',
                'La remise du matériel est impossible : vérifiez que la demande est validée et que la commande est active.'
            );
        }

        return back()->with(
            'success',
            'La remise du matériel a été enregistrée.'
        );
    }
 
    /**
     * Confirmer la restitution effective du matériel.
     * Un seul e-mail de confirmation par restitution.
     */
    public function restituerMateriel(Request $request, int $commande)
    {
        $this->verifierAcces($request);

        $resultat = DB::transaction(function () use ($commande) {
            $commandeExistante = DB::table('commandes')
                ->where('id', $commande)
                ->lockForUpdate()
                ->first();

            if (!$commandeExistante) {
                return 'introuvable';
            }

            $demande = DB::table('commande_materiel_demandes')
                ->where('commande_id', $commande)
                ->lockForUpdate()
                ->first();

            if (!$demande) {
                return 'introuvable';
            }

            if ($demande->statut === 'restitue') {
                return 'deja_restitue';
            }

            if ($demande->statut !== 'remis') {
                return 'statut_invalide';
            }

            DB::table('commande_materiel_demandes')
                ->where('id', $demande->id)
                ->update([
                    'statut' => 'restitue',
                    'date_restitution_reelle' => now(),
                    'updated_at' => now(),
                ]);

            DB::table('commandes')
                ->where('id', $commande)
                ->update([
                    'materiel_restitue_le' => now(),
                    'updated_at' => now(),
                ]);

            return 'ok';
        });

        if ($resultat !== 'ok') {
            return back()->with(
                'error',
                'La restitution est impossible : vérifiez que le matériel a été remis et qu’il n’a pas déjà été restitué.'
            );
        }

        try {
            $client = DB::table('commandes')
                ->where('id', $commande)
                ->first();

            $demande = DB::table('commande_materiel_demandes')
                ->where('commande_id', $commande)
                ->first();

            if (
                $client &&
                $demande &&
                $client->email_client &&
                $demande->email_restitution_envoye_at === null
            ) {
                $dateRetour = now()->format('d/m/Y à H:i');

                \Illuminate\Support\Facades\Mail::raw(
                    "Bonjour {$client->nom_client},\n\n"
                    . "Nous confirmons la restitution du matériel "
                    . "associé à votre commande n°{$commande}.\n\n"
                    . "Date et heure de restitution : {$dateRetour}\n\n"
                    . "Merci pour votre confiance.\n\n"
                    . "L'équipe Vite & Gourmand",
                    function ($mail) use ($client, $commande) {
                        $mail->to($client->email_client)
                            ->subject(
                                "Vite & Gourmand - Confirmation de restitution du matériel n°{$commande}"
                            );
                    }
                );

                DB::table('commande_materiel_demandes')
                    ->where('id', $demande->id)
                    ->whereNull('email_restitution_envoye_at')
                    ->update([
                        'email_restitution_envoye_at' => now(),
                        'updated_at' => now(),
                    ]);
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return back()->with(
            'success',
            'La restitution du matériel a été enregistrée.'
        );
    }

}
