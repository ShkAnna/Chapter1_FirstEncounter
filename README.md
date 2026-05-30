# Chapitre 1: Première Rencontre

Jeu narratif top-down inspire par l'energie de Wizard of Legend, mais centre sur une histoire personnelle: la première rencontre, les lieux importants, les petits details et les souvenirs d'un couple.

Le joueur controle le personnage de ton copain. Ton personnage est un companion/bot qui le suit, dialogue avec lui et l'aide a debloquer les souvenirs.

## Objectif du prototype

Construire une premiere version jouable courte, intime et finie:

- un ecran titre avec le nom du jeu;
- un personnage joueur deplacable au clavier;
- un personnage companion qui suit le joueur;
- une premiere scene de rencontre;
- quelques objets interactifs;
- un systeme de dialogue et de souvenir debloque.

## Structure

```text
data/
  photos/
    raw/         Photos sources privees, non modifiees.
    selected/    Photos choisies pour generation d'assets.
  story/         Donnees narratives modifiables.
docs/            Notes de conception et plan de production.
public/assets/   Assets finaux lisibles par le jeu web.
src/             Code du jeu.
```

## Direction artistique initiale

Style propose par defaut: 2D top-down chibi / semi-pixel art.

Ce style garde une vibe de jeu d'action-aventure tout en etant assez doux pour une histoire romantique. Les photos serviront de reference pour creer des portraits, sprites, lieux et objets coherents.

## Installation future

Le projet est prevu pour Vite + Phaser + TypeScript.

Quand Node.js/npm seront disponibles sur la machine:

```bash
npm install
npm run dev
```

## Donnees a remplir en premier

1. Ajouter les photos dans `data/photos/raw`.
2. Completer `data/story/timeline.md`.
3. Completer `data/story/characters.yaml`.
4. Completer ou ajuster les scenes dans `data/story/scenes.yaml`.
