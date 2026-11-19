<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Contact');
    }

    public function store(Request $request)
    {
        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'sujet' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Adresse fictive utilisée pour la démonstration ECF.
        $destinataire = 'contact@vite-et-gourmand.example';

        $contenu = "Nouveau message depuis Vite & Gourmand\n\n"
            . "Nom : {$donnees['nom']}\n"
            . "E-mail : {$donnees['email']}\n"
            . "Sujet : {$donnees['sujet']}\n\n"
            . "Message :\n{$donnees['message']}";

        try {
            Mail::raw($contenu, function ($mail) use ($donnees, $destinataire) {
                $mail->to($destinataire)
                    ->replyTo($donnees['email'], $donnees['nom'])
                    ->subject('Contact Vite & Gourmand - ' . $donnees['sujet']);
            });
        } catch (\Throwable $exception) {
            Log::error('Erreur lors de l’envoi du formulaire de contact.', [
                'exception' => $exception->getMessage(),
            ]);

            return back()->withErrors([
                'message' => "Le message n'a pas pu être envoyé. Veuillez réessayer.",
            ]);
        }

        return redirect()
            ->route('contact.index')
            ->with('success', 'Votre message a bien été envoyé.');
    }
}
