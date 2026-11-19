
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Commande = {
    id: number;
    menu_titre: string;
    nom_client: string;
    email_client: string;
    telephone: string;
    nombre_personnes: number;
    date_livraison: string;
    heure_livraison: string;
    adresse_livraison: string;
    code_postal: string;
    ville: string;
    total: string | number;
    statut: string;
    created_at: string;
    materiel_prete?: boolean | number;
 demande_materiel_id?: number | null;
materiel_quantites?: string | null;
statut_materiel?: string | null;
date_reception_souhaitee?: string | null;
heure_reception_souhaitee?: string | null;
date_limite_restitution?: string | null;
heure_restitution_souhaitee?: string | null;
date_remise_reelle?: string | null;
date_restitution_reelle?: string | null;   
    mode_contact?: string | null;
    motif_annulation?: string | null;
};

type Props = {
    commandes: Commande[];
    filtres?: {
        statut?: string;
        recherche?: string;
    };
};

const statuts = [
    { value: 'en_attente', label: 'En attente de validation' },
    { value: 'acceptee', label: 'Acceptée' },
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'en_livraison', label: 'En cours de livraison' },
    { value: 'livree', label: 'Livrée' },
    {
        value: 'en_attente_retour_materiel',
        label: 'En attente du retour de matériel',
    },
    { value: 'terminee', label: 'Terminée' },
    { value: 'refusee', label: 'Refusée' },
    { value: 'annulee', label: 'Annulée par le client' },
];

const transitions: Record<string, string[]> = {
    en_attente: ['acceptee', 'refusee'],
    acceptee: ['en_preparation'],
    en_preparation: ['en_livraison'],
    en_livraison: ['livree'],
    livree: ['terminee', 'en_attente_retour_materiel'],
    en_attente_retour_materiel: ['terminee'],
};

const nomStatut = (valeur: string) =>
    statuts.find((statut) => statut.value === valeur)?.label ?? valeur;

const euros = (valeur: string | number) =>
    new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(Number(valeur));

const dateFR = (date: string) => {
    if (!date) return 'Non renseignée';

    const [annee, mois, jour] = date.slice(0, 10).split('-');

    if (!annee || !mois || !jour) return date;

    return `${jour}/${mois}/${annee}`;
};

