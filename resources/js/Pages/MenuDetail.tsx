
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';


type Allergene = {
    id: number;
    nom: string;
};

type Plat = {
    id: number;
    nom: string;
    categorie: string;
    description: string | null;
    ingredients: string | null;
    allergenes: Allergene[];
    image?: string;
};

type Menu = {
    id: number;
    titre: string;
    description: string;
    theme: string;
    regime: string;
    personnes_min: number;
    prix: string;
    image: string | null;
    conditions: string | null;
    stock: number;
    plats: Plat[];
};

export default function MenuDetail() {
   

const page = usePage();
const id = Number(page.props.id);
const auth = page.props.auth as {
    user: { id: number } | null;
} | undefined;



    const [menu, setMenu] = useState<Menu | null>(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetch(`/api/menus/${id}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Menu introuvable');
                }
                return response.json();
            })
            .then(data => {
                setMenu(data);
                setChargement(false);
            })
            .catch(error => {
                if (controller.signal.aborted) return;
                setErreur(error.message);
                setChargement(false);
            });

        return () => controller.abort();
    }, [id]);

    
const commander = () => {
    if (!menu || menu.stock <= 0) return;

    window.location.href = `/commandes/creer?menu=${menu.id}`;
};


    return (
        <>
            <Head title={menu ? menu.titre : 'Détail du menu'} />

            <div className="min-h-screen bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
                        <Link href="/" className="text-2xl font-bold text-[#795334]">
                            Vite & Gourmand
                        </Link>
                        <Link href="/#menus" className="font-medium">
                            Retour aux menus
                        </Link>
                    </nav>
                </header>

                <main className="mx-auto max-w-5xl px-6 py-12">
                    {chargement && (
                        <p role="status" className="text-center">
                            Chargement du menu...
                        </p>
                    )}

                    {erreur && (
                        <div role="alert" className="rounded-lg bg-red-50 p-6 text-red-700">
                            {erreur}
                        </div>
                    )}

                    
{menu && !chargement && (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {menu.titre !== 'Menu traditionnel' &&
            menu.regime !== 'Vegan' &&
            menu.regime !== 'Végétarien' &&
            menu.theme !== 'Pâques' &&
            menu.theme !== 'Noël' &&
menu.titre !== 'Menu Événement' &&

            menu.image && (
                <img
                    src={menu.image}
                    alt={menu.titre}
                    className="h-72 w-full object-cover md:h-96"
                />
            )}



                            <div className="p-6 md:p-10">
                                <div className="mb-4 flex flex-wrap gap-3">
                                    <span className="rounded-full bg-[#f1e6d7] px-4 py-2 text-sm">
                                        {menu.theme}
                                    </span>
                                    <span className="rounded-full bg-green-50 px-4 py-2 text-sm">
                                        {menu.regime === 'Vegan' ? 'Végétalien' : menu.regime}
                                    </span>
                                </div>

                                <h1 className="mb-5 text-3xl font-bold md:text-4xl">
                                    {menu.titre}
                                </h1>

                                <p className="mb-8 text-lg leading-8 text-gray-600">
                                    {menu.description}
                                </p>

                                <div className="mb-8 grid gap-5 rounded-xl bg-[#faf8f4] p-6 sm:grid-cols-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Prix du menu</p>
                                        <p className="text-2xl font-bold text-[#795334]">
                                            {Number(menu.prix).toFixed(2)} €
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Minimum</p>
                                        <p className="text-xl font-semibold">
                                            {menu.personnes_min} personnes
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Disponibilité</p>
                                        <p className="text-xl font-semibold">
                                            {menu.stock > 0
                                                ? `${menu.stock} commande(s)`
                                                : 'Épuisé'}
                                        </p>
                                    </div>
                                </div>

                                <section className="mb-8 rounded-xl border-2 border-amber-300 bg-amber-50 p-6">
                                    <h2 className="mb-3 text-xl font-bold">
                                        Conditions importantes du menu
                                    </h2>
                                    <p className="leading-7">
                                        {menu.conditions || 'Conditions à préciser.'}
                                    </p>
                                </section>

                               
<section className="mb-8">
    <h2 className="mb-5 text-2xl font-bold">
        Composition et allergènes
    </h2>

    {menu.plats && menu.plats.length > 0 ? (
       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {menu.plats.map((plat) => (
                <div
                    key={plat.id}
                    className="rounded-xl border border-gray-200 bg-[#faf8f4] p-5"
                >
                 





{(menu.id === 1 || menu.regime === 'Vegan' || menu.regime === 'Végétarien' || menu.theme === 'Pâques' || menu.theme === 'Noël' || menu.titre === 'Menu Événement') && (



    <img
        src={`/images/menus/${
           


menu.titre === 'Menu Événement'
    ? 'evenement'
    : menu.theme === 'Noël'
      ? 'noel'
      : menu.theme === 'Pâques'
        ? 'paques'
        : menu.regime === 'Vegan'
          ? 'vegetalien'
          : menu.regime === 'Végétarien'
            ? 'vegetarien'
            : 'tradition'

        }/${
            plat.categorie === 'Entrée'
                ? 'entree'
                : plat.categorie === 'Plat'
                  ? 'plat'
                  : 'dessert'
        }.png`}
        alt={plat.nom}
        className="mb-4 h-48 w-full rounded-lg object-cover"
    />
)}


   
                    <span className="mb-2 inline-block rounded-full bg-[#f1e6d7] px-3 py-1 text-sm font-semibold">
                        {plat.categorie}
                    </span>

                    <h3 className="mb-2 text-lg font-bold">
                        {plat.nom}
                    </h3>

                    <p className="mb-3 text-sm text-gray-600">
                        <strong>Ingrédients : </strong>
                        {plat.ingredients || 'Non renseignés'}
                    </p>

                    <div className="text-sm">
                        <strong>Allergènes : </strong>

                        {plat.allergenes.length > 0 ? (
                            <span className="font-medium text-amber-800">
                                {plat.allergenes
                                    .map((allergene) => allergene.nom)
                                    .join(', ')}
                            </span>
                        ) : (
                            <span className="text-gray-600">
                                Aucun allergène renseigné
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <p className="text-gray-600">
            Composition non disponible.
        </p>
    )}

    <p className="mt-4 text-xs text-gray-500">
        L'absence d'allergène
        renseigné ne garantit pas l'absence de traces.
    </p>
</section>


                                <button
                                    type="button"
                                    onClick={commander}
                                    disabled={menu.stock <= 0}
                                    className="w-full rounded-xl bg-[#795334] px-8 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {menu.stock > 0
                                        ? 'Commander ce menu'
                                        : 'Menu indisponible'}
                                </button>

                                <p className="mt-4 text-center text-sm text-gray-500">
                                    Un compte client est nécessaire pour commander.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
