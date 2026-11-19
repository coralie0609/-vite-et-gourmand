import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AvisClientForm from '@/Components/AvisClientForm';

type HistoriqueStatut = {
    id: number;
    ancien_statut: string | null;
    nouveau_statut: string;
    date_heure_fr: string;
};

type Commande = {
    id: number;
    menu_id: number;
    menu_titre: string;
    telephone: string;
    nombre_personnes: number;
    date_livraison: string;
    heure_livraison: string;
    adresse_livraison: string;
    code_postal: string;
    ville: string;
    distance_km: string | number;
    prix_menu: string | number;
    reduction: string | number;
    frais_livraison: string | number;
    total: string | number;
    statut: string;
    created_at: string;
    updated_at: string;
    menu_prix: string | number;
    personnes_min: number;
    menu_conditions?: string | null;
    historique?: HistoriqueStatut[];
    avis_deja_depose?: boolean;
};

type Props = {
    commandes: Commande[];
};

const euros = (valeur: string | number): string =>
    new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(Number(valeur));

const statutLabel = (statut: string): string => {
    const labels: Record<string, string> = {
        en_attente: 'En attente de validation',
        acceptee: 'Acceptée',
        en_preparation: 'En préparation',
        en_livraison: 'En cours de livraison',
        livree: 'Livrée',
        en_attente_retour_materiel:
            'En attente du retour de matériel',
        terminee: 'Terminée',
        annulee: 'Annulée',
        refusee: 'Refusée',
    };

    return labels[statut] ?? statut.replace(/_/g, ' ');
};

const statutStyle = (statut: string): string => {
    if (statut === 'en_attente') {
        return 'bg-amber-100 text-amber-800';
    }

    if (statut === 'annulee' || statut === 'refusee') {
        return 'bg-red-100 text-red-700';
    }

    if (statut === 'terminee' || statut === 'livree') {
        return 'bg-green-100 text-green-800';
    }

    return 'bg-blue-100 text-blue-800';
};

const formatDate = (date: string): string => {
    if (!date) return 'Non renseignée';

    const [annee, mois, jour] = date.slice(0, 10).split('-');

    if (!annee || !mois || !jour) return date;

    return `${jour}/${mois}/${annee}`;
};

