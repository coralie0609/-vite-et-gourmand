import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type Employe = {
    id: number;
    name: string;
    email: string;
    actif: boolean;
    created_at: string;
};

type PageProps = {
    employes: Employe[];
};

type FormulaireEmploye = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function AdminEmployes({ employes }: PageProps) {
    const [afficherFormulaire, setAfficherFormulaire] = useState(false);
    const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

    const {
        data,
        setData,
        post,
        
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<FormulaireEmploye>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const creerEmploye = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/admin/employes', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setAfficherFormulaire(false);
                setAfficherMotDePasse(false);
            },
        });
    };

    const changerStatut = (employe: Employe) => {
        const action = employe.actif ? 'désactiver' : 'réactiver';

        if (
            !window.confirm(
                `Voulez-vous vraiment ${action} le compte de ${employe.name} ?`
            )
        ) {
            return;
        }

        // Requête indépendante du formulaire de création.
        // Le rôle est contrôlé dans le contrôleur Laravel.
        
router.patch(
    `/admin/employes/${employe.id}/statut`,
    {
        actif: !employe.actif,
    },
    {
        preserveScroll: true,
    }
);

    };

    const nombreActifs = employes.filter((employe) => employe.actif).length;

    return (
        <>
            <Head title="Gestion des employés - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-[#795334]"
                        >
                            Vite & Gourmand
                        </Link>

                        <Link
                            href="/"
                            className="font-semibold text-[#795334] hover:underline"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </header>

                <div className="mx-auto max-w-6xl px-6 py-10">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#795334]">
                                Espace administrateur
                            </p>

                            <h1 className="text-3xl font-bold">
                                Gestion des employés
                            </h1>

                            <p className="mt-3 text-gray-600">
                                Créez des comptes et gérez les accès du
                                personnel de Vite & Gourmand.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setAfficherFormulaire(!afficherFormulaire);
                                clearErrors();
                            }}
                            className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#5e3f29]"
                        >
                            {afficherFormulaire
                                ? 'Fermer le formulaire'
                                : '+ Ajouter un employé'}
                        </button>
                    </div>

                    <div className="mb-8 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Total des employés
                            </p>
                            <p className="mt-2 text-3xl font-bold">
                                {employes.length}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Comptes actifs
                            </p>
                            <p className="mt-2 text-3xl font-bold text-green-700">
                                {nombreActifs}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Comptes désactivés
                            </p>
                            <p className="mt-2 text-3xl font-bold text-red-700">
                                {employes.length - nombreActifs}
                            </p>
                        </div>
                    </div>

                    {afficherFormulaire && (
                        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-6 text-2xl font-bold">
                                Créer un compte employé
                            </h2>

                            <form
                                onSubmit={creerEmploye}
                                className="grid gap-5 sm:grid-cols-2"
                            >
                                <div>
                                    <label
                                        htmlFor="nom-employe"
                                        className="mb-2 block font-medium"
                                    >
                                        Nom de l'employé
                                    </label>
                                    <input
                                        id="nom-employe"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="email-employe"
                                        className="mb-2 block font-medium"
                                    >
                                        Adresse e-mail
                                    </label>
                                    <input
                                        id="email-employe"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="mot-de-passe-employe"
                                        className="mb-2 block font-medium"
                                    >
                                        Mot de passe
                                    </label>
                                    
<div className="relative">
    <input
        id="mot-de-passe-employe"
        type={afficherMotDePasse ? 'text' : 'password'}
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12"
    />

    <button
        type="button"
        onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
        aria-label={
            afficherMotDePasse
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
        }
        title={
            afficherMotDePasse
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
        }
        className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-500 hover:text-[#795334]"
    >
        {afficherMotDePasse ? '🙈' : '👁️'}
    </button>
</div>

                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmation-employe"
                                        className="mb-2 block font-medium"
                                    >
                                        Confirmer le mot de passe
                                    </label>
                                    <input
                                        id="confirmation-employe"
                                        type={
                                            afficherMotDePasse
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                                    />
                                </div>

                                <label className="flex items-center gap-2 sm:col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={afficherMotDePasse}
                                        onChange={(e) =>
                                            setAfficherMotDePasse(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    Afficher les mots de passe
                                </label>

                                <div className="sm:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#5e3f29] disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Enregistrement...'
                                            : 'Créer le compte employé'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-6">
                            <h2 className="text-2xl font-bold">
                                Liste des employés
                            </h2>
                        </div>

                        {employes.length === 0 ? (
                            <div className="px-6 py-14 text-center text-gray-600">
                                Aucun employé enregistré pour le moment.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f5f0e9]">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Employé
                                            </th>
                                            <th className="px-6 py-4">
                                                E-mail
                                            </th>
                                            <th className="px-6 py-4">
                                                Statut
                                            </th>
                                            <th className="px-6 py-4">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {employes.map((employe) => (
                                            <tr
                                                key={employe.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-6 py-4 font-semibold">
                                                    {employe.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {employe.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                                                            employe.actif
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {employe.actif
                                                            ? 'Actif'
                                                            : 'Désactivé'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changerStatut(
                                                                employe
                                                            )
                                                        }
                                                        disabled={processing}
                                                        className="rounded-lg border border-[#795334] px-4 py-2 font-semibold text-[#795334] hover:bg-[#faf8f4] disabled:opacity-50"
                                                    >
                                                        {employe.actif
                                                            ? 'Désactiver'
                                                            : 'Réactiver'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
