
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('prenom')->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('adresse')->nullable();
            $table->string('code_postal', 10)->nullable();
            $table->string('ville', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'prenom',
                'telephone',
                'adresse',
                'code_postal',
                'ville',
            ]);
        });
    }
};