function FormulaireModification({
    commande,
    fermer,
}: {
    commande: Commande;
    fermer: () => void;
}) {
    const {
        data,
        setData,
        patch,
        processing,
        errors,
    } = useForm({
        telephone: commande.telephone ?? '',
        adresse_livraison: commande.adresse_livraison,
        code_postal: commande.code_postal,
        ville: commande.ville,
        date_livraison: commande.date_livraison.slice(0, 10),
        heure_livraison: commande.heure_livraison.slice(0, 5),
        nombre_personnes: String(commande.nombre_personnes),
        distance_km: String(commande.distance_km ?? 0),
    });

    const minimum = Number(commande.personnes_min);
    const quantite = Number(data.nombre_personnes);
    const distanceSaisie = Number(data.distance_km);

    const villeNormalisee = data.ville
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const bordeaux = villeNormalisee === 'bordeaux';

    const distance = bordeaux ? 0 : distanceSaisie;

    const calculValide =
        minimum > 0 &&
        Number.isInteger(quantite) &&
        quantite >= minimum &&
        Number.isFinite(distance) &&
        distance >= 0 &&
        (bordeaux || distance > 0);

    const prixMenu = calculValide
        ? Math.round(
              (Number(commande.menu_prix) / minimum) *
                  quantite *
                  100
          ) / 100
        : 0;

    const reduction =
        calculValide && quantite >= minimum + 5
            ? Math.round(prixMenu * 0.1 * 100) / 100
            : 0;

    const fraisLivraison = calculValide
        ? Math.round((5 + 0.59 * distance) * 100) / 100
        : 0;

    const total = calculValide
        ? Math.round(
              (prixMenu - reduction + fraisLivraison) * 100
          ) / 100
        : 0;

    const champ =
        'mt-1 w-full rounded-lg border border-gray-300 ' +
        'px-4 py-3 focus:border-[#795334] focus:ring-[#795334]';

    const enregistrer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!calculValide || processing) return;

        patch(`/mes-commandes/${commande.id}/modifier`, {
            preserveScroll: true,
            onSuccess: () => fermer(),
        });
    };

    return (
        <section className="mt-6 rounded-xl border border-[#dcc6b0] bg-[#faf8f4] p-5">
            <h4 className="text-xl font-bold text-[#795334]">
                Modifier la commande n°{commande.id}
            </h4>

            <p className="mt-2 text-sm text-gray-600">
                Vous pouvez modifier votre commande tant
                qu'elle n'a pas été acceptée.
            </p>

            <div className="mt-4 rounded-lg bg-white p-4">
                <strong>Menu conservé : </strong>
                {commande.menu_titre}

                <p className="mt-2 text-sm text-gray-600">
                    Minimum : {minimum} convives.
                    Réduction de 10 % dès {minimum + 5} convives.
                </p>

                {commande.menu_conditions && (
                    <p className="mt-2 text-sm text-amber-800">
                        Conditions du menu :{' '}
                        {commande.menu_conditions}
                    </p>
                )}
            </div>

            <form onSubmit={enregistrer} className="mt-5 space-y-5">
                <div>
                    <label className="block font-medium">
                        Téléphone
                        <input
                            type="tel"
                            required
                            value={data.telephone}
                            onChange={(e) =>
                                setData('telephone', e.target.value)
                            }
                            className={champ}
                        />
                    </label>

                    {errors.telephone && (
                        <p className="mt-1 text-sm text-red-700">
                            {errors.telephone}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">
                        Adresse de livraison
                        <input
                            type="text"
                            required
                            value={data.adresse_livraison}
                            onChange={(e) =>
                                setData(
                                    'adresse_livraison',
                                    e.target.value
                                )
                            }
                            className={champ}
                        />
                    </label>

                    {errors.adresse_livraison && (
                        <p className="mt-1 text-sm text-red-700">
                            {errors.adresse_livraison}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block font-medium">
                            Code postal
                            <input
                                type="text"
                                required
                                value={data.code_postal}
                                onChange={(e) =>
                                    setData(
                                        'code_postal',
                                        e.target.value
                                    )
                                }
                                className={champ}
                            />
                        </label>

                        {errors.code_postal && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.code_postal}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium">
                            Ville
                            <input
                                type="text"
                                required
                                value={data.ville}
                                onChange={(e) =>
                                    setData('ville', e.target.value)
                                }
                                className={champ}
                            />
                        </label>

                        {errors.ville && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.ville}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block font-medium">
                            Date de livraison
                            <input
                                type="date"
                                required
                                value={data.date_livraison}
                                onChange={(e) =>
                                    setData(
                                        'date_livraison',
                                        e.target.value
                                    )
                                }
                                className={champ}
                            />
                        </label>

                        {errors.date_livraison && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.date_livraison}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium">
                            Heure de livraison
                            <input
                                type="time"
                                required
                                value={data.heure_livraison}
                                onChange={(e) =>
                                    setData(
                                        'heure_livraison',
                                        e.target.value
                                    )
                                }
                                className={champ}
                            />
                        </label>

                        {errors.heure_livraison && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.heure_livraison}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block font-medium">
                            Nombre de convives
                            <input
                                type="number"
                                min={minimum}
                                step="1"
                                required
                                value={data.nombre_personnes}
                                onChange={(e) =>
                                    setData(
                                        'nombre_personnes',
                                        e.target.value
                                    )
                                }
                                className={champ}
                            />
                        </label>

                        {errors.nombre_personnes && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.nombre_personnes}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium">
                            Distance depuis Bordeaux (km)
                            <input
                                type="number"
                                min="0"
                                max="99999"
                                step="0.01"
                                required
                                disabled={bordeaux}
                                value={
                                    bordeaux
                                        ? '0'
                                        : data.distance_km
                                }
                                onChange={(e) =>
                                    setData(
                                        'distance_km',
                                        e.target.value
                                    )
                                }
                                className={champ}
                            />
                        </label>

                        <p className="mt-1 text-xs text-gray-600">
                            Distance déclarée, à vérifier par le traiteur.
                        </p>

                        {errors.distance_km && (
                            <p className="mt-1 text-sm text-red-700">
                                {errors.distance_km}
                            </p>
                        )}
                    </div>
                </div>

              




                <div className="rounded-xl bg-white p-5">
                    <h5 className="mb-4 text-lg font-bold">
                        Nouveau récapitulatif
                    </h5>

                    {calculValide ? (
                        <div className="space-y-3">
                            <div className="flex justify-between gap-3">
                                <span>Prix des menus</span>
                                <strong>{euros(prixMenu)}</strong>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Réduction</span>
                                <strong className="text-green-700">
                                    {reduction > 0
                                        ? `-${euros(reduction)}`
                                        : euros(0)}
                                </strong>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span>Livraison</span>
                                <strong>
                                    {euros(fraisLivraison)}
                                </strong>
                            </div>

                            <div className="flex justify-between gap-3 border-t pt-3 text-xl font-bold text-[#795334]">
                                <span>Nouveau total</span>
                                <span>{euros(total)}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-red-700">
                            Vérifiez le nombre minimum de convives
                            et la distance de livraison.
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={processing || !calculValide}
                        className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {processing
                            ? 'Enregistrement...'
                            : 'Enregistrer les modifications'}
                    </button>

                    <button
                        type="button"
                        onClick={fermer}
                        disabled={processing}
                        className="rounded-lg border border-gray-300 px-5 py-3 font-semibold"
                    >
                        Retour
                    </button>
                </div>
            </form>
        </section>
    );
}

export default function EspaceClient({ commandes }: Props) {
    const [ouverte, setOuverte] = useState<number | null>(null);
    const [modification, setModification] =
        useState<number | null>(null);
    const [annulation, setAnnulation] =
        useState<number | null>(null);

    const annuler = (commande: Commande) => {
        if (annulation !== null) return;

        const confirmation = window.confirm(
            `Voulez-vous vraiment annuler la commande n°${commande.id} ?`
        );

        if (!confirmation) return;

        setAnnulation(commande.id);

        router.patch(
            `/mes-commandes/${commande.id}/annuler`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setAnnulation(null),
            }
        );
    };

    return (
        <>
            <Head title="Mon espace client - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                        <Link
                            href="/"
                            className="text-xl font-bold text-[#795334]"
                        >
                            Vite & Gourmand
                        </Link>

                        <Link
                            href="/"
                            className="font-medium text-[#795334] hover:underline"
                        >
                            Retour à l'accueil
                        </Link>
                    </nav>
                </header>

                <div className="mx-auto max-w-5xl px-5 py-12">
                    <h1 className="text-3xl font-bold">
                        Mon espace client
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Retrouvez vos commandes et suivez leur avancement.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">
                            Mes commandes
                        </h2>

                        <Link
                            href="/#menus"
                            className="rounded-xl bg-[#795334] px-5 py-3 font-semibold text-white"
                        >
                            Commander un menu
                        </Link>
                    </div>

                    {commandes.length === 0 ? (
                        <div className="mt-7 rounded-2xl bg-white p-10 text-center shadow-sm">
                            <p className="text-lg font-semibold">
                                Vous n'avez pas encore de commande.
                            </p>

                            <p className="mt-3 text-gray-600">
                                Découvrez nos menus pour votre prochain événement.
                            </p>

                            <Link
                                href="/#menus"
                                className="mt-6 inline-block rounded-xl bg-[#795334] px-6 py-3 text-white"
                            >
                                Découvrir les menus
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-7 space-y-5">
                            {commandes.map((commande) => {
                                const historique =
                                    commande.historique ?? [];

                                const enAttente =
                                    commande.statut === 'en_attente';

                                return (
                                    <article
                                        key={commande.id}
                                        className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-5">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Commande n°{commande.id}
                                                </p>

                                                <h3 className="mt-2 text-xl font-bold">
                                                    {commande.menu_titre}
                                                </h3>

                                                <p className="mt-2 text-gray-600">
                                                    {commande.nombre_personnes}{' '}
                                                    convives
                                                </p>

                                                <p className="mt-1 text-gray-600">
                                                    Livraison prévue :{' '}
                                                    {formatDate(
                                                        commande.date_livraison
                                                    )}{' '}
                                                    à{' '}
                                                    {commande.heure_livraison.slice(
                                                        0,
                                                        5
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${statutStyle(
                                                        commande.statut
                                                    )}`}
                                                >
                                                    {statutLabel(
                                                        commande.statut
                                                    )}
                                                </span>

                                                <p className="mt-4 text-xl font-bold text-[#795334]">
                                                    {euros(commande.total)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOuverte(
                                                        ouverte ===
                                                            commande.id
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

                                            {enAttente && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setModification(
                                                                modification ===
                                                                    commande.id
                                                                    ? null
                                                                    : commande.id
                                                            )
                                                        }
                                                        className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white"
                                                    >
                                                        {modification ===
                                                        commande.id
                                                            ? 'Fermer la modification'
                                                            : 'Modifier ma commande'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            annuler(commande)
                                                        }
                                                        disabled={
                                                            annulation !== null
                                                        }
                                                        className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 disabled:opacity-50"
                                                    >
                                                        {annulation ===
                                                        commande.id
                                                            ? 'Annulation...'
                                                            : 'Annuler la commande'}
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {enAttente &&
                                            modification === commande.id && (
                                                <FormulaireModification
                                                    key={commande.id}
                                                    commande={commande}
                                                    fermer={() =>
                                                        setModification(null)
                                                    }
                                                />
                                            )}

{commande.statut === 'terminee' &&
    !commande.avis_deja_depose && (
        <AvisClientForm commandeId={commande.id} />
    )}

                                        {ouverte === commande.id && (
                                            <div className="mt-6 space-y-6">
                                                <section className="rounded-xl bg-[#faf8f4] p-5">
                                                    <h4 className="mb-4 text-lg font-bold">
                                                        Détails de la commande
                                                    </h4>

                                                    <div className="space-y-3">
                                                        <p>
                                                            <strong>
                                                                Menu :{' '}
                                                            </strong>
                                                            {commande.menu_titre}
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Livraison :{' '}
                                                            </strong>
                                                            {formatDate(
                                                                commande.date_livraison
                                                            )}{' '}
                                                            à{' '}
                                                            {commande.heure_livraison.slice(
                                                                0,
                                                                5
                                                            )}
                                                        </p>

                                                        <p>
                                                            <strong>
                                                                Adresse :{' '}
                                                            </strong>
                                                            {commande.adresse_livraison}
                                                            ,{' '}
                                                            {commande.code_postal}{' '}
                                                            {commande.ville}
                                                        </p>

                                                        <hr />

                                                        <div className="flex justify-between gap-3">
                                                            <span>
                                                                Prix des menus
                                                            </span>
                                                            <strong>
                                                                {euros(
                                                                    commande.prix_menu
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <div className="flex justify-between gap-3">
                                                            <span>
                                                                Réduction
                                                            </span>
                                                            <strong>
                                                                {Number(
                                                                    commande.reduction
                                                                ) > 0
                                                                    ? `-${euros(
                                                                          commande.reduction
                                                                      )}`
                                                                    : euros(0)}
                                                            </strong>
                                                        </div>

                                                        <div className="flex justify-between gap-3">
                                                            <span>
                                                                Frais de livraison
                                                            </span>
                                                            <strong>
                                                                {euros(
                                                                    commande.frais_livraison
                                                                )}
                                                            </strong>
                                                        </div>

                                                        <hr />

                                                        <div className="flex justify-between gap-3 text-xl font-bold text-[#795334]">
                                                            <span>Total</span>
                                                            <span>
                                                                {euros(
                                                                    commande.total
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </section>

                                                <section className="rounded-xl border border-gray-200 bg-white p-5">
                                                    <h4 className="text-lg font-bold">
                                                        Suivi de ma commande
                                                    </h4>

                                                    <p className="mt-2 text-sm text-gray-600">
                                                        Retrouvez les étapes
                                                        de votre commande,
                                                        avec leurs dates
                                                        et heures françaises.
                                                    </p>

                                                    {historique.length === 0 ? (
                                                        <p className="mt-5 rounded-lg bg-[#faf8f4] p-4 text-gray-600">
                                                            Aucun changement
                                                            de statut enregistré
                                                            pour le moment.
                                                        </p>
                                                    ) : (
                                                        <ol className="mt-6 space-y-0">
                                                            {historique.map(
                                                                (
                                                                    evenement,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            evenement.id
                                                                        }
                                                                        className="flex gap-4"
                                                                    >
                                                                        <div className="flex flex-col items-center">
                                                                            <span
                                                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#795334] font-bold text-white"
                                                                                aria-hidden="true"
                                                                            >
                                                                                ✓
                                                                            </span>

                                                                            {index <
                                                                                historique.length -
                                                                                    1 && (
                                                                                <span
                                                                                    className="min-h-8 w-0.5 flex-1 bg-[#d9c4b1]"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        <div className="pb-7">
                                                                            <p className="font-bold text-[#795334]">
                                                                                {statutLabel(
                                                                                    evenement.nouveau_statut
                                                                                )}
                                                                            </p>

                                                                            <p className="mt-1 text-sm text-gray-600">
                                                                                {
                                                                                    evenement.date_heure_fr
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ol>
                                                    )}

                                                    <div className="mt-3 rounded-lg bg-[#faf8f4] p-4">
                                                        <p className="text-sm text-gray-600">
                                                            Statut actuel
                                                        </p>

                                                        <p className="mt-1 font-semibold">
                                                            {statutLabel(
                                                                commande.statut
                                                            )}
                                                        </p>
                                                    </div>
                                                </section>
                                            </div>
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
