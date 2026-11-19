
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Menu = {
    id: number;
    titre: string;
    prix: string | number;
    personnes_min: number;
    stock: number;
    conditions: string | null;
};

type Client = {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    code_postal: string;
    ville: string;
};

type Confirmation = {
    id: number;
    menu_titre: string;
    nombre_personnes: number;
    date_livraison: string;
    heure_livraison: string;
    adresse_livraison: string;
    code_postal: string;
    ville: string;
    prix_menu: string | number;
    reduction: string | number;
    frais_livraison: string | number;
    total: string | number;
    statut: string;
    materiel_demande?: boolean;
    date_reception_materiel?: string | null;
    date_limite_restitution?: string | null;
    heure_reception_materiel?: string | null;
heure_restitution_materiel?: string | null;
    materiel_quantites?: Partial<QuantitesMateriel>;
};

type Props = {
    menu?: Menu;
    client?: Client;
    confirmation?: Confirmation;
};

type TypeMateriel =
    | 'assiettes'
    | 'verres'
    | 'couverts'
    | 'tables'
    | 'chaises'
    | 'bancs';

type QuantitesMateriel = Record<TypeMateriel, number>;

const listeMateriel: {
    cle: TypeMateriel;
    nom: string;
}[] = [
    { cle: 'assiettes', nom: 'Assiettes' },
    { cle: 'verres', nom: 'Verres' },
    { cle: 'couverts', nom: 'Couverts' },
    { cle: 'tables', nom: 'Tables' },
    { cle: 'chaises', nom: 'Chaises' },
    { cle: 'bancs', nom: 'Bancs' },
];

const quantitesInitiales: QuantitesMateriel = {
    assiettes: 0,
    verres: 0,
    couverts: 0,
    tables: 0,
    chaises: 0,
    bancs: 0,
};

const euros = (montant: number) =>
    new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(montant);

// Conversion d'une date YYYY-MM-DD sans décalage horaire.
function lireDate(valeur: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
        return null;
    }

    const [annee, mois, jour] = valeur.split('-').map(Number);

    const date = new Date(annee, mois - 1, jour, 12, 0, 0);

    if (
        date.getFullYear() !== annee ||
        date.getMonth() !== mois - 1 ||
        date.getDate() !== jour
    ) {
        return null;
    }

    return date;
}

function dateISO(date: Date): string {
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const jour = String(date.getDate()).padStart(2, '0');

    return `${annee}-${mois}-${jour}`;
}

function dateFrancaise(valeur: string): string {
    const date = lireDate(valeur);

    if (!date) {
        return 'À déterminer';
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

// Date du dimanche de Pâques (calendrier grégorien).
function dimanchePaques(annee: number): Date {
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k + 7) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);

    const mois = Math.floor(
        (h + l - 7 * m + 114) / 31
    );

    const jour =
        ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(annee, mois - 1, jour, 12);
}

function ajouterJours(date: Date, jours: number): Date {
    const resultat = new Date(date);
    resultat.setDate(resultat.getDate() + jours);
    return resultat;
}

// Jours fériés nationaux en France métropolitaine.
function joursFeriesFrance(annee: number): Set<string> {
    const paques = dimanchePaques(annee);

    const joursFixes = [
        `${annee}-01-01`,
        `${annee}-05-01`,
        `${annee}-05-08`,
        `${annee}-07-14`,
        `${annee}-08-15`,
        `${annee}-11-01`,
        `${annee}-11-11`,
        `${annee}-12-25`,
    ];

    return new Set([
        ...joursFixes,
        dateISO(ajouterJours(paques, 1)),
        dateISO(ajouterJours(paques, 39)),
        dateISO(ajouterJours(paques, 50)),
    ]);
}

// Calcule 10 jours ouvrés APRÈS la prestation.
// Ne compte ni samedi, ni dimanche, ni jour férié national.
function calculerDateLimiteRestitution(
    datePrestation: string
): string {
    const date = lireDate(datePrestation);

    if (!date) {
        return '';
    }

    let joursOuvres = 0;

    while (joursOuvres < 10) {
        date.setDate(date.getDate() + 1);

        const jourSemaine = date.getDay();

        const estWeekend =
            jourSemaine === 0 || jourSemaine === 6;

        const feries = joursFeriesFrance(
            date.getFullYear()
        );

        const estFerie = feries.has(dateISO(date));

        if (!estWeekend && !estFerie) {
            joursOuvres++;
        }
    }

    return dateISO(date);
}

