
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type Horaire = {
    id: number;
    jour_numero: number;
    jour: string;
    ouverture: string | null;
    fermeture: string | null;
    ferme: boolean;
};

type Props = {
    horaires: Horaire[];
};

const champ =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#795334] focus:outline-none disabled:bg-gray-100 disabled:text-gray-400';

function LigneHoraire({ horaire }: { horaire: Horaire }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            ouverture: horaire.ouverture?.slice(0, 5) ?? '09:00',
            fermeture: horaire.fermeture?.slice(0, 5) ?? '18:00',
            ferme: Boolean(horaire.ferme),
        });

    const enregistrer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        patch(`/employe/horaires/${horaire.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <form
            onSubmit={enregistrer}
            className="rounded-xl border border-[#eadfd4] bg-white p-5 shadow-sm"
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold">{horaire.jour}</h2>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <input
                        type="checkbox"
                        checked={data.ferme}
                        onChange={(e) =>
                            setData('ferme', e.target.checked)
                        }
                        className="h-4 w-4 accent-[#795334]"
                    />
                    Jour fermé
                </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                    Heure d'ouverture

                    <input
                        type="time"
                        className={champ}
                        disabled={data.ferme}
                        required={!data.ferme}
                        value={data.ouverture}
                        onChange={(e) =>
                            setData('ouverture', e.target.value)
                        }
                    />

                    {errors.ouverture && (
                        <span className="text-sm text-red-600">
                            {errors.ouverture}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                    Heure de fermeture

                    <input
                        type="time"
                        className={champ}
                        disabled={data.ferme}
                        required={!data.ferme}
                        value={data.fermeture}
                        onChange={(e) =>
                            setData('fermeture', e.target.value)
                        }
                    />

                    {errors.fermeture && (
                        <span className="text-sm text-red-600">
                            {errors.fermeture}
                        </span>
                    )}
                </label>
            </div>

            {data.ferme && (
                <p className="mt-3 text-sm text-gray-600">
                    L'établissement sera indiqué comme fermé ce jour-là.
                </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-[#795334] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5e3f29] disabled:opacity-50"
                >
                    {processing
                        ? 'Enregistrement...'
                        : 'Enregistrer'}
                </button>

                {recentlySuccessful && (
                    <p
                        role="status"
                        className="text-sm font-semibold text-green-700"
                    >
                        ✓ Horaires enregistrés
                    </p>
                )}
            </div>
        </form>
    );
}

export default function EmployeHoraires({ horaires }: Props) {
    return (
        <>
            <Head title="Gestion des horaires - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#392f29]">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Gestion des horaires
                            </h1>

                            <p className="mt-2 text-gray-600">
                                Modifiez les horaires d'ouverture
                                du lundi au dimanche.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <Link
                                href="/employe/menus"
                                className="font-semibold text-[#795334] hover:underline"
                            >
                                Gestion des menus
                            </Link>

                            <Link
                                href="/employe/commandes"
                                className="font-semibold text-[#795334] hover:underline"
                            >
                                Commandes
                            </Link>

                            <Link
                                href="/"
                                className="font-semibold text-[#795334] hover:underline"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>

                    <div className="mb-6 rounded-xl border border-[#eadfd4] bg-white p-5">
                        <p className="font-semibold">
                            {horaires.length} jours configurés
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Les modifications sont enregistrées
                            dans la base de données SQLite.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {horaires.map((horaire) => (
                            <LigneHoraire
                                key={horaire.id}
                                horaire={horaire}
                            />
                        ))}
                    </div>

                    {horaires.length === 0 && (
                        <p className="mt-5 rounded-xl bg-white p-6 text-center">
                            Aucun horaire enregistré.
                        </p>
                    )}
                </div>
            </main>
        </>
    );
}
