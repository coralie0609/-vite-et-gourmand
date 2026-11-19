
<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\EspaceClientController;
use App\Http\Controllers\EmployeCommandeController;
use App\Http\Controllers\AdminEmployeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Accueil
|--------------------------------------------------------------------------
*/

Route::get('/', function () {

    // Récupérer uniquement les avis validés
    $avisClients = \Illuminate\Support\Facades\DB::table('avis')
        ->join('users', 'users.id', '=', 'avis.user_id')
        ->join('commandes', 'commandes.id', '=', 'avis.commande_id')
        ->join('menus', 'menus.id', '=', 'commandes.menu_id')
        ->where('avis.statut', 'valide')
        ->select(
            'avis.id',
            'avis.note',
            'avis.commentaire',
            'avis.created_at',
            'users.name as client_nom',
            'menus.titre as menu_titre'
        )
        ->orderByDesc('avis.valide_le')
        ->limit(6)
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
       'avisClients' => $avisClients,
'horaires' => \App\Models\Horaire::orderBy('jour_numero')->get(),
]);
});


/*
|--------------------------------------------------------------------------
| Tableau de bord et profil
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return redirect('/');
})->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Menus
|--------------------------------------------------------------------------
*/

Route::get('/api/menus', [
    \App\Http\Controllers\MenuController::class,
    'index'
]);

Route::get('/api/menus/{menu}', [
    \App\Http\Controllers\MenuController::class,
    'show'
]);

Route::get('/menus/{menu}', function (\App\Models\Menu $menu) {
    return Inertia::render('MenuDetail', [
        'id' => $menu->id,
    ]);
})->name('menus.show');

/*
|--------------------------------------------------------------------------
| Commandes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::get('/commandes/creer', [
        CommandeController::class,
        'create'
    ])->name('commandes.create');

    Route::post('/commandes', [
        CommandeController::class,
        'store'
    ])->name('commandes.store');

    Route::get('/commandes/{commande}/confirmation', [
        CommandeController::class,
        'confirmation'
    ])
        ->whereNumber('commande')
        ->name('commandes.confirmation');

});

/*
|--------------------------------------------------------------------------
| Espace client
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::get('/mon-espace', [
        EspaceClientController::class,
        'index'
    ])->name('espace-client.index');

    Route::patch('/mes-commandes/{commande}/annuler', [
        EspaceClientController::class,
        'annuler'
    ])
        ->whereNumber('commande')
        ->name('espace-client.annuler');
// Modifier une commande encore en attente
Route::patch('/mes-commandes/{commande}/modifier', [
    EspaceClientController::class,
    'modifier'
])
    ->whereNumber('commande')
    ->name('espace-client.modifier');

 
    // Enregistrer un avis client après une commande terminée
    Route::post('/mes-commandes/{commande}/avis', [
        \App\Http\Controllers\AvisController::class,
        'store'
    ])
        ->whereNumber('commande')
        ->name('espace-client.avis.store');
   
});

/*
|--------------------------------------------------------------------------
| Gestion des commandes - Employés et administrateurs
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::get('/employe/commandes', [
        EmployeCommandeController::class,
        'index'
    ])->name('employe.commandes.index');

    Route::patch('/employe/commandes/{commande}/statut', [
        EmployeCommandeController::class,
        'changerStatut'
    ])
        ->whereNumber('commande')
        ->name('employe.commandes.statut');
 
    // Valider la demande de prêt de matériel
    Route::patch('/employe/commandes/{commande}/materiel/valider', [
        EmployeCommandeController::class,
        'validerMateriel'
    ])
        ->whereNumber('commande')
        ->name('employe.commandes.materiel.valider');

    // Confirmer la remise du matériel
    Route::patch('/employe/commandes/{commande}/materiel/remettre', [
        EmployeCommandeController::class,
        'remettreMateriel'
    ])
        ->whereNumber('commande')
        ->name('employe.commandes.materiel.remettre');

    // Confirmer la restitution du matériel
    Route::patch('/employe/commandes/{commande}/materiel/restituer', [
        EmployeCommandeController::class,
        'restituerMateriel'
    ])
        ->whereNumber('commande')
        ->name('employe.commandes.materiel.restituer');

    // Consulter les avis clients
    Route::get('/employe/avis', [
        \App\Http\Controllers\EmployeAvisController::class,
        'index'
    ])
        ->name('employe.avis.index');

    // Valider ou refuser un avis
    Route::patch('/employe/avis/{avis}', [
        \App\Http\Controllers\EmployeAvisController::class,
        'moderer'
    ])
        ->whereNumber('avis')
        ->name('employe.avis.moderer');
       

});

/*
|--------------------------------------------------------------------------
| Gestion des employés - Administrateur uniquement
|--------------------------------------------------------------------------
|
| Le contrôleur vérifie le rôle admin dans chaque méthode.
|
*/

Route::middleware('auth')->group(function () {

    // Afficher les employés
    Route::get('/admin/employes', [
        AdminEmployeController::class,
        'index'
    ])->name('admin.employes.index');

    // Créer un employé
    Route::post('/admin/employes', [
        AdminEmployeController::class,
        'store'
    ])->name('admin.employes.store');

    // Activer ou désactiver un employé
    Route::patch('/admin/employes/{employe}/statut', [
        AdminEmployeController::class,
        'changerStatut'
    ])
        ->whereNumber('employe')
        ->name('admin.employes.statut');

});

/*
|--------------------------------------------------------------------------
| Statistiques administrateur - MongoDB
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    Route::get('/admin/statistiques', [
        \App\Http\Controllers\AdminStatistiquesController::class,
        'index'
    ])->name('admin.statistiques.index');

});
// Page publique : mentions légales
Route::get('/mentions-legales', function () {
    return \Inertia\Inertia::render('MentionsLegales');
})->name('mentions.legales');
// Page publique : conditions générales de vente
Route::get('/cgv', function () {
    return \Inertia\Inertia::render('CGV');
})->name('cgv');
// Page de contact accessible à tous les visiteurs
Route::get('/contact', [
    \App\Http\Controllers\ContactController::class,
    'index'
])->name('contact.index');

// Traitement du formulaire de contact
Route::post('/contact', [
    \App\Http\Controllers\ContactController::class,
    'store'
])->middleware('throttle:5,1')->name('contact.store');

// Gestion des menus et des plats — employés et administrateurs
Route::middleware('auth')->group(function () {

    Route::get('/employe/menus', [
        \App\Http\Controllers\EmployeMenuController::class,
        'index'
    ])->name('employe.menus.index');

    Route::patch('/employe/menus/{menu}', [
        \App\Http\Controllers\EmployeMenuController::class,
        'updateMenu'
    ])->name('employe.menus.update');

    Route::post('/employe/plats', [
        \App\Http\Controllers\EmployeMenuController::class,
        'storePlat'
    ])->name('employe.plats.store');

    Route::patch('/employe/plats/{plat}', [
        \App\Http\Controllers\EmployeMenuController::class,
        'updatePlat'
    ])->name('employe.plats.update');

    Route::delete('/employe/plats/{plat}', [
        \App\Http\Controllers\EmployeMenuController::class,
        'destroyPlat'
    ])->name('employe.plats.destroy');
});
// Gestion des horaires — employés et administrateurs
Route::middleware('auth')->group(function () {

    Route::get('/employe/horaires', [
        \App\Http\Controllers\EmployeHoraireController::class,
        'index'
    ])->name('employe.horaires.index');

    Route::patch('/employe/horaires/{horaire}', [
        \App\Http\Controllers\EmployeHoraireController::class,
        'update'
    ])->name('employe.horaires.update');

});
