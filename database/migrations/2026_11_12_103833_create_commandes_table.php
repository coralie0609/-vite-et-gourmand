
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('menu_id')
                ->constrained('menus')
                ->restrictOnDelete();

            $table->string('nom_client');
            $table->string('email_client');
            $table->string('telephone');

            $table->string('adresse_livraison');
            $table->string('code_postal', 10);
            $table->string('ville');

            $table->date('date_livraison');
            $table->time('heure_livraison');

            $table->unsignedInteger('nombre_personnes');
            $table->decimal('distance_km', 8, 2)->default(0);

            $table->decimal('prix_menu', 10, 2);
            $table->decimal('reduction', 10, 2)->default(0);
            $table->decimal('frais_livraison', 10, 2);
            $table->decimal('total', 10, 2);

            $table->string('statut')->default('en_attente');

            $table->timestamps();

            $table->index(['statut', 'date_livraison']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
