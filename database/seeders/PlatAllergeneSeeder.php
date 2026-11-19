<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Plat;
use App\Models\Allergene;

class PlatAllergeneSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            'Menu Tradition' => [
                ['Entrée', 'Salade gourmande du terroir',
                    'Salade, tomates, noix et fromage de chèvre',
                    ['Lait', 'Fruits à coque']],
                ['Plat', 'Poulet rôti et gratin dauphinois',
                    'Poulet, pommes de terre, crème et herbes',
                    ['Lait']],
                ['Dessert', 'Tarte aux pommes maison',
                    'Pommes, farine, beurre et œufs',
                    ['Gluten', 'Lait', 'Œufs']],
            ],
            'Menu de Noël' => [
                ['Entrée', 'Foie gras et pain brioché',
                    'Foie gras, farine, beurre et œufs',
                    ['Gluten', 'Lait', 'Œufs']],
                ['Plat', 'Chapon aux marrons',
                    'Chapon, marrons, légumes et sauce à la crème',
                    ['Lait']],
                ['Dessert', 'Bûche chocolat et noisettes',
                    'Chocolat, crème, œufs et noisettes',
                    ['Lait', 'Œufs', 'Fruits à coque']],
            ],
            'Menu Végétarien' => [
                ['Entrée', 'Velouté de potimarron',
                    'Potimarron, crème et graines de courge',
                    ['Lait']],
                ['Plat', 'Risotto aux champignons',
                    'Riz, champignons, parmesan et beurre',
                    ['Lait']],
                ['Dessert', 'Panna cotta aux fruits rouges',
                    'Crème, lait et coulis de fruits rouges',
                    ['Lait']],
            ],
            'Menu de Pâques' => [
                ['Entrée', 'Œufs mimosa',
                    'Œufs, mayonnaise et ciboulette',
                    ['Œufs', 'Moutarde']],
                ['Plat', 'Gigot d’agneau printanier',
                    'Agneau, pommes de terre et légumes',
                    []],
                ['Dessert', 'Nid de Pâques au chocolat',
                    'Chocolat, farine, beurre et œufs',
                    ['Gluten', 'Lait', 'Œufs']],
            ],
            'Menu Vegan' => [
                ['Entrée', 'Salade de quinoa et avocat',
                    'Quinoa, avocat, tomates et citron',
                    []],
                ['Plat', 'Curry de légumes au lait de coco',
                    'Légumes de saison, lait de coco et riz',
                    []],
                ['Dessert', 'Mousse au chocolat végétale',
                    'Chocolat noir et aquafaba',
                    []],
            ],
            'Menu Événement' => [
                ['Entrée', 'Assortiment de petits fours salés',
                    'Pâte feuilletée, fromage et légumes',
                    ['Gluten', 'Lait', 'Œufs']],
                ['Plat', 'Buffet de viandes et accompagnements',
                    'Poulet, bœuf, légumes et sauces',
                    ['Moutarde', 'Lait']],
                ['Dessert', 'Assortiment de mignardises',
                    'Tartelettes, éclairs et petits gâteaux',
                    ['Gluten', 'Lait', 'Œufs', 'Fruits à coque']],
            ],
        ];

        foreach ($menus as $titreMenu => $plats) {
            $menu = Menu::where('titre', $titreMenu)->first();

            if (!$menu) {
                continue;
            }

            foreach ($plats as $donnees) {
                [$categorie, $nom, $ingredients, $nomsAllergenes] = $donnees;

                $plat = Plat::updateOrCreate(
                    [
                        'menu_id' => $menu->id,
                        'nom' => $nom,
                    ],
                    [
                        'categorie' => $categorie,
                        'description' => $nom,
                        'ingredients' => $ingredients,
                    ]
                );

                $ids = [];

                foreach ($nomsAllergenes as $nomAllergene) {
                    $allergene = Allergene::firstOrCreate([
                        'nom' => $nomAllergene,
                    ]);

                    $ids[] = $allergene->id;
                }

                $plat->allergenes()->sync($ids);
            }
        }
    }
}
