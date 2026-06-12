# Production des assets

La liste de production se trouve dans `data/assets-manifest.yaml`.

## Etats

- `planned`: brief pret, generation non validee.
- `in_progress`: generation ou corrections en cours.
- `review`: asset visible dans `public/assets/review`, en attente d'un avis.
- `approved`: direction validee, pret a etre decline en asset de jeu.
- `final`: asset optimise et charge par le jeu.

## Regle de confidentialite

Les chemins `private_references` servent uniquement pendant la production locale. Les fichiers de `data/photos` ne doivent jamais etre copies dans `public` ni charges par le jeu.

## État actuel

Les cinq lots de concepts sont approuvés. Les PNG de `public/assets/review` restent des références visuelles; les fichiers réellement chargés par Phaser sont suivis séparément dans `data/game-assets-manifest.yaml`.

Concepts principaux conservés:

- `public/assets/review/batch-01-first-meeting/hero-first-meeting-concept-v1.png`
- `public/assets/review/batch-01-first-meeting/companion-first-meeting-concept-v1.png`
- `public/assets/review/batch-01-first-meeting/first-meeting-environment-concept-v23.png`
- `public/assets/review/batch-01-first-meeting/white-minibus-concept-v1.png`

Décor final UNIL:

- `public/assets/game/environments/unil/unil-sport-v12.png`

Les corrections visuelles futures doivent créer une nouvelle version sans remplacer silencieusement la version déclarée dans le manifeste.

## Assets narratifs

Les avatars WhatsApp et les deux pieces jointes de la conversation sont finalises:

- `public/assets/characters/hero/avatar-whatsapp.png`
- `public/assets/characters/companion/avatar-whatsapp.png`
- `public/assets/objects/pistol-photos-placeholder.png`
- `public/assets/story/anna-program-ideas-placeholder.png`
