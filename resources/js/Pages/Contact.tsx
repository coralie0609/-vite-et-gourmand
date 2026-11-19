
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function Contact() {
    const [messageEnvoye, setMessageEnvoye] = useState(false);
    const { data, setData, post, processing, errors, reset, recentlySuccessful } =
        useForm({
            nom: '',
            email: '',
            sujet: '',
            message: '',
        });

    const envoyer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

       setMessageEnvoye(false);

post('/contact', {
    preserveScroll: true,
    onSuccess: () => {
        reset();
        setMessageEnvoye(true);
    },
});
    };

    return (
        <>
            <Head title="Contact - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#392f29]">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/"
                        className="font-semibold text-[#795334] hover:underline"
                    >
                        ← Retour à l'accueil
                    </Link>

                    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-10">
                        <h1 className="mb-3 text-3xl font-bold">
                            Contactez-nous
                        </h1>

                        <p className="mb-8 text-gray-600">
                            Une question sur nos menus ou sur une prestation ?
                            Envoyez-nous votre message à l'aide du formulaire.
                        </p>

                       {messageEnvoye && (
    <div
        role="status"
        className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
    >
        <p className="font-semibold">
            ✓ Votre message a bien été envoyé.
            Nous vous remercions de nous avoir contactés.
        </p>

        <button
            type="button"
            onClick={() => setMessageEnvoye(false)}
            aria-label="Fermer le message de confirmation"
            className="text-xl font-bold text-green-800 hover:text-green-950"
        >
            ×
        </button>
    </div>
)}

                        <form onSubmit={envoyer} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="nom"
                                    className="mb-2 block font-semibold"
                                >
                                    Nom *
                                </label>
                                <input
                                    id="nom"
                                    type="text"
                                    required
                                    maxLength={100}
                                    value={data.nom}
                                    onChange={(e) =>
                                        setData('nom', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                                {errors.nom && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nom}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block font-semibold"
                                >
                                    Adresse e-mail *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    maxLength={255}
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="sujet"
                                    className="mb-2 block font-semibold"
                                >
                                    Sujet *
                                </label>
                                <input
                                    id="sujet"
                                    type="text"
                                    required
                                    maxLength={150}
                                    value={data.sujet}
                                    onChange={(e) =>
                                        setData('sujet', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                                {errors.sujet && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.sujet}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="mb-2 block font-semibold"
                                >
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    required
                                    maxLength={5000}
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <p className="text-xs text-gray-500">
                                * Champs obligatoires. Projet pédagogique :
                                utilisez uniquement des données fictives.
                            </p>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#5e3f29] disabled:opacity-50"
                            >
                                {processing
                                    ? 'Envoi en cours...'
                                    : 'Envoyer mon message'}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}
