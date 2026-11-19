<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Plat extends Model
{
    protected $fillable = [
        'menu_id',
        'nom',
        'categorie',
        'description',
        'ingredients',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function allergenes(): BelongsToMany
    {
        return $this->belongsToMany(
            Allergene::class,
            'allergene_plat'
        );
    }
}
