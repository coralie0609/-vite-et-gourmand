
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

export default function ForgotPassword({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            <div className="mb-6">
                <h1 className="text-center text-2xl font-bold text-[#795334]">
                    Mot de passe oublié ?
                </h1>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Indiquez votre adresse e-mail.
                    Nous vous enverrons un lien pour réinitialiser
                    votre mot de passe.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Adresse e-mail"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        isFocused
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError
                        message={errors.email}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        className="!bg-[#795334]"
                        disabled={processing}
                    >
                        Envoyer le lien de réinitialisation
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
