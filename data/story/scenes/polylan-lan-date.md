# Scene: Lendemain à PolyLAN

## Intention

Cette scène est la première vraie sortie longue entre Anna et Alex. Elle doit donner une impression de LAN party vivante, chaleureuse et un peu chaotique, avec beaucoup de bots, d'ordinateurs allumés, de petites activités et des moments simples à deux.

Le joueur contrôle Alex. Anna suit automatiquement Alex pendant toute la scène.

## Références

- PolyLAN est une LAN party à Beaulieu Lausanne.
- Ilmac Lausanne / Beaulieu sert de référence de lieu intérieur.
- L'utilisateur ajoutera des photos de référence plus tard.

## Layout général

L'espace est un long rectangle, orienté de gauche à droite.

### Entrée

L'entrée se trouve sur le mur du bas, environ au quart de la longueur en partant de la droite.

La scène commence ici, avec Anna et Alex déjà à l'intérieur, près de la porte.

> Alex: Bienvenue à PolyLAN. Vas-y, on va se balader et regarder ce qu'il y a.

### Zone scène à droite

Le quart droit de l'espace est réservé à la scène.

Placement:

- la scène est en bas à droite;
- plus haut, il y a plusieurs rangées de chaises pour les spectateurs;
- pendant les finales, trois ordinateurs sont placés d'un côté de la scène et trois ordinateurs de l'autre, pour un match 3v3;
- quelques spectateurs peuvent venir s'asseoir quand une finale commence.

Il faut toujours garder deux sièges côte à côte libres pour Anna et Alex dans cette zone.

Premier message de découverte:

> C'est ici que les finales sont jouées. Les équipes s'installent sur scène, et les autres peuvent regarder depuis les chaises.

### Bar à gauche

Le bar occupe un petit carré en bas à gauche de l'espace.

Éléments:

- tableau indicatif `Bar`;
- barman derrière le comptoir;
- file d'attente de bots;
- quelques tables rondes avec chaises en face du bar, plus haut;
- bots assis qui mangent, boivent ou discutent.

Il faut toujours garder deux places côte à côte libres pour Anna et Alex à une table du bar.

Premier message de découverte:

> C'est le bar de la LAN. On peut prendre à boire, manger un truc, et faire une pause entre deux jeux.

### PC VR

Dans le coin supérieur gauche, il y a un PC avec un casque VR et un petit espace autour.

Les bots peuvent venir tester la VR, puis repartir vers leurs places.

Premier message de découverte:

> Ici, on peut tester la VR. Parfait pour jouer quelques minutes et avoir l'air beaucoup trop concentré.

### Zone LAN centrale

Entre le bar et la scène, il y a quatre longues rangées de tables.

Chaque rangée est divisée en trois blocs par deux passages, pour éviter aux personnages de devoir faire un grand détour.

Chaque table a:

- des chaises du côté bas de la table;
- un ordinateur en face de chaque chaise;
- des écrans avec de petites animations de jeux ou des couleurs mouvantes;
- des bots assis en train de jouer.

Les bots peuvent:

- jouer à leur ordinateur;
- se lever et partir ailleurs;
- éteindre leur ordinateur en partant;
- marcher dans l'espace;
- entrer et sortir par la porte;
- aller au bar;
- rejoindre les chaises de la scène pendant une finale;
- tester la VR.

## Places d'Anna et Alex

Les places d'Anna et Alex sont dans la zone LAN:

- deuxième rangée depuis le haut;
- premier bloc de la rangée, donc le bloc tout à gauche;
- deux dernières places à droite de ce bloc;
- deux ordinateurs côte à côte;
- ces places sont toujours libres pour eux.

Décoration:

- touches roses;
- petits néons;
- ambiance cozy;
- références LoL;
- décoration inspirée d'Ahri.

Premier message de découverte:

> Ça, ce sont nos places avec mes amis. On a ramené nos ordinateurs et quelques décorations de la maison pour profiter de ces jours de LAN dans une ambiance très amicale et cozy.

## Simulation des bots

La scène doit sembler vivante même quand le joueur ne fait rien.

Comportements possibles:

