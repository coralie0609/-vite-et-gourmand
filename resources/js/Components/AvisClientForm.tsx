
import { useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

type Props = {
    commandeId: number;
};

export default function AvisClientForm({ commandeId }: Props) {
    const [envoye, setEnvoye] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        note: 0,
        commentaire: '',
    });

    const envoyer = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (data.note < 1 || processing) return;

        post(`/mes-commandes/${commandeId}/avis`, {
            preserveScroll: true,
            onSuccess: () => setEnvoye(true),
        });
    };

    if (envoye) {
        return (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="font-semibold text-green-800">
                    Merci pour votre avis !
                </p>
                <p className="mt-2 text-sm text-green-700">
                    Votre avis est en attente de validation
                    par notre équipe.
                </p>
            </div>
        );
    }

    return (
        <section className="mt-6 rounded-xl border border-[#dcc6b0] bg-[#faf8f4] p-5">
            <h4 className="text-xl font-bold text-[#795334]">
                Donner mon avis
            </h4>

            <p className="mt-2 text-sm text-gray-600">
                Comment s'est passée votre prestation ?
                Partagez votre expérience avec Vite & Gourmand.
            </p>

            <form onSubmit={envoyer} className="mt-5 space-y-5">
                <div>
                    <p className="mb-3 font-semibold">
                        Votre note
                    </p>

                    <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label="Note sur cinq étoiles"
                    >
                        {[1, 2, 3, 4, 5].map((etoile) => (
                            <button
                                key={etoile}
                                type="button"
                                onClick={() =>
                                    setData('note', etoile)
                                }
                                aria-label={`${etoile} étoile${etoile > 1 ? 's' : ''}`}
                                aria-pressed={data.note === etoile}
                                className={`text-4xl transition ${
                                    etoile <= data.note
                                        ? 'text-amber-500'
                                        : 'text-gray-300'
                                }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                        {data.note > 0
                            ? `${data.note} / 5`
                            : 'Sélectionnez une note sur 5.'}
                    </p>

                    {errors.note && (
                        <p className="mt-1 text-sm text-red-700">
                            {errors.note}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor={`commentaire-avis-${commandeId}`}
                        className="mb-2 block font-semibold"
                    >
                        Votre commentaire
                    </label>

                    <textarea
                        id={`commentaire-avis-${commandeId}`}
                        value={data.commentaire}
                        onChange={(e) =>
                            setData('commentaire', e.target.value)
                        }
                        required
                        minLength={5}
                        maxLength={2000}
                        rows={5}
                        placeholder="Racontez votre expérience..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#795334] focus:ring-[#795334]"
                    />

                    {errors.commentaire && (
                        <p className="mt-1 text-sm text-red-700">
                            {errors.commentaire}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={
                        processing ||
                        data.note < 1 ||
                        data.commentaire.trim().length < 5
                    }
                    className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing
                        ? 'Envoi en cours...'
                        : 'Envoyer mon avis'}
                </button>

                <p className="text-xs text-gray-600">
                    Votre avis sera publié après validation
                    par notre équipe.
                </p>
            </form>
        </section>
    );
}
