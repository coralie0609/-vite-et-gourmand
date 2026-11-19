<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Menu extends Model
{
    protected $fillable = [
        'titre',
        'description',
        'theme',
        'regime',
        'personnes_min',
        'prix',
        'image',
        'conditions',
        'stock',
    ];

    protected $casts = [
        'prix' => 'decimal:2',
        'personnes_min' => 'integer',
        'stock' => 'integer',
    ];
  
public function plats(): HasMany
{
    return $this->hasMany(Plat::class);
}
  
}
