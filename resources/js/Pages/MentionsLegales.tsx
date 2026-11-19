
import { Head, Link } from '@inertiajs/react';

export default function MentionsLegales() {
    return (
        <>
            <Head title="Mentions légales - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#392f29]">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/"
                        className="font-semibold text-[#795334] hover:underline"
                    >
                        ← Retour à l'accueil
                    </Link>

                    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-10">
                        <h1 className="mb-6 text-3xl font-bold">
                            Mentions légales
                        </h1>

                        <p className="mb-8 text-sm text-gray-600">
                            Site fictif réalisé dans le cadre d'une
                            évaluation de compétences en développement web.
                        </p>

                        <div className="space-y-8 leading-7">
                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    1. Présentation du site
                                </h2>
                                <p>
                                    Vite & Gourmand est une entreprise fictive
                                    de traiteur événementiel située à Bordeaux.
                                    Ce site présente des menus et permet de
                                    simuler des commandes.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    2. Éditeur du site
                                </h2>
                                <p>
                                    Nom : Vite & Gourmand (entreprise fictive)
                                </p>
                                <p>
                                    Localisation : Bordeaux, France
                                </p>
                                <p>
                                    Les informations d'immatriculation,
                                    d'adresse et de contact réelles ne sont
                                    pas applicables à ce projet pédagogique.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    3. Hébergement
                                </h2>
                                <p>
                                    Les coordonnées de l'hébergeur seront
                                    précisées lors du déploiement du site.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    4. Propriété intellectuelle
                                </h2>
                                <p>
                                    Les textes, éléments graphiques et
                                    fonctionnalités de ce site sont utilisés
                                    dans un cadre pédagogique. Les droits
                                    attachés aux ressources appartenant à
                                    des tiers restent réservés à leurs
                                    titulaires.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    5. Données personnelles
                                </h2>
                                <p>
                                    L'application utilise des données de
                                    comptes et de commandes pour simuler
                                    le fonctionnement d'un service de
                                    traiteur. Les données saisies lors
                                    des tests doivent être fictives.
                                </p>
                                <p className="mt-2">
                                    Avant toute mise en production réelle,
                                    les informations relatives à la
                                    protection des données personnelles
                                    devront être complétées.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
