# Scene: Première Rencontre

## Intention

Cette scène marque la vraie première rencontre entre Anna et Alex. Elle doit être simple à jouer, lumineuse et vivante: Alex arrive comme moniteur, se présente au groupe, puis guide les élèves jusqu'au bus qui les emmènera au stand de tir.

Le joueur contrôle Alex pour la première fois dans une vraie zone explorable.

## Références de lieux

- Petit parc près d'Unil Sport: https://maps.app.goo.gl/SFftX6PuRgsG9zi97
- Parking: https://maps.app.goo.gl/8piS4n4nQ24MTBCz6
- Terrain de foot: https://maps.app.goo.gl/4VAKNsT7GMDN86YJ9
- Bord du lac Léman et plage: https://maps.app.goo.gl/koFcimZ6bPH7HHE19

## Ambiance

- Journée ensoleillée du mois de mai.
- Arbres verts et fleurs un peu partout.
- Lac Léman visible sur la droite de la map, avec de petites vagues animées.
- Montagnes visibles au loin.
- Ambiance campus vivant: élèves du cours, joueurs de foot, voitures sur le parking.

## Layout de la map

Point de départ: petit parc avec des bancs à côté d'Unil Sport.

Au centre du parc, il y a sept élèves en cercle:

- trois filles, dont Anna;
- quatre garçons.

Alex est placé près du cercle, comme moniteur du cours.

Depuis le parc, le joueur peut aller vers le nord-ouest pour rejoindre le parking. Le parking est en épi, avec plusieurs voitures et un petit bus blanc VW pour huit passagers.

À droite du parking, il y a un terrain de foot ouvert avec quelques personnages random qui jouent. Encore plus à droite, il y a la plage et le bord du lac Léman.

## Début de scène

Les sept élèves sont déjà placés en cercle. Alex s'adresse au groupe.

> Alex: Salut ! Enchanté tout le monde, je suis votre moniteur de tir et je suis content de vous voir pour ce module de tir au pistolet.

> Alex: Maintenant, on va aller au parking, où le bus nous attend pour aller au stand de tir.

Après ce dialogue, le joueur peut contrôler Alex.

## Exploration

Le joueur peut explorer un peu la map avant de rejoindre le bus.

### Suivi du groupe

Les sept élèves suivent Alex pendant le trajet jusqu'au parking.

Notes de mise en scène:

- Les élèves doivent suivre avec un léger délai pour créer un effet de petit groupe.
- Anna fait partie du groupe, mais elle ne doit pas encore être mise trop fortement en avant.
- Les élèves peuvent garder une formation souple derrière Alex.

### Terrain de foot

À droite du parking, des personnages random jouent au foot.

Idées d'animation:

- un ballon qui circule entre deux ou trois personnages;
- un personnage qui court doucement;
- aucun dialogue obligatoire, seulement de la vie dans le décor.

### Bord du lac

Plus à droite, le lac Léman et la plage sont visibles.

Idées visuelles:

- petites vagues animées;
- montagnes en arrière-plan;
- palette claire et ensoleillée;
- fleurs et arbres verts autour de la zone.

## Interactions sur le parking

Le parking contient plusieurs voitures interactives.

Si le joueur clique sur une mauvaise voiture:

> Alex: Hmm... je ne pense pas que ce soit notre bus.

Cette interaction peut se répéter sur toutes les voitures qui ne sont pas le bus.

## Bon véhicule: petit bus blanc VW

Le bon véhicule est un petit bus blanc VW pour huit passagers.

Quand le joueur clique sur le bus:

1. Alex s'approche automatiquement du bus.
2. Alex sort ou utilise les clés.
3. Les phares du bus clignotent pour montrer qu'il est déverrouillé.
4. La grande porte coulissante arrière s'ouvre.
5. Alex se retourne vers les élèves.

> Alex: Vous pouvez vous installer. On y va !

## Montée dans le bus

Après la phrase d'Alex:

1. Les élèves entrent dans le bus un par un.
2. Chaque élève disparaît quand il entre dans le véhicule.
3. Anna entre avec les autres, sans animation séparée à ce moment.
4. Alex entre en dernier.

## Départ du bus

Quand tout le monde est à l'intérieur:

1. Le bus vibre légèrement pour montrer que le moteur démarre.
2. Les phares s'allument.
3. Le bus sort de sa place de parking.
4. Il tourne à gauche.
5. Il continue vers le nord, en direction de la sortie du parking.

## Transition vers la suite

Au moment où le bus quitte le parking, lancer une cutscene de trajet/loading.

Format proposé:

- bus vu de côté ou de trois-quarts, qui avance;
- décor simplifié qui défile;
- indication visuelle que le groupe est en route vers le stand de tir;
- pas encore besoin de dialogue si la scène suivante commence à l'arrivée.

## Notes d'implémentation

- Les liens Google Maps servent de références pour créer la map, mais la version finale doit être une interprétation stylisée, pas une copie satellite brute.
- Le parking, le terrain de foot, le lac et les montagnes peuvent être visibles dans une même grande map scrollable.
- Il faut prévoir des collisions simples autour des voitures, bancs, arbres et bordures.
- Les voitures doivent partager la même interaction d'erreur, sauf le bus.
- Le bus est l'objectif principal de la scène.
- La scène suivante commence à l'arrivée au stand de tir.