export default function EmployeCommandes({
    commandes,
    filtres = {},
}: Props) {
    const [statut, setStatut] = useState(filtres.statut ?? '');
    const [recherche, setRecherche] = useState(filtres.recherche ?? '');
    const [ouverte, setOuverte] = useState<number | null>(null);
    const [enCours, setEnCours] = useState<number | null>(null);

    const [refus, setRefus] = useState<number | null>(null);
    const [modeContact, setModeContact] = useState('');
    const [motif, setMotif] = useState('');
    const [clientContacte, setClientContacte] = useState(false);

    const appliquerFiltres = (
        nouveauStatut: string,
        nouveauTexte: string
    ) => {
        router.get(
            '/employe/commandes',
            {
                statut: nouveauStatut,
                recherche: nouveauTexte,
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            }
        );
    };

    const mettreAJour = (
        commande: Commande,
        nouveauStatut: string
    ) => {
        if (enCours !== null) return;
        if (nouveauStatut === commande.statut) return;

        if (nouveauStatut === 'refusee') {
            setRefus(commande.id);
            setModeContact('');
            setMotif('');
            setClientContacte(false);
            return;
        }

        const autorises = transitions[commande.statut] ?? [];

        if (!autorises.includes(nouveauStatut)) {
            window.alert('Ce changement de statut est interdit.');
            return;
        }

        if (
            nouveauStatut === 'en_attente_retour_materiel' &&
            !commande.materiel_prete
        ) {
            window.alert(
                'Aucun prêt de matériel n’est déclaré pour cette commande.'
            );
            return;
        }

        const confirmation = window.confirm(
            `Confirmer le passage de la commande n°${commande.id} au statut « ${nomStatut(nouveauStatut)} » ?`
        );

        if (!confirmation) return;

        setEnCours(commande.id);

        router.patch(
            `/employe/commandes/${commande.id}/statut`,
            { statut: nouveauStatut },
            {
                preserveScroll: true,
                onFinish: () => setEnCours(null),
            }
        );
    };

    const confirmerRefus = (commande: Commande) => {
        if (enCours !== null) return;

        if (!clientContacte) {
            window.alert(
                'Vous devez avoir réellement contacté le client avant de refuser sa commande.'
            );
            return;
        }

        if (!modeContact || !motif.trim()) {
            window.alert(
                'Indiquez le moyen de contact et le motif du refus.'
            );
            return;
        }

        const confirmation = window.confirm(
            `Confirmer le refus de la commande n°${commande.id} ?`
        );

        if (!confirmation) return;

        setEnCours(commande.id);

        router.patch(
            `/employe/commandes/${commande.id}/statut`,
            {
                statut: 'refusee',
                mode_contact: modeContact,
                motif_annulation: motif.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRefus(null);
                    setModeContact('');
                    setMotif('');
                    setClientContacte(false);
                },
                onFinish: () => setEnCours(null),
            }
        );
    };

    return (
        <>
            <Head title="Gestion des commandes - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
                        <Link
                            href="/"
                            className="text-xl font-bold text-[#795334]"
                        >
                            Vite & Gourmand
                        </Link>

                        
<Link
    href="/"
    className="font-semibold text-[#795334] hover:underline"
>
    Retour à l'accueil
</Link>

                    </nav>
                </header>

                <div className="mx-auto max-w-6xl px-5 py-12">
                    <h1 className="text-3xl font-bold">
                        Gestion des commandes
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Consultez les commandes et suivez leur préparation,
                        leur livraison et leur clôture.
                    </p>

                    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-bold">
                            Rechercher et filtrer
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <input
                                type="search"
                                aria-label="Rechercher une commande"
                                placeholder="Nom, e-mail ou n° de commande"
                                value={recherche}
                                onChange={(e) =>
                                    setRecherche(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        appliquerFiltres(statut, recherche);
                                    }
                                }}
                                className="rounded-lg border border-gray-300 p-3 sm:col-span-2"
                            />

                            <select
                                aria-label="Filtrer par statut"
                                value={statut}
                                onChange={(e) => {
                                    setStatut(e.target.value);
                                    appliquerFiltres(
                                        e.target.value,
                                        recherche
                                    );
                                }}
                                className="rounded-lg border border-gray-300 p-3"
                            >
                                <option value="">Tous les statuts</option>

                                {statuts.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    appliquerFiltres(statut, recherche)
                                }
                                className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white"
                            >
                                Rechercher
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStatut('');
                                    setRecherche('');
                                    appliquerFiltres('', '');
                                }}
                                className="rounded-lg border px-5 py-3 font-semibold"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </section>

                    <h2 className="mt-10 text-2xl font-bold">
                        Commandes ({commandes.length})
                    </h2>

                    {commandes.length === 0 ? (
                        <div className="mt-6 rounded-2xl bg-white p-8 text-center text-gray-600">
                            Aucune commande ne correspond à votre recherche.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-5">
                            {commandes.map((commande) => {
                                const autorises =
                                    transitions[commande.statut] ?? [];

                                const choix = autorises.filter(
                                    (valeur) =>
                                        valeur !== 'refusee' &&
                                        (
                                            valeur !==
                                            'en_attente_retour_materiel' ||
                                            Boolean(commande.materiel_prete)
                                        )
                                );

                                const peutRefuser =
                                    commande.statut === 'en_attente';

                                return (
                                    <article
                                        key={commande.id}
                                        className="rounded-2xl bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-wrap justify-between gap-6">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Commande n°{commande.id}
                                                </p>

                                                <h3 className="mt-2 text-xl font-bold">
                                                    {commande.menu_titre}
                                                </h3>

                                                <p className="mt-2">
                                                    Client :{' '}
                                                    <strong>
                                                        {commande.nom_client}
                                                    </strong>
                                                </p>

                                                <p className="mt-1 text-gray-600">
                                                    {commande.nombre_personnes}{' '}
                                                    convives
                                                </p>

                                                <p className="mt-1 text-gray-600">
                                                    Livraison le{' '}
                                                    {dateFR(
                                                        commande.date_livraison
                                                    )}{' '}
                                                    à{' '}
                                                    {commande.heure_livraison.slice(
                                                        0,
                                                        5
                                                    )}
                                                </p>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-2xl font-bold text-[#795334]">
                                                    {euros(commande.total)}
                                                </p>

                                                <p className="mt-2 font-medium text-gray-600">
                                                    {nomStatut(
                                                        commande.statut
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap items-center gap-4 border-t pt-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOuverte(
                                                        ouverte === commande.id
                                                            ? null
                                                            : commande.id
                                                    )
                                                }
                                                className="rounded-lg border border-[#795334] px-5 py-3 font-semibold text-[#795334]"
                                            >
                                                {ouverte === commande.id
                                                    ? 'Masquer les détails'
                                                    : 'Voir les détails'}
                                            </button>

                                            {choix.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <label
                                                        htmlFor={`statut-${commande.id}`}
                                                        className="text-sm font-medium"
                                                    >
                                                        Nouveau statut :
                                                    </label>

                                                    <select
                                                        id={`statut-${commande.id}`}
                                                        value=""
                                                        disabled={
                                                            enCours !== null
                                                        }
                                                        onChange={(e) =>
                                                            mettreAJour(
                                                                commande,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-300 p-3"
                                                    >
                                                        <option value="">
                                                            Choisir…
                                                        </option>

                                                        {choix.map((valeur) => (
                                                            <option
                                                                key={valeur}
                                                                value={valeur}
                                                            >
                                                                {nomStatut(
                                                                    valeur
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {peutRefuser && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        mettreAJour(
                                                            commande,
                                                            'refusee'
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700"
                                                >
                                                    Refuser la commande
                                                </button>
                                            )}
                                        </div>

                                        {refus === commande.id && (
                                            <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                                                <h4 className="text-lg font-bold text-red-800">
                                                    Refuser la commande n°
                                                    {commande.id}
                                                </h4>

                                                <p className="mt-3 text-sm text-gray-700">
                                                    Contactez d'abord le client
                                                    par téléphone ou par e-mail,
                                                    puis renseignez les informations
                                                    suivantes.
                                                </p>

                                                <p className="mt-3 text-sm">
                                                    Téléphone :{' '}
                                                    <strong>
                                                        {commande.telephone}
                                                    </strong>
                                                </p>

                                                <p className="mt-1 text-sm">
                                                    E-mail :{' '}
                                                    <strong>
                                                        {commande.email_client}
                                                    </strong>
                                                </p>

                                                <label className="mt-5 flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={clientContacte}
                                                        onChange={(e) =>
                                                            setClientContacte(
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <span>
                                                        Je confirme avoir
                                                        réellement contacté
                                                        le client.
                                                    </span>
                                                </label>

                                                <label className="mt-5 block font-medium">
                                                    Moyen de contact
                                                    <select
                                                        value={modeContact}
                                                        onChange={(e) =>
                                                            setModeContact(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mt-2 block w-full rounded-lg border p-3"
                                                    >
                                                        <option value="">
                                                            Choisir…
                                                        </option>
                                                        <option value="telephone">
                                                            Téléphone
                                                        </option>
                                                        <option value="email">
                                                            E-mail
                                                        </option>
                                                    </select>
                                                </label>

                                                <label className="mt-5 block font-medium">
                                                    Motif du refus
                                                    <textarea
                                                        value={motif}
                                                        onChange={(e) =>
                                                            setMotif(
                                                                e.target.value
                                                            )
                                                        }
                                                        rows={4}
                                                        maxLength={2000}
                                                        placeholder="Expliquez le motif…"
                                                        className="mt-2 block w-full rounded-lg border p-3"
                                                    />
                                                </label>

                                                <div className="mt-5 flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            !clientContacte ||
                                                            !modeContact ||
                                                            !motif.trim() ||
                                                            enCours !== null
                                                        }
                                                        onClick={() =>
                                                            confirmerRefus(
                                                                commande
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        Confirmer le refus
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setRefus(null)
                                                        }
                                                        className="rounded-lg border px-5 py-3 font-semibold"
                                                    >
                                                        Retour
                                                    </button>
                                                </div>
                                            </section>
                                        )}

                                        {ouverte === commande.id && (
                                            <section className="mt-6 rounded-xl bg-[#faf8f4] p-5">
                                                <h4 className="mb-4 text-lg font-bold">
                                                    Détails de la commande
                                                </h4>

                                                <div className="space-y-3">
                                                    <p>
                                                        <strong>Client : </strong>
                                                        {commande.nom_client}
                                                    </p>

                                                    <p>
                                                        <strong>E-mail : </strong>
                                                        {commande.email_client}
                                                    </p>

                                                    <p>
                                                        <strong>Téléphone : </strong>
                                                        {commande.telephone}
                                                    </p>

                                                    <p>
                                                        <strong>Adresse : </strong>
                                                        {commande.adresse_livraison}
                                                        ,{' '}
                                                        {commande.code_postal}{' '}
                                                        {commande.ville}
                                                    </p>

                                                    <p>
                                                        <strong>Livraison : </strong>
                                                        {dateFR(
                                                            commande.date_livraison
                                                        )}{' '}
                                                        à{' '}
                                                        {commande.heure_livraison.slice(
                                                            0,
                                                            5
                                                        )}
                                                    </p>

                                                    <p>
                                                        <strong>Commande passée le : </strong>
                                                        {dateFR(
                                                            commande.created_at
                                                        )}
                                                    </p>

                                                    <p>
                                                        <strong>Matériel prêté : </strong>
                                                        {commande.materiel_prete
                                                            ? 'Oui'
                                                            : 'Non'}
                                                    </p>

{commande.demande_materiel_id && (
    <div className="mt-5 rounded-xl border border-[#e8ded3] bg-white p-5">
        <h4 className="mb-4 text-lg font-bold text-[#795334]">
            Demande de prêt de matériel
        </h4>

        <p>
            <strong>Statut du matériel : </strong>
            {commande.statut_materiel === 'demandee'
                ? 'En attente de validation'
                : commande.statut_materiel || 'Non renseigné'}
        </p>

        <div className="mt-4">
            <strong>Matériel demandé :</strong>

            {Object.entries(
                JSON.parse(commande.materiel_quantites || '{}') as Record<string, number>
            )
                .filter(([, quantite]) => quantite > 0)
                .map(([nom, quantite]) => (
                    <p key={nom} className="mt-1">
                        {nom.charAt(0).toUpperCase() + nom.slice(1)} : {quantite}
                    </p>
                ))}
        </div>

        <div className="mt-5 space-y-2">
            <p>
                <strong>Réception souhaitée : </strong>
                {commande.date_reception_souhaitee
                    ? dateFR(commande.date_reception_souhaitee)
                    : 'Non renseignée'}
                {' à '}
                {commande.heure_reception_souhaitee?.slice(0, 5) || '--:--'}
            </p>

            <p>
                <strong>Date limite de restitution : </strong>
                {commande.date_limite_restitution
                    ? dateFR(commande.date_limite_restitution)
                    : 'Non renseignée'}
                {' à '}
                {commande.heure_restitution_souhaitee?.slice(0, 5) || '--:--'}
            </p>

            <p>
                <strong>Remise réelle : </strong>
                {commande.date_remise_reelle || 'Pas encore effectuée'}
            </p>

            <p>
                <strong>Restitution réelle : </strong>
                {commande.date_restitution_reelle || 'Pas encore effectuée'}
            </p>
        </div>
 
{commande.statut_materiel === 'demandee' && (
    <div className="mt-5 border-t border-gray-200 pt-4">
        <button
            type="button"
            disabled={enCours !== null}
            onClick={() => {
                if (
                    !window.confirm(
                        `Confirmer la validation de la demande de matériel pour la commande n°${commande.id} ?`
                    )
                ) {
                    return;
                }

                setEnCours(commande.id);

                router.patch(
                    `/employe/commandes/${commande.id}/materiel/valider`,
                    {},
                    {
                        preserveScroll: true,
                        onFinish: () => setEnCours(null),
                    }
                );
            }}
            className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
            Valider la demande de matériel
        </button>
    </div>
)}
 
{/* BOUTON : CONFIRMER LA REMISE DU MATÉRIEL */}
{commande.statut_materiel === 'validee' && (
    <div className="mt-5 border-t border-gray-200 pt-4">
        <button
            type="button"
            disabled={enCours !== null}
            onClick={() => {
                if (
                    !window.confirm(
                        `Confirmer que le matériel de la commande n°${commande.id} a réellement été remis au client ?`
                    )
                ) {
                    return;
                }

                setEnCours(commande.id);

                router.patch(
                    `/employe/commandes/${commande.id}/materiel/remettre`,
                    {},
                    {
                        preserveScroll: true,
                        onFinish: () => setEnCours(null),
                    }
                );
            }}
            className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
            Confirmer la remise du matériel
        </button>
    </div>
)}

{/* BOUTON : CONFIRMER LA RESTITUTION DU MATÉRIEL */}
{commande.statut_materiel === 'remis' && (
    <div className="mt-5 border-t border-gray-200 pt-4">
        <button
            type="button"
            disabled={enCours !== null}
            onClick={() => {
                if (
                    !window.confirm(
                        `Confirmer que tout le matériel de la commande n°${commande.id} a réellement été restitué ? Cette action enregistrera le retour et générera un e-mail de confirmation au client.`
                    )
                ) {
                    return;
                }

                setEnCours(commande.id);

                router.patch(
                    `/employe/commandes/${commande.id}/materiel/restituer`,
                    {},
                    {
                        preserveScroll: true,
                        onFinish: () => setEnCours(null),
                    }
                );
            }}
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
            Confirmer la restitution du matériel
        </button>
    </div>
)}
      
    </div>
)}

                                                    {commande.motif_annulation && (
                                                        <p>
                                                            <strong>
                                                                Motif du refus :{' '}
                                                            </strong>
                                                            {
                                                                commande.motif_annulation
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
