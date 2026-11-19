
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horaires', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('jour_numero')->unique();
            $table->string('jour');
            $table->time('ouverture')->nullable();
            $table->time('fermeture')->nullable();
            $table->boolean('ferme')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horaires');
    }
};
