# Chapitre 1: Première Rencontre - Game Design

## Pitch

Une aventure top-down romantique ou le joueur traverse les souvenirs de la première rencontre. Chaque scene transforme un moment reel en petite room jouable avec dialogues, objets symboliques et une memoire a debloquer.

## Piliers

- Personnel: chaque scene doit venir d'un souvenir reel.
- Jouable: le joueur doit agir, pas seulement lire.
- Court et fini: mieux vaut 3 scenes polies qu'un grand jeu incomplet.
- Doux mais dynamique: deplacements fluides, interactions rapides, ambiance intime.

## Boucle de gameplay

1. Entrer dans un lieu souvenir.
2. Explorer la scene avec le companion.
3. Interagir avec 2 ou 3 objets.
4. Debloquer un dialogue ou une petite epreuve.
5. Recuperer une memoire.
6. Passer au lieu suivant.

## Personnages

- Hero: ton copain, controle par le joueur.
- Companion: toi, personnage bot qui suit, reagit et guide subtilement.

## Scope conseille pour la V1

- Scene 0: ecran titre.
- Scene 1: avant la rencontre, mise en ambiance.
- Scene 2: premiere rencontre.
- Scene 3: premier moment qui a rendu la rencontre speciale.
- Scene finale: message anniversaire.

## Assets a produire

- Sprites top-down des deux personnages.
- Portraits de dialogue.
- Tiles/backgrounds pour chaque lieu.
- Objets interactifs symboliques.
- Images de souvenirs debloques.
- UI: boite de dialogue, icones de souvenir, bouton start.

## Risques

- Trop de scenes: reduire avant d'ajouter.
- Style visuel incoherent: generer les assets par lots avec une charte commune.
- Photos privees melangees au build web: garder les sources dans `data/photos`, publier seulement les assets transformes dans `public/assets`.
