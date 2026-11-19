
import { Head, Link } from '@inertiajs/react';

export default function CGV() {
    return (
        <>
            <Head title="Conditions générales de vente - Vite & Gourmand" />

            <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#392f29]">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/"
                        className="font-semibold text-[#795334] hover:underline"
                    >
                        ← Retour à l'accueil
                    </Link>

                    <article className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-10">
                        <h1 className="mb-6 text-3xl font-bold">
                            Conditions générales de vente
                        </h1>

                        <p className="mb-8 text-sm text-gray-600">
                            Document de démonstration pour le projet pédagogique
                            Vite & Gourmand. Aucune vente réelle n'est réalisée
                            sur ce site.
                        </p>

                        <div className="space-y-8 leading-7">
                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    1. Présentation
                                </h2>
                                <p>
                                    Vite & Gourmand est une entreprise fictive
                                    de traiteur événementiel située à Bordeaux.
                                    Elle propose des menus pour différentes
                                    occasions : événements, fêtes et repas
                                    traditionnels ou végétariens.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    2. Menus et tarifs
                                </h2>
                                <p>
                                    Chaque menu possède une description,
                                    une composition, des informations sur les
                                    allergènes, un prix et un nombre de convives.
                                    Les prix affichés sont utilisés uniquement
                                    pour la simulation de commandes.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    3. Commandes
                                </h2>
                                <p>
                                    Le client sélectionne un menu et complète
                                    les informations demandées pour enregistrer
                                    une commande. La commande peut ensuite être
                                    suivie depuis son espace personnel.
                                </p>
                                <p className="mt-2">
                                    Les commandes sont soumises aux règles de
                                    disponibilité et de validation prévues dans
                                    l'application.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    4. Livraison
                                </h2>
                                <p>
                                    Les modalités de livraison, les frais
                                    éventuels et le montant total sont
                                    présentés au client lors de la simulation
                                    de commande, selon les informations
                                    renseignées.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    5. Annulation
                                </h2>
                                <p>
                                    Une demande d'annulation peut être effectuée
                                    selon les possibilités et les conditions
                                    prévues par l'application. Son traitement
                                    dépend de l'état d'avancement de la commande.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    6. Prêt de matériel
                                </h2>
                                <p>
                                    Du matériel peut être associé à certaines
                                    commandes. Sa remise et sa restitution
                                    sont suivies par l'entreprise fictive.
                                    Les éventuelles conditions de restitution
                                    sont communiquées dans le parcours de
                                    commande.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    7. Paiement
                                </h2>
                                <p>
                                    Les commandes et les montants affichés
                                    sont fictifs. Aucun paiement réel n'est
                                    encaissé dans le cadre de ce projet ECF.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-2 text-xl font-bold">
                                    8. Données personnelles
                                </h2>
                                <p>
                                    Les informations utilisées pour tester
                                    les comptes et les commandes doivent être
                                    fictives. Ce document ne constitue pas
                                    des conditions contractuelles destinées
                                    à une exploitation commerciale réelle.
                                </p>
                            </section>
                        </div>
                    </article>
                </div>
            </main>
        </>
    );
}
