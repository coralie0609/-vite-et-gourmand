
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEventHandler } from 'react';

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Connexion - Vite & Gourmand" />

            <main className="flex min-h-screen flex-col bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
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
                    </nav>
                </header>

                <section className="flex flex-1 items-center justify-center px-5 py-14">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm sm:p-10">
                        <div className="mb-8 text-center">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#795334]">
                                Bienvenue
                            </p>

                            <h1 className="text-3xl font-bold">
                                Connexion
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                Connectez-vous à votre espace
                                Vite & Gourmand.
                            </p>
                        </div>

                        {status && (
                            <div
                                role="status"
                                className="mb-6 rounded-lg border border-[#dfccb7] bg-[#faf3e9] p-4 text-sm leading-6 text-[#795334]"
                            >
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block font-medium"
                                >
                                    Adresse e-mail
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    autoComplete="username"
                                    autoFocus
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#795334] focus:ring-[#795334]"
                                />

                                {errors.email && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-sm text-red-700"
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="mt-5">
                                <label
                                    htmlFor="password"
                                    className="mb-2 block font-medium"
                                >
                                    Mot de passe
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        name="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        autoComplete="current-password"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-[#795334] focus:ring-[#795334]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Masquer le mot de passe'
                                                : 'Afficher le mot de passe'
                                        }
                                        title={
                                            showPassword
                                                ? 'Masquer le mot de passe'
                                                : 'Afficher le mot de passe'
                                        }
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#795334]"
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M3 3l18 18" />
                                                <path d="M10.6 5.1A11.6 11.6 0 0 1 12 5c6.5 0 10 7 10 7a15.6 15.6 0 0 1-3.2 4.1" />
                                                <path d="M6.1 6.1C3.5 8 2 12 2 12s3.5 7 10 7a10.7 10.7 0 0 0 4.1-.8" />
                                                <path d="M10 10a3 3 0 0 0 4 4" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="3"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-sm text-red-700"
                                    >
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked
                                            )
                                        }
                                        className="rounded border-gray-300 text-[#795334] focus:ring-[#795334]"
                                    />

                                    Se souvenir de moi
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-[#795334] underline hover:text-[#5e3f29]"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-8 w-full rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#5e3f29] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? 'Connexion en cours...'
                                    : 'Se connecter'}
                            </button>
                        </form>

                        <div className="mt-7 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
                            Vous n'avez pas encore de compte ?{' '}

                            <Link
                                href="/register"
                                className="font-semibold text-[#795334] underline hover:text-[#5e3f29]"
                            >
                                S'inscrire
                            </Link>
                        </div>
                    </div>
                </section>

                <footer className="bg-[#30271f] px-6 py-5 text-center text-sm text-white">
                    © 2026 Vite & Gourmand
                </footer>
            </main>
        </>
    );
}
