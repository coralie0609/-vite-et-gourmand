
<?php

return [
    'accepted' => 'Le champ :attribute doit être accepté.',
    'alpha' => 'Le champ :attribute doit contenir uniquement des lettres.',
    'confirmed' => 'La confirmation du champ :attribute ne correspond pas.',
    'email' => 'Le champ :attribute doit être une adresse e-mail valide.',
    'lowercase' => 'Le champ :attribute doit être en minuscules.',
    'max' => [
        'string' => 'Le champ :attribute ne doit pas dépasser :max caractères.',
        'numeric' => 'Le champ :attribute ne doit pas dépasser :max.',
    ],
    'min' => [
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
        'numeric' => 'Le champ :attribute doit être supérieur ou égal à :min.',
    ],
    'required' => 'Le champ :attribute est obligatoire.',
    'string' => 'Le champ :attribute doit être une chaîne de caractères.',
    'unique' => 'Cette valeur pour le champ :attribute est déjà utilisée.',

    'password' => [
        'letters' => 'Le mot de passe doit contenir au moins une lettre.',
        'mixed' => 'Le mot de passe doit contenir au moins une majuscule et une minuscule.',
        'numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
        'symbols' => 'Le mot de passe doit contenir au moins un caractère spécial.',
        'uncompromised' => 'Ce mot de passe figure dans une fuite de données. Choisissez-en un autre.',
    ],

    'attributes' => [
        'name' => 'nom',
        'prenom' => 'prénom',
        'email' => 'adresse e-mail',
        'telephone' => 'téléphone',
        'adresse' => 'adresse postale',
        'code_postal' => 'code postal',
        'ville' => 'ville',
        'password' => 'mot de passe',
        'password_confirmation' => 'confirmation du mot de passe',
    ],
];