- bots qui se baladent;
- bots qui entrent et sortent;
- bots qui font la queue au bar;
- bots qui s'assoient aux tables rondes;
- bots qui jouent aux ordinateurs;
- bots qui arrêtent de jouer, se lèvent, et leur écran s'éteint;
- bots qui testent la VR;
- bots qui rejoignent les chaises de la scène pendant les finales;
- bots qui reviennent à leur ordinateur après la finale.

## Schedule des finales

À certains moments, une finale 3v3 commence sur scène.

Animation:

1. Six joueurs bots vont vers la scène.
2. Trois s'installent sur les ordinateurs de gauche.
3. Trois s'installent sur les ordinateurs de droite.
4. Quelques spectateurs rejoignent les chaises.
5. Les écrans de la scène s'allument.
6. Après un moment, les spectateurs et joueurs se dispersent.

## Interactions

### Bar

Si Alex clique sur le bar, un menu apparaît.

Boissons:

- Eau;
- Café;
- Coca;
- Washing Machine;
- Bière.

Nourriture:

- Nuggets;
- Hot-dog.

Quand le joueur achète quelque chose:

1. Alex prend la commande au bar.
2. Anna suit Alex.
3. Ils vont automatiquement s'asseoir à une table en face du bar.
4. L'objet acheté apparaît sur la table.
5. Pendant 3 à 5 secondes, les personnages font une animation de manger ou boire.
6. Ils se lèvent.
7. La nourriture ou boisson disparaît.
8. Alex redevient contrôlable.

### Chaises libres

Si Alex clique sur une chaise vide, un bouton `S'asseoir` apparaît.

Condition:

- il faut deux places libres côte à côte, une pour Alex et une pour Anna.

Si deux places sont libres:

1. Alex et Anna s'assoient.
2. Ils discutent pendant 3 à 5 secondes.
3. Ils se relèvent.
4. Alex redevient contrôlable.

Si une ou deux places sont occupées:

> Il n'y a pas assez de place pour s'asseoir ici. On va regarder ailleurs.

### PC VR

Si Alex clique sur le PC VR:

1. Alex et Anna se placent côte à côte devant l'espace VR.
2. Un casque VR apparaît sur leur tête ou devant leurs yeux.
3. Ils font une animation de jeu rythmée, comme Beat Saber, pendant environ 5 secondes.
4. Les casques disparaissent.
5. Alex redevient contrôlable.

### Ordinateurs des bots

Si Alex clique sur l'ordinateur d'un bot:

> Ce n'est pas mon ordinateur, je n'ai pas le mot de passe pour y accéder.

Rien d'autre ne se passe.

### Ordinateurs d'Anna et Alex

Si Alex clique sur un des deux ordinateurs qui leur appartiennent, un menu apparaît.

Choix:

1. Pico Park
2. Unrailed

Quand le joueur choisit un jeu:

1. Anna et Alex s'installent aux deux ordinateurs côte à côte.
2. Les ordinateurs s'allument.
3. Ils jouent pendant 3 à 5 secondes.
4. Des bulles d'émotion joyeuse apparaissent pour montrer qu'ils ont gagné ou réussi quelque chose.
5. Les personnages se lèvent.
6. Alex dit:

> Alex: Est-ce que tu veux tester encore un jeu ?

Le jeu déjà joué devient désactivé dans le menu.

Quand les deux jeux ont été joués:

1. Alex devient automatique.
2. Il regarde l'heure.

> Alex: Oh, le temps est passé trop vite. Il est déjà 2 heures du matin.

> Alex: Je pense que tu veux sûrement rentrer à la maison.

> Alex: Je vais t'accompagner jusqu'à l'arrêt de bus.

Anna et Alex se dirigent automatiquement vers la sortie du bâtiment.

Quand ils arrivent à la sortie, lancer une cutscene.

## Transition

La scène suivante se passe la nuit à l'arrêt de bus de la Place de Chauderon.

## Notes d'implémentation

- Cette scène peut être très riche, mais la V1 doit garder un scope raisonnable: bar, VR, deux jeux, et ambiance bots.
- Les bots peuvent avoir des comportements simples et bouclés.
- Les deux places d'Anna et Alex doivent toujours être réservées.
- Les jeux Pico Park et Unrailed sont représentés par des mini-animations, pas par les vrais jeux.
- Les références visuelles précises viendront avec les photos ajoutées plus tard.