export default function Commande({
    menu,
    client,
    confirmation,
}: Props) {
    const [accepte, setAccepte] = useState(false);

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        menu_id: menu?.id ?? 0,
        telephone: client?.telephone ?? '',
        adresse_livraison: client?.adresse ?? '',
        code_postal: client?.code_postal ?? '',
        ville: client?.ville ?? '',
        date_livraison: '',
        heure_livraison: '',
        nombre_personnes: menu?.personnes_min ?? 1,
        distance_km: 0,

        // Informations relatives au prêt de matériel.
        materiel_demande: false,
        materiel_quantites: { ...quantitesInitiales },
       date_reception_materiel: '',
heure_reception_materiel: '',
date_limite_restitution: '',
heure_restitution_materiel: '',
    });

    const minimum = menu?.personnes_min ?? 1;
    const personnes = Number(data.nombre_personnes);
    const prixDepart = Number(menu?.prix ?? 0);

    const prixMenu =
        minimum > 0
            ? Math.round(
                  (prixDepart / minimum) * personnes * 100
              ) / 100
            : 0;

    const reduction =
        personnes >= minimum + 5
            ? Math.round(prixMenu * 0.1 * 100) / 100
            : 0;

    const bordeaux =
        data.ville.trim().toLowerCase() === 'bordeaux';

    const fraisLivraison =
        Math.round(
            (
                5 +
                (bordeaux
                    ? 0
                    : 0.59 * Number(data.distance_km))
            ) * 100
        ) / 100;

    const total =
        prixMenu - reduction + fraisLivraison;

    const dateLimiteCalculee =
        data.materiel_demande
            ? calculerDateLimiteRestitution(
                  data.date_livraison
              )
            : '';

    const materielSelectionne = listeMateriel.filter(
        (materiel) =>
            data.materiel_demande &&
            data.materiel_quantites[materiel.cle] > 0
    );

    const nombreArticlesSelectionnes =
        materielSelectionne.reduce(
            (totalArticles, materiel) =>
                totalArticles +
                data.materiel_quantites[materiel.cle],
            0
        );

    const receptionApresPrestation =
        data.materiel_demande &&
        data.date_reception_materiel !== '' &&
        data.date_livraison !== '' &&
        data.date_reception_materiel >
            data.date_livraison;

   
