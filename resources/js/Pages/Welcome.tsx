
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Menu = {
    id: number;
    titre: string;
    description: string;
    theme: string;
    regime: string;
    personnes: number;
    prix: number;
    image: string;
};

type AvisClient = {
    id: number;
    note: number;
    commentaire: string;
    created_at: string;
    client_nom: string;
    menu_titre: string;
};
type Horaire = {
    id: number;
    jour_numero: number;
    jour: string;
    ouverture: string | null;
    fermeture: string | null;
    ferme: boolean;
};


export default function Welcome({
    auth,
    avisClients = [],
    horaires = [],
}: {
    auth?: {
        user?: {
            role?: string;
        } | null;
    };
    avisClients?: AvisClient[];
    horaires?: Horaire[];
}) {

    const [theme, setTheme] = useState('');
    const [regime, setRegime] = useState('');
    const [prixMin, setPrixMin] = useState('');
    const [prixMax, setPrixMax] = useState('');
    const [personnes, setPersonnes] = useState('');

const [menusFiltres, setMenusFiltres] = useState<Menu[]>([]);
const [chargement, setChargement] = useState(true);
const [erreurMenus, setErreurMenus] = useState('');

   
useEffect(() => {
    const controller = new AbortController();

    const chargerMenus = async () => {
        setChargement(true);
        setErreurMenus('');

        const params = new URLSearchParams();

        if (theme) params.append('theme', theme);
        if (regime) params.append('regime', regime);
        if (prixMin) params.append('prix_min', prixMin);
        if (prixMax) params.append('prix_max', prixMax);
        if (personnes) params.append('personnes', personnes);

        try {
            const response = await fetch(
                `/api/menus?${params.toString()}`,
                {
                    signal: controller.signal,
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Impossible de récupérer les menus');
            }

            const donnees = await response.json();

            const menusRecus: Menu[] = donnees.map((menu: any) => ({
                id: menu.id,
                titre: menu.titre,
                description: menu.description,
                theme: menu.theme,
                regime: menu.regime,
                personnes: menu.personnes_min,
                prix: Number(menu.prix),
                image: menu.image,
            }));

            setMenusFiltres(menusRecus);
        } catch (error) {
            if (controller.signal.aborted) return;

            console.error(error);
            setErreurMenus('Erreur lors du chargement des menus.');
        } finally {
            if (!controller.signal.aborted) {
                setChargement(false);
            }
        }
    };

    chargerMenus();

    return () => controller.abort();
}, [theme, regime, prixMin, prixMax, personnes]);

    const reset = () => {
        setTheme('');
        setRegime('');
        setPrixMin('');
        setPrixMax('');
        setPersonnes('');
    };

    return (
        <>
            <Head title="Vite & Gourmand - Traiteur à Bordeaux" />

            <div className="min-h-screen bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                        <Link href="/" className="text-2xl font-bold text-[#795334]">
                            Vite & Gourmand
                        </Link>
                        <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
                            <a href="#accueil">Accueil</a>
                            <a href="#menus">Nos menus</a>
                            <a href="#contact">Contact</a>
                            
{auth?.user ? (
    <>
        <Link
            href="/mon-espace"
            className="font-medium text-[#795334]"
        >
            Mon espace client
        </Link>

        {(auth.user.role === 'employe' ||
            auth.user.role === 'admin') && (
            <Link
                href="/employe/commandes"
                className="rounded-lg bg-[#795334] px-4 py-2 text-white"
            >
                Gestion des commandes
            </Link>
        )}

{(auth.user.role === 'employe' ||
    auth.user.role === 'admin') && (
    <>
        <Link
            href="/employe/menus"
            className="rounded-lg bg-[#795334] px-4 py-2 text-white hover:bg-[#5e3f29]"
        >
            Gestion des menus
        </Link>

        <Link
            href="/employe/horaires"
            className="rounded-lg bg-[#795334] px-4 py-2 text-white hover:bg-[#5e3f29]"
        >
            Gestion des horaires
        </Link>
    </>
)}

{(auth.user.role === 'employe' ||
    auth.user.role === 'admin') && (
    <Link
        href="/employe/avis"
        className="rounded-lg bg-[#795334] px-4 py-2 text-white hover:bg-[#5e3f29]"
    >
        Gestion des avis
    </Link>
)}

{auth.user.role === 'admin' && (
    <Link
        href="/admin/employes"
        className="rounded-lg bg-[#795334] px-4 py-2 text-white hover:bg-[#5e3f29]"
    >
        Gestion des employés
    </Link>
)}

        <Link
            href="/logout"
            method="post"
            as="button"
            className="font-medium text-red-700"
        >
            Déconnexion
        </Link>
    </>
) : (
    <>
        <Link href="/login">Connexion</Link>

        <Link
            href="/register"
            className="rounded-lg bg-[#795334] px-4 py-2 text-white"
        >
            Inscription
        </Link>
    </>
)}

                        </nav>
                    </div>
                </header>

                <section id="accueil" className="bg-[#443326] px-6 py-20 text-center text-white">
                    <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#e2c39b]">
                        Traiteur à Bordeaux depuis 25 ans
                    </p>
                    <h1 className="mb-6 text-4xl font-bold md:text-6xl">
                        Le plaisir de bien manger
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-[#eee4d8]">
                        Julie et José vous proposent une cuisine généreuse et
                        savoureuse pour vos repas en famille et vos événements.
                    </p>
                    <a href="#menus" className="inline-block rounded-lg bg-[#d5ae79] px-8 py-3 font-bold text-[#302a25]">
                        Découvrir nos menus
                    </a>
                </section>

                <section className="mx-auto max-w-6xl px-6 py-14 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Notre savoir-faire</h2>
                    <p className="mx-auto max-w-3xl leading-8 text-gray-600">
                        Depuis 25 ans, Vite & Gourmand accompagne les Bordelais
                        dans leurs moments de partage. Notre équipe privilégie
                        la qualité, la convivialité et une cuisine préparée avec soin.
                    </p>
                </section>

                <main id="menus" className="mx-auto max-w-7xl px-6 py-12">
                    <h2 className="mb-3 text-center text-3xl font-bold">
                        Découvrez nos menus
                    </h2>
                    <p className="mb-10 text-center text-gray-600">
                        Trouvez le menu qui correspond à votre occasion.
                    </p>

                    <div className="mb-10 grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-3">
                        <select value={theme} onChange={e => setTheme(e.target.value)}
                            aria-label="Filtrer par thème" className="rounded-lg border p-3">
                            <option value="">Tous les thèmes</option>
                            <option>Noël</option>
                            <option>Pâques</option>
                        <option value="Traditionnel">Traditionnel</option>
                            <option>Événement</option>
                        </select>

                        <select value={regime} onChange={e => setRegime(e.target.value)}
                            aria-label="Filtrer par régime" className="rounded-lg border p-3">
                            <option value="">Tous les régimes</option>
                            <option>Classique</option>
                            <option>Végétarien</option>
                           <option value="Vegan">Végétalien</option>
                        </select>

                        <input type="number" min="0" placeholder="Prix minimum (€)"
                            aria-label="Prix minimum"
                            value={prixMin} onChange={e => setPrixMin(e.target.value)}
                            className="rounded-lg border p-3" />

                        <input type="number" min="0" placeholder="Prix maximum (€)"
                            aria-label="Prix maximum"
                            value={prixMax} onChange={e => setPrixMax(e.target.value)}
                            className="rounded-lg border p-3" />

                        <input type="number" min="1" placeholder="Nombre de convives"
                            aria-label="Nombre de convives"
                            value={personnes} onChange={e => setPersonnes(e.target.value)}
                            className="rounded-lg border p-3" />

                        <button onClick={reset}
                            className="rounded-lg bg-[#795334] p-3 font-medium text-white">
                            Réinitialiser les filtres
                        </button>
                    </div>

                    <p className="mb-5 text-sm text-gray-600">
                        {menusFiltres.length} menu(s) disponible(s)
                    </p>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {menusFiltres.map(menu => (
                            <article key={menu.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm">
 
<img
   



src={
    menu.titre === 'Menu Événement'
        ? '/images/menus/evenement/entree.png'
        : menu.theme === 'Noël'
          ? '/images/menus/noel/entree.png'
          : menu.theme === 'Pâques'
            ? '/images/menus/paques/entree.png'
            : menu.regime === 'Vegan'
              ? '/images/menus/vegetalien/entree.png'
              : menu.regime === 'Végétarien'
                ? '/images/menus/vegetarien/entree.png'
                : menu.id === 1
                  ? '/images/menus/tradition/entree.png'
                  : menu.image
}


    alt={menu.titre}
    className="h-52 w-full object-cover"
/>

                                <div className="p-6">
                                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-[#f1e6d7] px-3 py-1">
                                            {menu.theme}
                                        </span>
                                        <span className="rounded-full bg-green-50 px-3 py-1">
                                            {menu.regime}
                                        </span>
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold">{menu.titre}</h3>
                                    <p className="mb-5 min-h-12 text-sm text-gray-600">
                                        {menu.description}
                                    </p>
                                    <p className="text-sm">
                                        À partir de {menu.personnes} personnes
                                    </p>
                                    <p className="my-4 text-2xl font-bold text-[#795334]">
                                        {menu.prix.toFixed(2)} €
                                    </p>
                                   
<Link
    href={`/menus/${menu.id}`}
    className="mt-4 block rounded-lg bg-[#795334] px-5 py-3 text-center font-semibold text-white hover:bg-[#5e3f29]"
>
    Voir le détail du menu
</Link>

                                </div>
                            </article>
                        ))}
                    </div>

                    {menusFiltres.length === 0 && (
                        <p className="py-16 text-center text-gray-600">
                            Aucun menu ne correspond à vos critères.
                        </p>
                    )}
                </main>

              
<section className="bg-[#f1e6d7] px-6 py-14 text-center">
    <h2 className="mb-4 text-2xl font-bold">
        Les avis de nos clients
    </h2>

    <div className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Avis réellement validés */}
        {avisClients.map((avis) => (
            <article
                key={avis.id}
                className="rounded-2xl bg-white p-6 text-left shadow-sm"
            >
                <div
                    className="text-2xl text-amber-500"
                    aria-label={`${avis.note} étoiles sur 5`}
                >
                    {'★'.repeat(avis.note)}
                    <span className="text-gray-300">
                        {'☆'.repeat(Math.max(0, 5 - avis.note))}
                    </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    « {avis.commentaire} »
                </p>

                <div className="mt-5 border-t border-gray-100 pt-4">
                    <p className="font-semibold text-[#795334]">
                        {avis.client_nom}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        {avis.menu_titre}
                    </p>
                </div>
            </article>
        ))}

        {/* Exemples fictifs pour compléter les trois cartes */}
        {[
            {
                id: 'demo-traditionnel',
                note: 4,
                menu: 'Menu traditionnel',
                commentaire:
                    'Repas délicieux et portions généreuses. Livraison ponctuelle et équipe très professionnelle.',
            },
            {
                id: 'demo-vegetarien',
                note: 5,
                menu: 'Menu Végétarien',
                commentaire:
                    'Très belle découverte ! Des plats savoureux, frais et parfaitement présentés.',
            },
        ]
            .slice(0, Math.max(0, 3 - avisClients.length))
            .map((avis) => (
                <article
                    key={avis.id}
                    className="rounded-2xl bg-white p-6 text-left shadow-sm"
                >
                    <div
                        className="text-2xl text-amber-500"
                        aria-label={`${avis.note} étoiles sur 5`}
                    >
                        {'★'.repeat(avis.note)}
                        <span className="text-gray-300">
                            {'☆'.repeat(5 - avis.note)}
                        </span>
                    </div>

                    <p className="mt-4 text-gray-700">
                        « {avis.commentaire} »
                    </p>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <p className="font-semibold text-[#795334]">
                            Exemple fictif
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            {avis.menu}
                        </p>

                        <p className="mt-2 text-xs italic text-gray-500">
                            Avis de démonstration — ECF
                        </p>
                    </div>
                </article>
            ))}
    </div>

    {avisClients.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">
            Les témoignages présentés sont des exemples
            fictifs destinés à la démonstration du projet.
        </p>
    )}
</section>


                <footer id="contact" className="bg-[#30271f] px-6 py-12 text-white">
                    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="mb-4 text-xl font-bold">Vite & Gourmand</h3>
                            <p>Traiteur événementiel à Bordeaux</p>
                        </div>
                     

<div>
    <h3 className="mb-4 font-bold">Horaires d'ouverture</h3>

    <div className="space-y-1 text-sm text-gray-200">
        {horaires
            .slice()
            .sort((a, b) => a.jour_numero - b.jour_numero)
            .map((horaire) => (
                <p key={horaire.id}>
                    {horaire.jour} :{' '}
                    {horaire.ferme
                        ? 'Fermé'
                        : horaire.ouverture && horaire.fermeture
                          ? `${horaire.ouverture.slice(0, 5)} - ${horaire.fermeture.slice(0, 5)}`
                          : 'Horaires indisponibles'}
                </p>
            ))}
    </div>

    <p className="mt-3 text-xs text-gray-300">
        Prestations événementielles sur réservation.
    </p>
</div>


                       <div>
    <h3 className="mb-4 font-bold">Informations</h3>

    <div className="flex flex-col gap-2">
        <a
            href="/contact"
            className="text-gray-200 hover:text-white hover:underline"
        >
            Contact
        </a>

        <a
            href="/mentions-legales"
            className="text-gray-200 hover:text-white hover:underline"
        >
            Mentions légales
        </a>

        <a
            href="/cgv"
            className="text-gray-200 hover:text-white hover:underline"
        >
            Conditions générales de vente
        </a>
    </div>
</div>
                    </div>
                    <p className="mt-10 text-center text-xs text-gray-400">
                        © 2026 Vite & Gourmand — Projet pédagogique ECF
                    </p>
                </footer>
            </div>
        </>
    );
}
