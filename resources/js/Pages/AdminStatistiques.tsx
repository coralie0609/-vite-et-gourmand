
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type StatistiqueMenu = {
    menu: string;
    nombre: number;
};

type Menu = {
    id: number;
    titre: string;
};

type Filtres = {
    menu_id: string | number | null;
    date_debut: string | null;
    date_fin: string | null;
};

type Props = {
    parMenu: StatistiqueMenu[];
    chiffreAffaires: number;
    nombreCommandes: number;
    menus: Menu[];
    filtres: Filtres;
};

export default function AdminStatistiques({
    parMenu,
    chiffreAffaires,
    nombreCommandes,
    menus,
    filtres,
}: Props) {
    const [menuId, setMenuId] = useState(
        String(filtres.menu_id ?? '')
    );

    const [dateDebut, setDateDebut] = useState(
        filtres.date_debut ?? ''
    );

    const [dateFin, setDateFin] = useState(
        filtres.date_fin ?? ''
    );

    const montantFR = (montant: number) => {
        return Number(montant).toLocaleString('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        });
    };

    const rechercher = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            '/admin/statistiques',
            {
                menu_id: menuId,
                date_debut: dateDebut,
                date_fin: dateFin,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const reinitialiser = () => {
        setMenuId('');
        setDateDebut('');
        setDateFin('');

        router.get('/admin/statistiques');
    };

    const maximum = Math.max(
        1,
        ...parMenu.map((statistique) => statistique.nombre)
    );

    const totalGraphique = parMenu.reduce(
        (total, statistique) => total + statistique.nombre,
        0
    );

    return (
        <>
            <Head title="Statistiques administrateur - Vite & Gourmand" />

            <div className="min-h-screen bg-[#faf7f2] text-[#392f29]">
                <header className="border-b border-[#e8ded3] bg-white">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                        <Link
                            href="/"
                            className="text-xl font-bold text-[#795334]"
                        >
                            Vite & Gourmand
                        </Link>

                        <Link
                            href="/"
                            className="text-sm font-medium text-[#795334] hover:underline"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-5 py-10">
                    <div className="mb-8">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#946d4c]">
                            Espace administrateur
                        </p>

                        <h1 className="text-3xl font-bold">
                            Statistiques des commandes
                        </h1>

                        <p className="mt-3 text-gray-600">
                            Suivez les commandes par menu et analysez
                            le chiffre d'affaires de Vite & Gourmand.
                        </p>
                    </div>

                    <div className="mb-8 grid gap-5 md:grid-cols-2">
                        <div className="rounded-2xl border border-[#eadfd4] bg-white p-7 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Chiffre d'affaires
                            </p>

                            <p className="mt-3 text-4xl font-bold text-[#795334]">
                                {montantFR(chiffreAffaires)}
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                                Selon le menu et la période sélectionnés.
                                Commandes refusées exclues.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#eadfd4] bg-white p-7 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Nombre de commandes
                            </p>

                            <p className="mt-3 text-4xl font-bold text-[#795334]">
                                {nombreCommandes}
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                                Commandes correspondant aux filtres.
                            </p>
                        </div>
                    </div>

                    <section className="mb-8 rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-bold">
                            Filtrer le chiffre d'affaires
                        </h2>

                        <form
                            onSubmit={rechercher}
                            className="grid gap-5 md:grid-cols-3"
                        >
                            <div>
                                <label
                                    htmlFor="menu"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Menu
                                </label>

                                <select
                                    id="menu"
                                    value={menuId}
                                    onChange={(e) =>
                                        setMenuId(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
                                >
                                    <option value="">
                                        Tous les menus
                                    </option>

                                    {menus.map((menu) => (
                                        <option
                                            key={menu.id}
                                            value={menu.id}
                                        >
                                            {menu.titre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="dateDebut"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Date de début
                                </label>

                                <input
                                    id="dateDebut"
                                    type="date"
                                    value={dateDebut}
                                    onChange={(e) =>
                                        setDateDebut(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="dateFin"
                                    className="mb-2 block text-sm font-semibold"
                                >
                                    Date de fin
                                </label>

                                <input
                                    id="dateFin"
                                    type="date"
                                    min={dateDebut || undefined}
                                    value={dateFin}
                                    onChange={(e) =>
                                        setDateFin(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 md:col-span-3">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#624127]"
                                >
                                    Afficher les statistiques
                                </button>

                                <button
                                    type="button"
                                    onClick={reinitialiser}
                                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold hover:bg-gray-50"
                                >
                                    Réinitialiser
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-[#eadfd4] bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">
                            Nombre de commandes par menu
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Graphique alimenté par MongoDB Atlas.
                            Commandes refusées exclues.
                        </p>

                        <div className="mt-5 rounded-xl bg-[#f6efe7] p-5">
                            <p className="text-sm font-medium text-gray-600">
                                Total des commandes du graphique
                            </p>

                            <p className="mt-1 text-3xl font-bold text-[#795334]">
                                {totalGraphique}
                            </p>
                        </div>

                        {parMenu.length === 0 ? (
                            <p className="mt-8 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
                                Aucune commande disponible pour le graphique.
                            </p>
                        ) : (
                            <div
                                className="mt-8 space-y-6"
                                role="img"
                                aria-label="Graphique du nombre de commandes par menu"
                            >
                                {parMenu.map((statistique) => {
                                    const largeur =
                                        (statistique.nombre / maximum) * 100;

                                    return (
                                        <div key={statistique.menu}>
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <span className="font-semibold">
                                                    {statistique.menu}
                                                </span>

                                                <span className="font-bold text-[#795334]">
                                                    {statistique.nombre}
                                                </span>
                                            </div>

                                            <div className="h-7 overflow-hidden rounded-lg bg-[#eee6df]">
                                                <div
                                                    className="h-full rounded-lg bg-[#795334]"
                                                   style={{
    width: `${largeur}%`,
    minWidth: '4px',
    backgroundColor: '#795334',
}}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Vite & Gourmand — Tableau de bord administrateur
                    </div>
                </main>
            </div>
        </>
    );
}
