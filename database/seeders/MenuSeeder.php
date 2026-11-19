<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            [
                'titre' => 'Menu Tradition',
                'description' => 'Un repas généreux aux saveurs authentiques.',
                'theme' => 'Traditionnel',
                'regime' => 'Classique',
                'personnes_min' => 4,
                'prix' => 100,
                'image' => 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
                'conditions' => 'Commande au moins 3 jours avant la prestation. Conservation au frais.',
                'stock' => 15,
            ],
            [
                'titre' => 'Menu de Noël',
                'description' => 'Un menu festif pour partager un moment inoubliable.',
                'theme' => 'Noël',
                'regime' => 'Classique',
                'personnes_min' => 6,
                'prix' => 210,
                'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
                'conditions' => 'Commande au moins 10 jours avant la prestation.',
                'stock' => 8,
            ],
            [
                'titre' => 'Menu Végétarien',
                'description' => 'Une cuisine créative autour des légumes de saison.',
                'theme' => 'Classique',
                'regime' => 'Végétarien',
                'personnes_min' => 2,
                'prix' => 55,
                'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                'conditions' => 'Commande au moins 48 heures avant la prestation.',
                'stock' => 20,
            ],
            [
                'titre' => 'Menu de Pâques',
                'description' => 'Des recettes raffinées pour célébrer le printemps.',
                'theme' => 'Pâques',
                'regime' => 'Classique',
                'personnes_min' => 4,
                'prix' => 135,
                'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'conditions' => 'Commande au moins 7 jours avant la prestation.',
                'stock' => 10,
            ],
            [
                'titre' => 'Menu Vegan',
                'description' => 'Des associations gourmandes entièrement végétales.',
                'theme' => 'Classique',
                'regime' => 'Vegan',
                'personnes_min' => 2,
                'prix' => 60,
                'image' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
                'conditions' => 'Commande au moins 48 heures avant la prestation.',
                'stock' => 20,
            ],
            [
                'titre' => 'Menu Événement',
                'description' => 'Une formule conviviale pour vos réceptions.',
                'theme' => 'Événement',
                'regime' => 'Classique',
                'personnes_min' => 10,
                'prix' => 350,
                'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
                'conditions' => 'Commande au moins 14 jours avant la prestation.',
                'stock' => 5,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(
                ['titre' => $menu['titre']],
                $menu
            );
        }
    }
}
