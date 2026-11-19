
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Informations complémentaires pour le suivi
        Schema::table('commandes', function (Blueprint $table) {
            $table->boolean('materiel_prete')->default(false);
            $table->dateTime('materiel_restitue_le')->nullable();

            $table->dateTime('contact_client_le')->nullable();
            $table->string('mode_contact', 20)->nullable();
            $table->text('motif_annulation')->nullable();
        });

        // Historique de chaque changement de statut
        Schema::create('commande_statuts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('commande_id')
                ->constrained('commandes')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('ancien_statut')->nullable();
            $table->string('nouveau_statut');

            $table->text('commentaire')->nullable();

            $table->timestamps();

            $table->index(['commande_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_statuts');

        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn([
                'materiel_prete',
                'materiel_restitue_le',
                'contact_client_le',
                'mode_contact',
                'motif_annulation',
            ]);
        });
    }
};
