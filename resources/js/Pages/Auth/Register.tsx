
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEventHandler, useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        password: '',
        password_confirmation: '',
    });

    const [voirMotDePasse, setVoirMotDePasse] = useState(false);
    const [voirConfirmation, setVoirConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Créer mon compte" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <h1 className="mb-2 text-center text-2xl font-bold text-[#795334]">
                        Créer mon compte
                    </h1>
                    <p className="mb-6 text-center text-sm text-gray-600">
                        Bienvenue chez Vite & Gourmand.
                        Renseignez vos coordonnées pour commander nos menus.
                    </p>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nom *" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="family-name"
                        isFocused
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="prenom" value="Prénom *" />
                    <TextInput
                        id="prenom"
                        name="prenom"
                        value={data.prenom}
                        className="mt-1 block w-full"
                        autoComplete="given-name"
                        onChange={(e) => setData('prenom', e.target.value)}
                        required
                    />
                    <InputError message={errors.prenom} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Adresse e-mail *" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="telephone" value="Téléphone *" />
                    <TextInput
                        id="telephone"
                        type="tel"
                        name="telephone"
                        value={data.telephone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        onChange={(e) => setData('telephone', e.target.value)}
                        required
                    />
                    <InputError message={errors.telephone} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="adresse" value="Adresse postale *" />
                    <TextInput
                        id="adresse"
                        name="adresse"
                        value={data.adresse}
                        className="mt-1 block w-full"
                        autoComplete="street-address"
                        onChange={(e) => setData('adresse', e.target.value)}
                        required
                    />
                    <InputError message={errors.adresse} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="code_postal"
                            value="Code postal *"
                        />
                        <TextInput
                            id="code_postal"
                            name="code_postal"
                            value={data.code_postal}
                            className="mt-1 block w-full"
                            autoComplete="postal-code"
                            onChange={(e) =>
                                setData('code_postal', e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.code_postal}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="ville" value="Ville *" />
                        <TextInput
                            id="ville"
                            name="ville"
                            value={data.ville}
                            className="mt-1 block w-full"
                            autoComplete="address-level2"
                            onChange={(e) => setData('ville', e.target.value)}
                            required
                        />
                        <InputError message={errors.ville} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Mot de passe *"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={voirMotDePasse ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-20"
                            autoComplete="new-password"
                            minLength={10}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setVoirMotDePasse(!voirMotDePasse)
                            }
                            className="absolute inset-y-0 right-3 text-sm font-medium text-[#795334]"
                            aria-label={
                                voirMotDePasse
                                    ? 'Masquer le mot de passe'
                                    : 'Afficher le mot de passe'
                            }
                        >
                            {voirMotDePasse ? 'Masquer' : 'Voir'}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-600">
                        Minimum 10 caractères, dont une majuscule,
                        une minuscule, un chiffre et un caractère spécial.
                    </p>

                    <InputError
                        message={errors.password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmer le mot de passe *"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={
                                voirConfirmation ? 'text' : 'password'
                            }
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-20"
                            autoComplete="new-password"
                            minLength={10}
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            required
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setVoirConfirmation(!voirConfirmation)
                            }
                            className="absolute inset-y-0 right-3 text-sm font-medium text-[#795334]"
                            aria-label={
                                voirConfirmation
                                    ? 'Masquer la confirmation'
                                    : 'Afficher la confirmation'
                            }
                        >
                            {voirConfirmation ? 'Masquer' : 'Voir'}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <PrimaryButton
                        className="flex justify-center !bg-[#795334]"
                        disabled={processing}
                    >
                        Créer mon compte
                    </PrimaryButton>

                    <p className="text-center text-sm text-gray-600">
                        Vous avez déjà un compte ?{' '}
                        <Link
                            href={route('login')}
                            className="font-semibold text-[#795334] underline"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
