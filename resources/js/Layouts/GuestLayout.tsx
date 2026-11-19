
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function GuestLayout({
    children,
}: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-[#faf8f4] text-[#30271f]">
            <header className="border-b border-[#e8ded3] bg-white">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-[#795334]"
                    >
                        Vite & Gourmand
                    </Link>

                    <Link
                        href="/"
                        className="text-sm font-medium text-[#795334] hover:underline"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </header>

            <main className="px-4 py-10 sm:px-6 sm:py-14">
                <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e8ded3] bg-white p-6 shadow-sm sm:p-10">
                    {children}
                </div>
            </main>

            <footer className="px-6 pb-8 text-center text-xs text-gray-500">
                © 2026 Vite & Gourmand — Projet pédagogique ECF
            </footer>
        </div>
    );
}
