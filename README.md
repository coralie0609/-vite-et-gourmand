
# Vite & Gourmand

## Projet ECF — Développeur Web et Web Mobile

Vite & Gourmand est une application web de gestion d'un service traiteur événementiel situé à Bordeaux.

Ce projet a été développé dans le cadre de l'Évaluation en Cours de Formation (ECF) du titre professionnel Développeur Web et Web Mobile (DWWM).

L'application propose un catalogue de menus et des espaces distincts pour les clients, les employés et les administrateurs.

## Technologies utilisées

### Back-end
- PHP et Laravel
- Laravel Breeze pour l'authentification
- SQLite pour les données relationnelles
- MongoDB Atlas pour les statistiques NoSQL

### Front-end
- React
- TypeScript
- Inertia.js
- Vite
- Tailwind CSS
- HTML et CSS responsive

### Outils
- Visual Studio Code
- Git et GitHub
- Composer
- npm

## Fonctionnalités

### Espace public
- Présentation de Vite & Gourmand
- Catalogue de six menus
- Filtres par thème, prix et nombre de convives
- Consultation des plats, ingrédients et allergènes
- Consultation des avis clients validés
- Affichage des horaires d'ouverture
- Formulaire de contact
- Mentions légales et conditions générales de vente

### Espace client
- Inscription et connexion
- Gestion du profil personnel
- Commande de menus
- Consultation et suivi des commandes
- Gestion des demandes de matériel
- Possibilité de laisser un avis

### Espace employé
- Consultation et gestion des commandes
- Modification des statuts de commande
- Gestion des menus et des plats
- Ajout, modification et suppression de plats
- Modération des avis clients
- Modification des horaires d'ouverture

### Espace administrateur
- Accès aux fonctionnalités de gestion
- Gestion des comptes employés
- Consultation des statistiques
- Suivi du nombre de commandes par menu
- Consultation du chiffre d'affaires avec filtres
- Exploitation de MongoDB Atlas

## Architecture

L'application utilise Laravel pour le traitement côté serveur, React et TypeScript pour l'interface utilisateur, et Inertia.js pour la communication entre les deux.

SQLite conserve les informations relationnelles, notamment les utilisateurs, menus, plats, commandes et horaires.

MongoDB Atlas est utilisé pour les données statistiques.

## Installation locale

### Prérequis
- PHP compatible avec les dépendances du projet
- Composer
- Node.js et npm
- Extension PHP MongoDB pour les statistiques
- Accès à MongoDB Atlas pour les statistiques

### Installation

Cloner le dépôt :

```bash
git clone https://github.com/coralie0609/-vite-et-gourmand.git
cd -- -vite-et-gourmand
```

Installer les dépendances PHP :

```bash
composer install
```

Installer les dépendances JavaScript :

```bash
npm install
```

Créer le fichier de configuration :

```bash
cp .env.example .env
```

Générer la clé Laravel :

```bash
php artisan key:generate
```

Configurer SQLite dans le fichier `.env` :

```dotenv
DB_CONNECTION=sqlite
```

Créer le fichier SQLite si nécessaire :

```bash
touch database/database.sqlite
```

Créer les tables :

```bash
php artisan migrate
```

Les fichiers de migrations sont disponibles dans le dossier `database/migrations`.

### Données de démonstration

Le projet contient des seeders dans le dossier `database/seeders`.

L'initialisation complète des données de démonstration et des comptes de test doit être vérifiée avant une installation destinée à un évaluateur.

### Configuration MongoDB Atlas

Pour utiliser les statistiques, renseigner les paramètres MongoDB nécessaires dans le fichier `.env` :

```dotenv
MONGODB_URI=
MONGODB_DATABASE=vite_et_gourmand_stats
```

Une connexion MongoDB Atlas valide est nécessaire pour accéder aux statistiques.

Aucun identifiant MongoDB réel n'est fourni dans le dépôt.

### Démarrer l'application

Dans un premier terminal :

```bash
php artisan serve
```

Dans un deuxième terminal :

```bash
npm run dev
```

L'application est alors accessible à l'adresse :

http://127.0.0.1:8000

## Authentification et rôles

L'application distingue trois catégories d'utilisateurs :

- Client
- Employé
- Administrateur

Les fonctionnalités accessibles dépendent du rôle de l'utilisateur connecté.

Les comptes et mots de passe de démonstration ne sont pas publiés dans ce dépôt.

## Gestion des e-mails

L'application utilise le système de messagerie Laravel.

Pour les tests, le mode suivant permet de conserver les e-mails dans les journaux locaux :

```dotenv
MAIL_MAILER=log
```

Les messages sont consultables dans `storage/logs/laravel.log`.

Ce mode ne correspond pas à un envoi réel par un serveur SMTP.

## Sécurité

- Authentification via Laravel Breeze
- Contrôle des accès selon les rôles
- Validation des données côté serveur
- Protection CSRF de Laravel
- Exclusion des fichiers de configuration sensibles
- Exclusion de la base SQLite locale du dépôt Git

Le fichier `.env` ne doit jamais être publié.

## Organisation du projet

- `app/` : modèles, contrôleurs et logique applicative
- `config/` : configuration Laravel
- `database/migrations/` : structure de la base de données
- `database/seeders/` : données d'initialisation
- `public/` : ressources publiques et images
- `resources/js/Pages/` : pages React et TypeScript
- `resources/js/Components/` : composants réutilisables
- `routes/web.php` : routes de l'application
- `tests/` : tests automatisés

## État du projet

Projet pédagogique développé pour l'ECF DWWM.

Le code source est disponible dans ce dépôt GitHub privé.

L'application a été développée et testée en environnement local. Un hébergement public n'est pas encore indiqué dans cette documentation.

## Auteur

Projet réalisé dans le cadre de la formation Développeur Web et Web Mobile.

Novembre 2026.
