# Production des assets de jeu

Le suivi se trouve dans `data/game-assets-manifest.yaml`.

## Regles

- Les concepts `review` definissent la direction visuelle.
- Les photos privees sous `data/photos` ne sont jamais publiees.
- Les planches generees sont conservees sous `public/assets/game/source-sheets`.
- Les elements avec fond transparent sont nettoyes puis ranges par usage.
- Les anciens essais restent dans `public/assets/antigrav_test` et ne sont pas modifies.

## Ordre de production

1. Decors jouables sans personnages integres.
2. Personnages principaux et variantes de tenue.
3. PNJ reutilisables.
4. Vehicules et objets interactifs.
5. UI, souvenirs et transitions.

## Cible technique

- Camera top-down trois-quarts coherente avec les concepts.
- Decors larges au ratio 16:9.
- Sprites et objets sur fond transparent.
- Silhouettes lisibles a petite echelle.
- Pas de texte ou de logo integre aux objets, sauf demande narrative explicite.

## Livraison actuelle

- 9 decors jouables et 13 versions precedentes conservees.
- 40 sprites et portraits de personnages.
- 28 vehicules, accessoires et objets interactifs.
- 21 composants et planches UI.
- 12 planches sources conservees pour les variantes futures.
- 123 fichiers PNG au total.

Tous les lots suivis dans le manifeste sont au statut `final`. Chaque chemin déclaré dans `data/game-assets-manifest.yaml` existe dans le dépôt.

Les décors actuellement chargés sont:

- `prologue/anna-room.png` et `prologue/alex-room-v5.png`;
- `unil/unil-sport-v12.png`;
- `vernand/exterior.png`, `briefing-room.png` et `range-25m-v7.png`;
- `polylan/hall-v2.png`;
- `night-finale/chauderon-v4.png` et `lausanne-station.png`.
