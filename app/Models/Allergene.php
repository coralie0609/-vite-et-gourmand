<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Allergene extends Model
{
    protected $fillable = [
        'nom',
    ];

    public function plats(): BelongsToMany
    {
        return $this->belongsToMany(
            Plat::class,
            'allergene_plat'
        );
    }
}