const formulaireMaterielInvalide =
    data.materiel_demande &&
    (
        materielSelectionne.length === 0 ||
        !data.date_reception_materiel ||
        !data.heure_reception_materiel ||
        !dateLimiteCalculee ||
        !data.heure_restitution_materiel ||
        receptionApresPrestation
    );


    const modifierQuantite = (
        materiel: TypeMateriel,
        valeur: number
    ) => {
        const quantite = Number.isFinite(valeur)
            ? Math.max(
                  0,
                  Math.min(999, Math.floor(valeur))
              )
            : 0;

        setData('materiel_quantites', {
            ...data.materiel_quantites,
            [materiel]: quantite,
        });
    };

    const changerDemandeMateriel = (oui: boolean) => {
        setData((valeurs) => ({
            ...valeurs,
            materiel_demande: oui,
            materiel_quantites: oui
                ? valeurs.materiel_quantites
                : { ...quantitesInitiales },
            date_reception_materiel: oui
                ? valeurs.date_reception_materiel
                : '',
            date_limite_restitution: oui
                ? calculerDateLimiteRestitution(
                      valeurs.date_livraison
                  )
                : '',
        }));
    };

    const modifierDatePrestation = (
        nouvelleDate: string
    ) => {
        setData((valeurs) => ({
            ...valeurs,
            date_livraison: nouvelleDate,
            date_limite_restitution:
                valeurs.materiel_demande
                    ? calculerDateLimiteRestitution(
                          nouvelleDate
                      )
                    : '',
        }));
    };

    const soumettre = (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !accepte ||
            processing ||
            !menu ||
            menu.stock <= 0 ||
            personnes < minimum ||
            formulaireMaterielInvalide
        ) {
            return;
        }

        post('/commandes');
    };

    // PAGE DE CONFIRMATION
    if (confirmation) {
        const materielConfirme =
            confirmation.materiel_demande &&
            confirmation.materiel_quantites;

        return (
            <>
                <Head title="Commande confirmée - Vite & Gourmand" />

                <main className="min-h-screen bg-[#faf8f4] px-5 py-16 text-[#302a25]">
                    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
                        <div className="mb-5 text-5xl text-green-700">
                            ✓
                        </div>

                        <h1 className="mb-4 text-3xl font-bold">
                            Votre commande est enregistrée !
                        </h1>

                        <p className="mb-6 text-gray-600">
                            Commande n°{confirmation.id} —
                            en attente de validation.
                        </p>

                        <div className="space-y-3 rounded-xl bg-[#faf8f4] p-6">
                            <p>
                                <strong>Menu :</strong>{' '}
                                {confirmation.menu_titre}
                            </p>

                            <p>
                                <strong>Convives :</strong>{' '}
                                {confirmation.nombre_personnes}
                            </p>

                            <p>
                                <strong>Livraison :</strong>{' '}
                                {dateFrancaise(
                                    confirmation.date_livraison.slice(0, 10)
                                )}
                                {' à '}
                                {confirmation.heure_livraison.slice(0, 5)}
                            </p>

                            <p>
                                <strong>Adresse :</strong>{' '}
                                {confirmation.adresse_livraison},{' '}
                                {confirmation.code_postal}{' '}
                                {confirmation.ville}
                            </p>

                            <hr />

                            <p>
                                Menus :{' '}
                                {euros(
                                    Number(confirmation.prix_menu)
                                )}
                            </p>

                            <p>
                                Réduction : -
                                {euros(
                                    Number(confirmation.reduction)
                                )}
                            </p>

                            <p>
                                Livraison :{' '}
                                {euros(
                                    Number(
                                        confirmation.frais_livraison
                                    )
                                )}
                            </p>

                            <p className="text-xl font-bold text-[#795334]">
                                Total :{' '}
                                {euros(
                                    Number(confirmation.total)
                                )}
                            </p>
                        </div>

                        {materielConfirme && (
                            <div className="mt-6 rounded-xl border border-[#e8ded3] p-5">
                                <h2 className="mb-3 text-lg font-bold">
                                    Demande de matériel
                                </h2>

                                {listeMateriel
                                    .filter(
                                        (materiel) =>
                                            (
                                                confirmation
                                                    .materiel_quantites?.[
                                                        materiel.cle
                                                    ] ?? 0
                                            ) > 0
                                    )
                                    .map((materiel) => (
                                        <p
                                            key={materiel.cle}
                                            className="mb-1"
                                        >
                                            {materiel.nom} :{' '}
                                            {
                                                confirmation
                                                    .materiel_quantites?.[
                                                        materiel.cle
                                                    ]
                                            }
                                        </p>
                                    ))}

                                {confirmation.date_reception_materiel && (
                                    <p className="mt-3">
                                        <strong>
                                            Réception souhaitée :
                                        </strong>{' '}
                                        {dateFrancaise(
                                            confirmation.date_reception_materiel
                                        )}
                                    </p>
                                )}
{confirmation.heure_reception_materiel && (
    <p className="mt-2">
        <strong>Heure de réception :</strong>{' '}
        {confirmation.heure_reception_materiel.slice(0, 5)}
    </p>
)}
                               
{confirmation.date_limite_restitution && (
    <p className="mt-2">
        <strong>Date limite de restitution :</strong>{' '}
        {dateFrancaise(confirmation.date_limite_restitution)}
    </p>
)}

{confirmation.heure_restitution_materiel && (
    <p className="mt-2">
        <strong>Heure de restitution souhaitée :</strong>{' '}
        {confirmation.heure_restitution_materiel.slice(0, 5)}
    </p>
)}


                                <p className="mt-3 text-sm text-gray-600">
                                    Matériel soumis à la validation
                                    du traiteur.
                                </p>
                            </div>
                        )}

                        <p className="mt-6 text-sm text-gray-600">
                            Un message de confirmation est prévu
                            par e-mail. L'envoi dépend de la
                            configuration de la messagerie.
                        </p>

                        <Link
                            href="/"
                            className="mt-7 inline-block rounded-xl bg-[#795334] px-6 py-3 font-semibold text-white"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    if (!menu || !client) {
        return (
            <main className="p-10">
                Impossible de charger le formulaire
                de commande.
            </main>
        );
    }

    const champ =
        'mt-1 w-full rounded-lg border border-gray-300 p-3';

    // FORMULAIRE DE COMMANDE
    return (
        <>
            <Head title="Commander - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf8f4] px-5 py-10 text-[#302a25]">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/"
                        className="font-semibold text-[#795334]"
                    >
                        ← Retour aux menus
                    </Link>

                    <h1 className="mt-8 text-3xl font-bold">
                        Finaliser ma commande
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {menu.titre} — à partir de{' '}
                        {minimum} personnes
                    </p>

                    {menu.conditions && (
                        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
                            <strong>
                                Conditions du menu :
                            </strong>{' '}
                            {menu.conditions}
                        </div>
                    )}

                    <form
                        onSubmit={soumettre}
                        className="mt-8 grid gap-8 lg:grid-cols-3"
                    >
                        <div className="space-y-7 lg:col-span-2">
                            {/* COORDONNÉES */}
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-bold">
                                    Mes coordonnées
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="font-medium">
                                            Nom
                                        </label>

                                        <input
                                            className={champ}
                                            value={client.nom}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium">
                                            E-mail
                                        </label>

                                        <input
                                            className={champ}
                                            value={client.email}
                                            readOnly
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="font-medium">
                                            Téléphone *
                                        </label>

                                        <input
                                            className={champ}
                                            type="tel"
                                            required
                                            value={data.telephone}
                                            onChange={(e) =>
                                                setData(
                                                    'telephone',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.telephone}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* LIVRAISON */}
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-bold">
                                    Ma livraison
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="font-medium">
                                            Adresse *
                                        </label>

                                        <input
                                            className={champ}
                                            required
                                            value={data.adresse_livraison}
                                            onChange={(e) =>
                                                setData(
                                                    'adresse_livraison',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.adresse_livraison}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="font-medium">
                                            Code postal *
                                        </label>

                                        <input
                                            className={champ}
                                            required
                                            value={data.code_postal}
                                            onChange={(e) =>
                                                setData(
                                                    'code_postal',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.code_postal}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="font-medium">
                                            Ville *
                                        </label>

                                        <input
                                            className={champ}
                                            required
                                            value={data.ville}
                                            onChange={(e) =>
                                                setData(
                                                    'ville',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.ville}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="font-medium">
                                            Date de livraison *
                                        </label>

                                        <input
                                            type="date"
                                            className={champ}
                                            required
                                            value={data.date_livraison}
                                            onChange={(e) =>
                                                modifierDatePrestation(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.date_livraison}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="font-medium">
                                            Heure de livraison *
                                        </label>

                                        <input
                                            type="time"
                                            className={champ}
                                            required
                                            value={data.heure_livraison}
                                            onChange={(e) =>
                                                setData(
                                                    'heure_livraison',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <p className="text-sm text-red-600">
                                            {errors.heure_livraison}
                                        </p>
                                    </div>
                                </div>

                                {!bordeaux && (
                                    <div className="mt-5">
                                        <label className="font-medium">
                                            Distance depuis Bordeaux (km) *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            required
                                            className={champ}
                                            value={data.distance_km}
                                            onChange={(e) =>
                                                setData(
                                                    'distance_km',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />

                                        <p className="mt-2 text-sm text-gray-500">
                                            Distance déclarée à vérifier
                                            par le traiteur.
                                            Supplément : 0,59 € par km.
                                        </p>

                                        <p className="text-sm text-red-600">
                                            {errors.distance_km}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* CONVIVES */}
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-5 text-xl font-bold">
                                    Nombre de convives
                                </h2>

                                <label className="font-medium">
                                    Personnes *
                                </label>

                                <input
                                    type="number"
                                    min={minimum}
                                    required
                                    className={champ}
                                    value={data.nombre_personnes}
                                    onChange={(e) =>
                                        setData(
                                            'nombre_personnes',
                                            Number(e.target.value)
                                        )
                                    }
                                />

                                <p className="mt-2 text-sm text-gray-500">
                                    Minimum : {minimum} personnes.
                                    Réduction de 10 % à partir de{' '}
                                    {minimum + 5} personnes.
                                </p>

                                <p className="text-sm text-red-600">
                                    {errors.nombre_personnes}
                                </p>
                            </section>

                            {/* PRÊT DE MATÉRIEL */}
                            <section className="rounded-2xl bg-white p-6 shadow-sm">
                                <h2 className="mb-3 text-xl font-bold">
                                    Prêt de matériel
                                </h2>

                                <p className="mb-5 text-sm text-gray-600">
                                    Vous pouvez demander du matériel
                                    pour votre événement.
                                    La demande sera examinée
                                    par le traiteur.
                                </p>

                                <p className="mb-3 font-medium">
                                    Souhaitez-vous emprunter
                                    du matériel ?
                                </p>

                                <div className="flex gap-6">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name="materiel_demande"
                                            checked={
                                                !data.materiel_demande
                                            }
                                            onChange={() =>
                                                changerDemandeMateriel(false)
                                            }
                                        />
                                        Non
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name="materiel_demande"
                                            checked={
                                                data.materiel_demande
                                            }
                                            onChange={() =>
                                                changerDemandeMateriel(true)
                                            }
                                        />
                                        Oui
                                    </label>
                                </div>

                                {data.materiel_demande && (
                                    <div className="mt-6 space-y-6 border-t border-gray-200 pt-5">
                                        <div>
                                            <h3 className="mb-2 font-semibold">
                                                Matériel souhaité
                                            </h3>

                                            <p className="mb-4 text-sm text-gray-500">
                                                Indiquez les quantités.
                                                Laissez zéro pour
                                                les articles non souhaités.
                                            </p>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {listeMateriel.map(
                                                    (materiel) => (
                                                        <div
                                                            key={materiel.cle}
                                                            className="rounded-xl border border-[#e8ded3] bg-[#faf8f4] p-4"
                                                        >
                                                            <label
                                                                htmlFor={
                                                                    `materiel-${materiel.cle}`
                                                                }
                                                                className="mb-3 block font-medium"
                                                            >
                                                                {materiel.nom}
                                                            </label>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        data.materiel_quantites[
                                                                            materiel.cle
                                                                        ] <= 0
                                                                    }
                                                                    onClick={() =>
                                                                        modifierQuantite(
                                                                            materiel.cle,
                                                                            data.materiel_quantites[
                                                                                materiel.cle
                                                                            ] - 1
                                                                        )
                                                                    }
                                                                    className="rounded-lg border bg-white px-3 py-2 font-bold disabled:opacity-40"
                                                                >
                                                                    −
                                                                </button>

                                                                <input
                                                                    id={
                                                                        `materiel-${materiel.cle}`
                                                                    }
                                                                    type="number"
                                                                    min="0"
                                                                    max="999"
                                                                    step="1"
                                                                    className="w-full min-w-0 rounded-lg border border-gray-300 p-2 text-center"
                                                                    value={
                                                                        data.materiel_quantites[
                                                                            materiel.cle
                                                                        ]
                                                                    }
                                                                    onChange={(e) =>
                                                                        modifierQuantite(
                                                                            materiel.cle,
                                                                            Number(
                                                                                e.target.value
                                                                            )
                                                                        )
                                                                    }
                                                                />

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        data.materiel_quantites[
                                                                            materiel.cle
                                                                        ] >= 999
                                                                    }
                                                                    onClick={() =>
                                                                        modifierQuantite(
                                                                            materiel.cle,
                                                                            data.materiel_quantites[
                                                                                materiel.cle
                                                                            ] + 1
                                                                        )
                                                                    }
                                                                    className="rounded-lg border bg-white px-3 py-2 font-bold disabled:opacity-40"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {materielSelectionne.length === 0 && (
                                                <p className="mt-3 text-sm text-amber-700">
                                                    Sélectionnez au moins
                                                    un article.
                                                </p>
                                            )}

                                            {nombreArticlesSelectionnes > 0 && (
                                                <p className="mt-3 font-medium text-[#795334]">
                                                    Nombre total d'articles
                                                    demandés :{' '}
                                                    {nombreArticlesSelectionnes}
                                                </p>
                                            )}
                                        </div>

                                       
                                        {/* DATES DU PRÊT */}
                                        <div className="border-t border-gray-200 pt-5">
                                            <h3 className="mb-4 font-semibold">
                                                Dates et horaires du prêt de matériel
                                            </h3>

                                            <p className="mb-5 text-sm text-gray-600">
                                                La livraison du matériel est indépendante
                                                de celle du menu. Indiquez la date et
                                                l'heure auxquelles vous souhaitez le recevoir.
                                            </p>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                {/* DATE DE RÉCEPTION */}
                                                <div>
                                                    <label className="font-medium">
                                                        Date de réception du matériel *
                                                    </label>

                                                    <input
                                                        type="date"
                                                        required={data.materiel_demande}
                                                        min={new Date().toLocaleDateString('en-CA')}
                                                        max={data.date_livraison || undefined}
                                                        className={champ}
                                                        value={data.date_reception_materiel}
                                                        onChange={(e) =>
                                                            setData(
                                                                'date_reception_materiel',
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Le matériel peut être livré avant
                                                        le repas, mais pas après la prestation.
                                                    </p>

                                                    {receptionApresPrestation && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            La réception ne peut pas être
                                                            postérieure à la prestation.
                                                        </p>
                                                    )}

                                                    <p className="text-sm text-red-600">
                                                        {errors.date_reception_materiel}
                                                    </p>
                                                </div>

                                                {/* HEURE DE RÉCEPTION */}
                                                <div>
                                                    <label className="font-medium">
                                                        Heure de réception du matériel *
                                                    </label>

                                                    <input
                                                        type="time"
                                                        required={data.materiel_demande}
                                                        className={champ}
                                                        value={data.heure_reception_materiel}
                                                        onChange={(e) =>
                                                            setData(
                                                                'heure_reception_materiel',
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Horaire souhaité, à confirmer
                                                        par le traiteur.
                                                    </p>
                                                </div>

                                                {/* DATE LIMITE DE RESTITUTION */}
                                                <div>
                                                    <label className="font-medium">
                                                        Date limite de restitution
                                                    </label>

                                                    <div className="mt-1 min-h-12 rounded-lg border border-[#e8ded3] bg-[#f5efe7] p-3 font-semibold text-[#795334]">
                                                        {dateLimiteCalculee
                                                            ? dateFrancaise(dateLimiteCalculee)
                                                            : 'Choisissez la date de prestation'}
                                                    </div>

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Calcul automatique : 10 jours ouvrés
                                                        après la prestation.
                                                    </p>
                                                </div>

                                                {/* HEURE DE RESTITUTION */}
                                                <div>
                                                    <label className="font-medium">
                                                        Heure de restitution souhaitée *
                                                    </label>

                                                    <input
                                                        type="time"
                                                        required={data.materiel_demande}
                                                        className={champ}
                                                        value={data.heure_restitution_materiel}
                                                        onChange={(e) =>
                                                            setData(
                                                                'heure_restitution_materiel',
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Heure souhaitée pour rendre
                                                        le matériel à la date limite.
                                                        À confirmer avec le traiteur.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CONDITIONS */}
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <h3 className="mb-2 font-bold text-[#795334]">
                                                Conditions de restitution
                                            </h3>

                                            <p className="text-sm leading-6">
                                                Le matériel effectivement
                                                prêté doit être restitué
                                                au plus tard 10 jours
                                                ouvrés après la prestation.
                                            </p>

                                            <p className="mt-2 text-sm leading-6">
                                                Une pénalité de 600 €
                                                est prévue en cas
                                                de non-restitution
                                                au-delà du délai
                                                contractuel, selon
                                                les conditions de vente.
                                            </p>

                                            <p className="mt-2 text-sm leading-6">
                                                Une confirmation par
                                                e-mail sera envoyée
                                                lorsque le traiteur
                                                aura enregistré la
                                                restitution du matériel.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <p className="mt-3 text-sm text-red-600">
                                    {errors.materiel_demande}
                                </p>
                            </section>
                        </div>

                        {/* RÉCAPITULATIF */}
                        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-bold">
                                Récapitulatif
                            </h2>

                            <div className="space-y-4">
                                <div className="flex justify-between gap-3">
                                    <span>Prix des menus</span>
                                    <strong>
                                        {euros(prixMenu)}
                                    </strong>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span>Réduction</span>
                                    <strong className="text-green-700">
                                        -{euros(reduction)}
                                    </strong>
                                </div>

                                <div className="flex justify-between gap-3">
                                    <span>Livraison</span>
                                    <strong>
                                        {euros(fraisLivraison)}
                                    </strong>
                                </div>

                                <hr />

                                <div className="flex justify-between gap-3 text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-[#795334]">
                                        {euros(total)}
                                    </span>
                                </div>
                            </div>

                            {/* RÉCAPITULATIF MATÉRIEL */}
                            <div className="mt-6 border-t border-gray-200 pt-5">
                                <h3 className="mb-3 font-bold">
                                    Prêt de matériel
                                </h3>

                                {!data.materiel_demande ? (
                                    <p className="text-sm text-gray-600">
                                        Aucun matériel demandé.
                                    </p>
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        {materielSelectionne.length === 0 ? (
                                            <p className="text-amber-700">
                                                Aucun article sélectionné.
                                            </p>
                                        ) : (
                                            materielSelectionne.map(
                                                (materiel) => (
                                                    <div
                                                        key={materiel.cle}
                                                        className="flex justify-between gap-3"
                                                    >
                                                        <span>
                                                            {materiel.nom}
                                                        </span>

                                                        <strong>
                                                            {
                                                                data.materiel_quantites[
                                                                    materiel.cle
                                                                ]
                                                            }
                                                        </strong>
                                                    </div>
                                                )
                                            )
                                        )}

                                        <hr />

 
<p>
    <strong>Date de réception du matériel :</strong>{' '}
    {dateFrancaise(data.date_reception_materiel)}
</p>

<p>
    <strong>Heure de réception du matériel :</strong>{' '}
    {data.heure_reception_materiel || 'À déterminer'}
</p>

<p>
    <strong>Date limite de restitution :</strong>{' '}
    {dateFrancaise(dateLimiteCalculee)}
</p>

<p>
    <strong>Heure de restitution souhaitée :</strong>{' '}
    {data.heure_restitution_materiel || 'À déterminer'}
</p>

                                        <p className="text-xs text-gray-500">
                                            Matériel soumis à la
                                            validation du traiteur.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ACCEPTATION */}
                            <label className="mt-7 flex items-start gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={accepte}
                                    onChange={(e) =>
                                        setAccepte(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Je confirme les informations
                                    de ma commande et reconnais
                                    avoir pris connaissance
                                    des conditions de vente,
                                    y compris des conditions
                                    de prêt de matériel si
                                    j'en ai demandé.
                                </span>
                            </label>

                            {errors.menu_id && (
                                <p className="mt-3 text-sm text-red-600">
                                    {errors.menu_id}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !accepte ||
                                    menu.stock <= 0 ||
                                    personnes < minimum ||
                                    formulaireMaterielInvalide
                                }
                                className="mt-6 w-full rounded-xl bg-[#795334] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Enregistrement...'
                                    : menu.stock <= 0
                                      ? 'Menu épuisé'
                                      : 'Confirmer ma commande'}
                            </button>

                            <p className="mt-3 text-center text-xs text-gray-500">
                                Commande soumise à validation
                                du traiteur.
                            </p>
                        </aside>
                    </form>
                </div>
            </main>
        </>
    );
}
