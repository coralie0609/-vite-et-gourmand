
import { Head, Link } from '@inertiajs/react';

export default function Erreur403() {
    return (
        <>
            <Head title="Accès interdit - Vite & Gourmand" />

            <main className="flex min-h-screen flex-col bg-[#faf8f4] text-[#302a25]">
                <header className="bg-white shadow-sm">
                    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-[#795334]"
                        >
                            Vite & Gourmand
                        </Link>
                    </nav>
                </header>

                <section className="flex flex-1 items-center justify-center px-6 py-16">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm sm:p-12">
                        <p className="text-7xl font-bold text-[#795334]">
                            403
                        </p>

                        <h1 className="mt-5 text-3xl font-bold">
                            Accès non autorisé
                        </h1>

                        <p className="mt-5 leading-7 text-gray-600">
                            Vous n'avez pas l'autorisation
                            d'accéder à cette page.
                        </p>

                        <p className="mt-3 leading-7 text-gray-600">
                            Pas d'inquiétude, vous pouvez
                            retourner à l'accueil de
                            Vite & Gourmand ou consulter
                            votre espace client.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/"
                                className="rounded-lg bg-[#795334] px-6 py-3 font-semibold text-white hover:bg-[#5e3f29]"
                            >
                                Retour à l'accueil
                            </Link>

                            <Link
                                href="/mon-espace"
                                className="rounded-lg border border-[#795334] px-6 py-3 font-semibold text-[#795334] hover:bg-[#faf8f4]"
                            >
                                Mon espace client
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
