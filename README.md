# Console technique du CETIC de Mezesse

Le poste de pilotage du développeur, séparé de l'application de l'école : quels téléphones ont quelle version, ce qui plante, et comment arrêter une mise à jour défectueuse.

Next.js 16 (App Router), React 19, TanStack Query, Tailwind CSS. Les routes sont dans l'API [cetic-mezesse-backend](https://github.com/Dominique-BRIA/cetic-mezesse-backend) (`/api/console/...`) : aucun serveur de plus à héberger.

## Pages

| Page | Contenu |
|---|---|
| Aperçu | Appareils, comptes sans appareil, plantages, répartition des versions |
| Appareils | Chaque téléphone : compte, version, correctif, modèle, dernière activité. Comptes dont aucun téléphone ne s'est signalé |
| Plantages | Erreurs regroupées par origine, pile d'appels, téléphones touchés, marquage « résolu ». Conservées 90 jours |
| Mises à jour | Suspendre toutes les mises à jour, bloquer une version, fixer la version minimale, sans rien publier |
| Journal | Chaque connexion et chaque action faite ici |

La console n'affiche que de la technique : jamais les notes ni les élèves.

## Sécurité

- Comptes à part (table `AdminConsole`), hors des comptes de l'école : un jeton de console n'ouvre aucune route de l'école, et l'inverse non plus.
- Double authentification obligatoire ; cinq échecs verrouillent le compte un quart d'heure.
- Session de 8 heures, gardée dans l'onglet (`sessionStorage`) : fermer l'onglet déconnecte.

## Mise en service

1. **API** : déployer la version qui contient la migration V7, avec ces réglages Azure :
   - `CONSOLE_ADMIN_EMAIL` et `CONSOLE_ADMIN_MOT_DE_PASSE` (12 caractères au moins) : le premier compte, créé au démarrage si aucun n'existe ;
   - `CORS_ORIGINS` : y ajouter l'adresse de la console.
2. **Vercel** : importer ce dépôt, avec la variable `NEXT_PUBLIC_API_URL` (adresse de l'API, terminée par `/api`).
3. **Première connexion** : e-mail et mot de passe, code laissé vide. La console affiche un QR code à scanner avec une application d'authentification (Google Authenticator, Aegis…), puis demande le premier code.

Si le téléphone d'authentification est perdu : remettre `totpActif` à `false` et `totpSecret` à vide pour ce compte dans la base, puis se reconnecter pour scanner un nouveau code.

## Lancer en local

```bash
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL : adresse de l'API locale
npm run dev                   # http://localhost:5180
```

L'origine `http://localhost:5180` doit figurer dans `CORS_ORIGINS` de l'API locale.
