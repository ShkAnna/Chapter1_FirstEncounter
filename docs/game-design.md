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

## Scope implémenté

- écran titre, sauvegarde locale et reprise de progression;
- 10 scènes, du prologue au premier bisou;
- scènes explorables avec caméra, zones accessibles, collisions et interactions;
- companion, PNJ, véhicules et objets narratifs;
- dialogues, pensées, souvenirs et transitions;
- conversation WhatsApp et séquence finale.

Les scripts détaillés restent sous `data/story`. La configuration des scènes jouables partagées se trouve dans `src/content/chapter.ts`.

## Directives de generation d'assets

- Les sprites doivent garder la ressemblance generale et l'ambiance des photos, sans chercher une copie exacte de chaque tenue.
- Les references full body disponibles sont suffisantes pour lancer les personnages; les poses manquantes peuvent etre completees par interpolation et inspiration des photos.
- Premiere rencontre: Alex peut porter t-shirt, pantalon et veste ou manteau leger si besoin; Anna peut porter t-shirt, jeans et pull zippe ou hoodie si besoin.
- Polylan: Anna porte un t-shirt blanc et une jupe orange jusqu'au genou; le design detaille peut etre improvise.
- Les objets secondaires de Polylan, le casque VR et les decorations peuvent etre improvises a partir de l'ambiance generale.
- Les objets techniques peuvent etre derives des photos disponibles ou de references publiques quand il manque un angle; les corrections seront faites apres revue visuelle.
- Place Chauderon de nuit: pas besoin de photo exacte; utiliser les references de jour pour la structure reelle (long abri, route, lignes aeriennes, immeubles) et improviser l'ambiance nocturne avec ciel bleu sombre, lampadaires chauds, arret illumine, reflets sur la route et atmosphere calme de fin de soiree.

## Risques

- Trop de scenes: reduire avant d'ajouter.
- Style visuel incoherent: generer les assets par lots avec une charte commune.
- Photos privees melangees au build web: garder les sources dans `data/photos`, publier seulement les assets transformes dans `public/assets`.
