
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commande_materiel_demandes', function (Blueprint $table) {
            // Heure souhaitée pour recevoir le matériel.
            $table->time('heure_reception_souhaitee')->nullable();

            // Heure souhaitée pour restituer le matériel
            // à la date limite automatiquement calculée.
            $table->time('heure_restitution_souhaitee')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('commande_materiel_demandes', function (Blueprint $table) {
            $table->dropColumn([
                'heure_reception_souhaitee',
                'heure_restitution_souhaitee',
            ]);
        });
    }
};
