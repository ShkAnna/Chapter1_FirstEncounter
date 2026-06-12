# Chapitre 1: Première Rencontre

Jeu narratif top-down en Phaser qui raconte la première rencontre d'Alex et Anna, des inscriptions au cours de tir jusqu'à leur premier bisou à la gare de Lausanne.

Le joueur contrôle Alex. Anna le suit dans les scènes explorables, dialogue avec lui et participe au déblocage des souvenirs.

## Contenu

- 10 scènes narratives jouables;
- progression sauvegardée dans le navigateur;
- déplacements, caméra, collisions et zones accessibles;
- interactions contextuelles, dialogues et transitions;
- décors finaux pour UNIL Sport, Vernand, PolyLAN, Chauderon et la gare de Lausanne;
- prologue, conversation WhatsApp et message final.

## Structure

```text
data/
  photos/          Photos sources privées, jamais chargées par le jeu.
  story/           Scripts et données narratives.
  *-manifest.yaml  Suivi des concepts et des assets finaux.
docs/              Conception et production.
public/assets/
  game/            Assets finaux chargés par Phaser.
  review/          Concepts visuels approuvés.
  antigrav_test/   Essais externes, exclus du suivi du jeu.
src/               Code TypeScript du jeu.
```

## Installation

```bash
npm install
npm run dev
```

Pendant le développement, une scène peut être ouverte directement avec
`http://127.0.0.1:5173/?scene=arrival_vernand`. Les identifiants disponibles sont listés dans `src/game/progress.ts`. Ce raccourci est désactivé dans le build de production.

Production:

```bash
npm run build
npm run preview
```

## Contrôles

- Flèches directionnelles: déplacer Alex.
- `E`: interagir avec le point proche.
- `Espace`: avancer dans les dialogues et transitions.
- `N` depuis le menu: recommencer depuis le prologue.
