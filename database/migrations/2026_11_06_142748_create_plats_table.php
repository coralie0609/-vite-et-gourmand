
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')
                ->constrained('menus')
                ->cascadeOnDelete();
            $table->string('nom');
            $table->string('categorie');
            $table->text('description')->nullable();
            $table->text('ingredients')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plats');
    }
};
