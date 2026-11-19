
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type Avis = {
    id: number;
    commande_id: number;
    note: number;
    commentaire: string;
    statut: string;
    created_at: string;
    valide_le: string | null;
    client_nom: string;
    menu_titre: string;
};

type Props = {
    avis: Avis[];
};

const libelleStatut = (statut: string): string => {
    switch (statut) {
        case 'en_attente':
            return 'En attente de validation';
        case 'valide':
            return 'Validé';
        case 'refuse':
            return 'Refusé';
        default:
            return statut;
    }
};

const couleurStatut = (statut: string): string => {
    switch (statut) {
        case 'en_attente':
            return 'bg-amber-100 text-amber-800';
        case 'valide':
            return 'bg-green-100 text-green-800';
        case 'refuse':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export default function EmployeAvis({ avis }: Props) {
    const [traitement, setTraitement] = useState<number | null>(null);

    const nombreEnAttente = avis.filter(
        (element) => element.statut === 'en_attente'
    ).length;

    const nombreValides = avis.filter(
        (element) => element.statut === 'valide'
    ).length;

    const nombreRefuses = avis.filter(
        (element) => element.statut === 'refuse'
    ).length;

    const moderer = (
        element: Avis,
        nouveauStatut: 'valide' | 'refuse'
    ) => {
        if (traitement !== null) return;

        const action =
            nouveauStatut === 'valide' ? 'valider' : 'refuser';

        if (
            !window.confirm(
                `Voulez-vous vraiment ${action} l'avis n°${element.id} ?`
            )
        ) {
            return;
        }

        setTraitement(element.id);

        router.patch(
            `/employe/avis/${element.id}`,
            {
                statut: nouveauStatut,
            },
            {
                preserveScroll: true,
                onFinish: () => setTraitement(null),
            }
        );
    };

    return (
        <>
            <Head title="Gestion des avis - Vite & Gourmand" />

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
                            className="font-semibold text-[#795334] hover:underline"
                        >
                            Retour à l'accueil
                        </Link>
                    </nav>
                </header>

                <div className="mx-auto max-w-6xl px-5 py-12">
                    <p className="font-semibold uppercase tracking-widest text-[#795334]">
                        Espace employé
                    </p>

                    <h1 className="mt-3 text-3xl font-bold">
                        Gestion des avis clients
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Consultez les avis déposés par les clients,
                        puis validez ou refusez leur publication.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">
                                Avis en attente
                            </p>
                            <p className="mt-3 text-3xl font-bold text-amber-700">
                                {nombreEnAttente}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">
                                Avis validés
                            </p>
                            <p className="mt-3 text-3xl font-bold text-green-700">
                                {nombreValides}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">
                                Avis refusés
                            </p>
                            <p className="mt-3 text-3xl font-bold text-red-700">
                                {nombreRefuses}
                            </p>
                        </div>
                    </div>

                    <section className="mt-10">
                        <h2 className="text-2xl font-bold">
                            Liste des avis ({avis.length})
                        </h2>

                        {avis.length === 0 ? (
                            <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">
                                <p className="font-semibold">
                                    Aucun avis enregistré pour le moment.
                                </p>

                                <p className="mt-2 text-gray-600">
                                    Les avis déposés par les clients
                                    apparaîtront ici.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-5">
                                {avis.map((element) => (
                                    <article
                                        key={element.id}
                                        className="rounded-2xl bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Avis n°{element.id} —
                                                    Commande n°{element.commande_id}
                                                </p>

                                                <h3 className="mt-2 text-xl font-bold">
                                                    {element.menu_titre}
                                                </h3>

                                                <p className="mt-2 text-gray-600">
                                                    Client :{' '}
                                                    <strong>
                                                        {element.client_nom}
                                                    </strong>
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-4 py-2 text-sm font-semibold ${couleurStatut(
                                                    element.statut
                                                )}`}
                                            >
                                                {libelleStatut(element.statut)}
                                            </span>
                                        </div>

                                        <div
                                            className="mt-5 text-3xl tracking-wider text-amber-500"
                                            aria-label={`${element.note} étoiles sur 5`}
                                        >
                                            {'★'.repeat(element.note)}
                                            <span className="text-gray-300">
                                                {'☆'.repeat(
                                                    Math.max(
                                                        0,
                                                        5 - element.note
                                                    )
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-2 font-medium">
                                            Note : {element.note} / 5
                                        </p>

                                        <div className="mt-5 rounded-xl bg-[#faf8f4] p-5">
                                            <p className="whitespace-pre-wrap">
                                                {element.commentaire}
                                            </p>
                                        </div>

                                        {element.statut === 'en_attente' && (
                                            <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                                                <button
                                                    type="button"
                                                    disabled={traitement !== null}
                                                    onClick={() =>
                                                        moderer(
                                                            element,
                                                            'valide'
                                                        )
                                                    }
                                                    className="rounded-lg bg-[#795334] px-5 py-3 font-semibold text-white disabled:opacity-50"
                                                >
                                                    Valider l'avis
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={traitement !== null}
                                                    onClick={() =>
                                                        moderer(
                                                            element,
                                                            'refuse'
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 disabled:opacity-50"
                                                >
                                                    Refuser l'avis
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
