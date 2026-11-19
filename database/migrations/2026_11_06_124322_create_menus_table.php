
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->string('theme');
            $table->string('regime');
            $table->unsignedInteger('personnes_min');
            $table->decimal('prix', 10, 2);
            $table->string('image')->nullable();
            $table->text('conditions')->nullable();
            $table->unsignedInteger('stock')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
