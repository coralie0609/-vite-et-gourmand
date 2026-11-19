<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    
public function store(Request $request): RedirectResponse
{
    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],

        'prenom' => ['required', 'string', 'max:255'],

        'email' => [
            'required',
            'string',
            'lowercase',
            'email',
            'max:255',
            'unique:' . User::class,
        ],

        'telephone' => ['required', 'string', 'max:30'],

        'adresse' => ['required', 'string', 'max:255'],

        'code_postal' => ['required', 'string', 'max:10'],

        'ville' => ['required', 'string', 'max:100'],

        'password' => [
            'required',
            'confirmed',
            Rules\Password::min(10)
                ->mixedCase()
                ->numbers()
                ->symbols(),
        ],
    ]);

    $user = User::create([
        'name' => $data['name'],
        'prenom' => $data['prenom'],
        'email' => $data['email'],
        'telephone' => $data['telephone'],
        'adresse' => $data['adresse'],
        'code_postal' => $data['code_postal'],
        'ville' => $data['ville'],
        'password' => Hash::make($data['password']),
        'role' => 'utilisateur',
        'actif' => true,
    ]);

    event(new Registered($user));

        // Envoyer un e-mail de bienvenue après l'inscription.
        try {
            $prenom = $user->prenom ?: $user->name;

            $texte = "Bonjour {$prenom},\n\n"
                . "Bienvenue chez Vite & Gourmand !\n\n"
                . "Votre compte client a bien été créé.\n"
                . "Vous pouvez dès maintenant découvrir nos menus "
                . "et préparer vos prochaines commandes.\n\n"
                . "Découvrez nos menus : " . url('/') . "#menus\n\n"
                . "Merci de votre confiance.\n\n"
                . "À bientôt,\n"
                . "L'équipe Vite & Gourmand";

            \Illuminate\Support\Facades\Mail::raw(
                $texte,
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Bienvenue chez Vite & Gourmand !');
                }
            );
        } catch (\Throwable $e) {
            report($e);
        }

    Auth::login($user);

    return redirect(route('dashboard', absolute: false));
}

}
