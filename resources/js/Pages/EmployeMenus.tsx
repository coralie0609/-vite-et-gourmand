
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Plat = {
    id: number;
    menu_id: number;
    nom: string;
    categorie: string;
    description: string | null;
    ingredients: string | null;
};

type Menu = {
    id: number;
    titre: string;
    description: string | null;
    theme: string;
    regime: string;
    personnes_min: number;
    prix: number | string;
    image: string | null;
    conditions: string | null;
    stock: number;
    plats: Plat[];
};

type Props = {
    menus: Menu[];
};

const champ =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#795334] focus:outline-none';

const bouton =
    'rounded-lg bg-[#795334] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5e3f29] disabled:cursor-not-allowed disabled:opacity-50';

function GestionPlat({ plat }: { plat: Plat }) {
    const [ouvert, setOuvert] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        nom: plat.nom ?? '',
        categorie: plat.categorie ?? '',
        description: plat.description ?? '',
        ingredients: plat.ingredients ?? '',
    });

    const enregistrer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        patch(`/employe/plats/${plat.id}`, {
            preserveScroll: true,
            onSuccess: () => setOuvert(false),
        });
    };

    const supprimer = () => {
        if (
            !window.confirm(
                `Voulez-vous vraiment supprimer le plat « ${plat.nom} » ?`
            )
        ) {
            return;
        }

        router.delete(`/employe/plats/${plat.id}`, {
            preserveScroll: true,
            onError: (erreurs) => {
                window.alert(
                    erreurs.suppression ??
                        'Impossible de supprimer ce plat.'
                );
            },
        });
    };

    return (
        <div className="rounded-xl border border-[#eadfd4] bg-[#faf7f2] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-semibold">{plat.nom}</p>
                    <p className="text-sm text-gray-500">
                        {plat.categorie}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setOuvert(!ouvert)}
                        className="rounded-lg border border-[#795334] px-3 py-2 text-sm font-semibold text-[#795334]"
                    >
                        {ouvert ? 'Fermer' : 'Modifier'}
                    </button>

                    <button
                        type="button"
                        onClick={supprimer}
                        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            {ouvert && (
                <form
                    onSubmit={enregistrer}
                    className="mt-5 grid gap-4 md:grid-cols-2"
                >
                    <label className="block text-sm font-medium">
                        Nom du plat
                        <input
                            className={`${champ} mt-1`}
                            required
                            value={data.nom}
                            onChange={(e) =>
                                setData('nom', e.target.value)
                            }
                        />
                        {errors.nom && (
                            <span className="text-red-600">{errors.nom}</span>
                        )}
                    </label>

                    <label className="block text-sm font-medium">
                        Catégorie
                        <select
                            className={`${champ} mt-1`}
                            value={data.categorie}
                            onChange={(e) =>
                                setData('categorie', e.target.value)
                            }
                            required
                        >
                            <option value="">Choisir</option>
                            {['entrée', 'plat', 'dessert'].map((categorie) => (
                                <option key={categorie} value={categorie}>
                                    {categorie}
                                </option>
                            ))}
                            {data.categorie &&
                                !['entrée', 'plat', 'dessert'].includes(
                                    data.categorie
                                ) && (
                                    <option value={data.categorie}>
                                        {data.categorie}
                                    </option>
                                )}
                        </select>
                        {errors.categorie && (
                            <span className="text-red-600">
                                {errors.categorie}
                            </span>
                        )}
                    </label>

                    <label className="block text-sm font-medium md:col-span-2">
                        Description
                        <textarea
                            className={`${champ} mt-1`}
                            rows={2}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                        {errors.description && (
                            <span className="text-red-600">
                                {errors.description}
                            </span>
                        )}
                    </label>

                    <label className="block text-sm font-medium md:col-span-2">
                        Ingrédients
                        <textarea
                            className={`${champ} mt-1`}
                            rows={2}
                            value={data.ingredients}
                            onChange={(e) =>
                                setData('ingredients', e.target.value)
                            }
                        />
                        {errors.ingredients && (
                            <span className="text-red-600">
                                {errors.ingredients}
                            </span>
                        )}
                    </label>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={bouton}
                        >
                            {processing
                                ? 'Enregistrement...'
                                : 'Enregistrer le plat'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function AjouterPlat({ menuId }: { menuId: number }) {
    const [ouvert, setOuvert] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        menu_id: menuId,
        nom: '',
        categorie: 'entrée',
        description: '',
        ingredients: '',
    });

    const ajouter = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/employe/plats', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOuvert(false);
            },
        });
    };

    return (
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setOuvert(!ouvert)}
                className="rounded-lg border border-[#795334] px-4 py-2 text-sm font-semibold text-[#795334]"
            >
                {ouvert ? 'Annuler' : '+ Ajouter un plat'}
            </button>

            {ouvert && (
                <form
                    onSubmit={ajouter}
                    className="mt-4 grid gap-4 rounded-xl bg-[#faf7f2] p-4 md:grid-cols-2"
                >
                    <label className="text-sm font-medium">
                        Nom du plat
                        <input
                            className={`${champ} mt-1`}
                            required
                            value={data.nom}
                            onChange={(e) =>
                                setData('nom', e.target.value)
                            }
                        />
                        {errors.nom && (
                            <span className="text-red-600">{errors.nom}</span>
                        )}
                    </label>

                    <label className="text-sm font-medium">
                        Catégorie
                        <select
                            className={`${champ} mt-1`}
                            value={data.categorie}
                            onChange={(e) =>
                                setData('categorie', e.target.value)
                            }
                        >
                            <option value="entrée">Entrée</option>
                            <option value="plat">Plat</option>
                            <option value="dessert">Dessert</option>
                        </select>
                        {errors.categorie && (
                            <span className="text-red-600">
                                {errors.categorie}
                            </span>
                        )}
                    </label>

                    <label className="text-sm font-medium md:col-span-2">
                        Description
                        <textarea
                            className={`${champ} mt-1`}
                            rows={2}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </label>

                    <label className="text-sm font-medium md:col-span-2">
                        Ingrédients
                        <textarea
                            className={`${champ} mt-1`}
                            rows={2}
                            value={data.ingredients}
                            onChange={(e) =>
                                setData('ingredients', e.target.value)
                            }
                        />
                    </label>

                    {errors.menu_id && (
                        <p className="text-sm text-red-600 md:col-span-2">
                            {errors.menu_id}
                        </p>
                    )}

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={bouton}
                        >
                            {processing ? 'Ajout...' : 'Ajouter ce plat'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function GestionMenu({ menu }: { menu: Menu }) {
    const [ouvert, setOuvert] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        titre: menu.titre ?? '',
        description: menu.description ?? '',
        theme: menu.theme ?? '',
        regime: menu.regime ?? '',
        personnes_min: String(menu.personnes_min ?? 1),
        prix: String(menu.prix ?? 0),
        conditions: menu.conditions ?? '',
        stock: String(menu.stock ?? 0),
    });

    const enregistrer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        patch(`/employe/menus/${menu.id}`, {
            preserveScroll: true,
            onSuccess: () => setOuvert(false),
        });
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-[#eadfd4] bg-white shadow-sm">
            <div className="border-b border-[#eadfd4] bg-[#f4ede5] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">{menu.titre}</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {menu.theme} · {menu.regime} ·{' '}
                            {Number(menu.prix).toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                            })}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            Minimum : {menu.personnes_min} personnes · Stock :{' '}
                            {menu.stock}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOuvert(!ouvert)}
                        className={bouton}
                    >
                        {ouvert ? 'Fermer' : 'Modifier le menu'}
                    </button>
                </div>
            </div>

            <div className="p-6">
                {ouvert && (
                    <form
                        onSubmit={enregistrer}
                        className="mb-8 grid gap-4 rounded-xl border border-[#eadfd4] p-5 md:grid-cols-2"
                    >
                        <label className="text-sm font-medium">
                            Titre
                            <input
                                className={`${champ} mt-1`}
                                required
                                value={data.titre}
                                onChange={(e) =>
                                    setData('titre', e.target.value)
                                }
                            />
                            {errors.titre && (
                                <span className="text-red-600">
                                    {errors.titre}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium">
                            Thème
                            <input
                                className={`${champ} mt-1`}
                                required
                                value={data.theme}
                                onChange={(e) =>
                                    setData('theme', e.target.value)
                                }
                            />
                            {errors.theme && (
                                <span className="text-red-600">
                                    {errors.theme}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium">
                            Régime
                            <input
                                className={`${champ} mt-1`}
                                required
                                value={data.regime}
                                onChange={(e) =>
                                    setData('regime', e.target.value)
                                }
                            />
                            {errors.regime && (
                                <span className="text-red-600">
                                    {errors.regime}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium">
                            Nombre minimum de personnes
                            <input
                                type="number"
                                min="1"
                                step="1"
                                className={`${champ} mt-1`}
                                required
                                value={data.personnes_min}
                                onChange={(e) =>
                                    setData('personnes_min', e.target.value)
                                }
                            />
                            {errors.personnes_min && (
                                <span className="text-red-600">
                                    {errors.personnes_min}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium">
                            Prix (€)
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={`${champ} mt-1`}
                                required
                                value={data.prix}
                                onChange={(e) =>
                                    setData('prix', e.target.value)
                                }
                            />
                            {errors.prix && (
                                <span className="text-red-600">
                                    {errors.prix}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium">
                            Stock disponible
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className={`${champ} mt-1`}
                                required
                                value={data.stock}
                                onChange={(e) =>
                                    setData('stock', e.target.value)
                                }
                            />
                            {errors.stock && (
                                <span className="text-red-600">
                                    {errors.stock}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium md:col-span-2">
                            Description du menu
                            <textarea
                                className={`${champ} mt-1`}
                                rows={3}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            {errors.description && (
                                <span className="text-red-600">
                                    {errors.description}
                                </span>
                            )}
                        </label>

                        <label className="text-sm font-medium md:col-span-2">
                            Conditions du menu
                            <textarea
                                className={`${champ} mt-1`}
                                rows={3}
                                value={data.conditions}
                                onChange={(e) =>
                                    setData('conditions', e.target.value)
                                }
                            />
                            {errors.conditions && (
                                <span className="text-red-600">
                                    {errors.conditions}
                                </span>
                            )}
                        </label>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className={bouton}
                            >
                                {processing
                                    ? 'Enregistrement...'
                                    : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                )}

                <h3 className="mb-4 text-lg font-bold">
                    Plats du menu ({menu.plats.length})
                </h3>

                <div className="space-y-3">
                    {menu.plats.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Aucun plat enregistré pour ce menu.
                        </p>
                    ) : (
                        menu.plats.map((plat) => (
                            <GestionPlat key={plat.id} plat={plat} />
                        ))
                    )}
                </div>

                <AjouterPlat menuId={menu.id} />
            </div>
        </section>
    );
}

export default function EmployeMenus({ menus }: Props) {
    return (
        <>
            <Head title="Gestion des menus - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#392f29]">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Gestion des menus et des plats
                            </h1>

                            <p className="mt-2 text-gray-600">
                                Espace réservé aux employés et administrateurs.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/employe/commandes"
                                className="font-semibold text-[#795334] hover:underline"
                            >
                                Gestion des commandes
                            </Link>

                            <Link
                                href="/"
                                className="font-semibold text-[#795334] hover:underline"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>

                    <div className="mb-8 rounded-xl border border-[#eadfd4] bg-white p-5">
                        <p className="font-semibold">
                            {menus.length} menu(s) disponible(s)
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Sélectionnez un menu pour modifier ses informations
                            ou gérer ses plats.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {menus.map((menu) => (
                            <GestionMenu key={menu.id} menu={menu} />
                        ))}
                    </div>

                    {menus.length === 0 && (
                        <p className="rounded-xl bg-white p-6 text-center">
                            Aucun menu disponible.
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
