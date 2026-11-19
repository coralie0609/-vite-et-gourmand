
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->id();

            // Client ayant laissé l'avis
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Commande concernée
            $table->foreignId('commande_id')
                ->constrained('commandes')
                ->cascadeOnDelete();

            // Un seul avis par commande
            $table->unique('commande_id');

            // Note de 1 à 5
            $table->unsignedTinyInteger('note');

            // Commentaire du client
            $table->text('commentaire');

            // Avis en attente de validation par défaut
            $table->string('statut')
                ->default('en_attente');

            // Employé ayant modéré l'avis
            $table->foreignId('valide_par')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('valide_le')->nullable();

            $table->timestamps();

            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
