
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande_materiel_demandes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commande_id')
                ->unique()
                ->constrained('commandes')
                ->cascadeOnDelete();

            // Quantités d'assiettes, verres, couverts,
            // tables, chaises et bancs demandées.
            $table->json('quantites');

            // Date souhaitée par le client.
            $table->date('date_reception_souhaitee');

            // Date calculée : 10 jours ouvrés
            // après la prestation.
            $table->date('date_limite_restitution');

            // Complétées lors de la remise et du retour.
            $table->dateTime('date_remise_reelle')->nullable();
            $table->dateTime('date_restitution_reelle')->nullable();

            // Demande initiale, à confirmer par le traiteur.
            $table->string('statut')->default('demandee');

            // Suivi de l'e-mail confirmant la restitution.
            $table->dateTime('email_restitution_envoye_at')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_materiel_demandes');
    }
};
