# Scene: Fin du dernier cours

## Intention

Cette scène transforme un moment très simple en moment décisif. Le cours de tir est terminé, tout le monde commence à partir, et le jeu doit guider Alex vers l'action importante: ne pas quitter le parking sans parler à Anna.

## Transition d'ouverture

Écran noir.

Texte centré à l'écran:

```text
2 semaines plus tard
À la fin du dernier cours de tir
```

Après quelques secondes, fondu vers le parking d'Unil Sport.

## Lieu

Même environnement que la première rencontre à Unil Sport:

- parking;
- terrain de foot à droite;
- bord du lac Léman plus loin;
- plage;
- arbres verts et ambiance extérieure;
- bus blanc garé sur le parking.

La scène commence à côté du bus blanc.

## Placement de départ

- Alex est à côté du bus.
- Cinq élèves sont en demi-cercle autour de lui.
- Anna fait partie des cinq élèves.
- Les autres zones de la map restent visibles, mais l'attention est sur le groupe et le bus.

## Discours de fin d'Alex

Alex s'adresse au groupe.

> Alex: Je vous remercie beaucoup d'être venus aux cours de tir !

> Alex: C'était super cool de vous voir et de passer du temps avec vous.

> Alex: J'espère que ça vous a plu et qu'on se reverra à l'occasion, une prochaine fois.

> Alex: Salut à tous !

## Réaction des élèves

Des bulles de texte apparaissent au-dessus des élèves dans un ordre légèrement aléatoire, comme si tout le monde parlait en même temps.

Exemples de bulles:

> Élève: Merci beaucoup à toi aussi !

> Élève: C'était super, merci !

> Élève: Merci pour les cours !

> Élève: Salut !

> Élève: À bientôt !

Après leurs bulles de texte, tous les élèves sauf Anna commencent à partir dans des directions aléatoires du parking, comme s'ils rentraient chez eux.

## Comportement d'Anna

Anna ne part pas franchement avec les autres.

Animation:

1. Anna commence à marcher très, très doucement vers le nord du parking.
2. Si Alex ne fait rien, elle continue jusqu'à la fin du parking.
3. Arrivée au bout, elle s'arrête.
4. Elle ne bouge plus, comme si elle hésitait ou cherchait quoi faire.

## Gameplay avec Alex

Alex est contrôlable.

Le joueur peut se balader dans la map, mais l'objectif implicite est le bus.

Quand Alex clique sur le bus, deux choix apparaissent:

1. Aller mettre de l'essence dans le bus
2. Rester encore un peu dehors

### Choix: Rester encore un peu dehors

Si le joueur choisit `Rester encore un peu dehors`, la fenêtre se ferme.

Rien d'autre ne se passe. Alex peut continuer à se balader dehors.

### Choix: Aller mettre de l'essence dans le bus

Si le joueur choisit `Aller mettre de l'essence dans le bus`:

1. Alex monte dans le bus.
2. Le bus s'allume.
3. Le moteur vibre légèrement.
4. Le joueur contrôle maintenant le bus.

## Zone de conduite

Quand Alex contrôle le bus:

- le bus peut circuler uniquement sur le parking et vers la sortie du parking;
- le reste de la map devient inaccessible au véhicule;
- les zones piétonnes restent visibles, mais bloquées pour le bus;
- le joueur comprend qu'il doit sortir par la sortie du parking.

## Tentative de départ sans Anna

Si le joueur conduit directement vers la sortie du parking sans avoir parlé à Anna, une fenêtre apparaît.

```text
Est-ce que vous êtes sûr de vouloir quitter le parking ?
Vous n'avez rien oublié ?
```

Deux choix:

1. Oui, je veux partir
2. Non, c'est vrai, j'ai oublié quelque chose

### Si le joueur choisit "Oui, je veux partir"

Le jeu affiche:

```text
Je pense quand même que vous avez oublié de faire quelque chose.
De cette action dépend votre futur.
```

Les deux choix réapparaissent, mais `Oui, je veux partir` est maintenant désactivé et non cliquable. Le joueur doit choisir `Non, c'est vrai, j'ai oublié quelque chose`.

### Si le joueur choisit "Non, c'est vrai, j'ai oublié quelque chose"

La fenêtre se ferme. Alex doit aller vers Anna et déclencher la discussion.

## Discussion avec Anna

Après qu'Alex est monté dans le bus, Anna devient cliquable.

Quand Alex clique sur Anna, une bulle de pensée apparaît d'abord au-dessus d'Anna.

> Anna: Oh... il ne me reste que 1% de batterie sur mon téléphone.

Nouvelle pensée:

> Anna: Je connais plus ou moins cet endroit, donc tôt ou tard je vais rentrer à la maison... mais ce ne sera pas facile.

Anna regarde Alex.

> Alex: Est-ce que je peux te ramener quelque part, par hasard ?

> Alex: Je vais passer à côté du métro EPFL. Je peux te déposer là-bas si ça t'approche de chez toi.

Anna répond, très contente.

> Anna: Oui, ce serait génial ! Merci beaucoup, c'est très gentil !

> Anna: Je n'ai presque plus de batterie sur mon téléphone, du coup ça va énormément m'aider.

## Départ avec Anna

Après la discussion:

1. Anna monte dans le bus avec Alex.
2. Le joueur reprend le contrôle du bus.
3. L'objectif est d'aller vers la sortie du parking.

Quand le bus s'approche de la sortie, lancer une cutscene/loading.

Texte:

```text
Quelques jours plus tard...
```

La scène suivante est la conversation WhatsApp.

## Notes d'implémentation

- Cette scène doit donner au joueur la liberté de tenter de partir, mais empêcher clairement le mauvais choix.
- Le blocage du départ doit être doux et narratif, pas punitif.
- Anna doit être visible pendant toute la phase de conduite, même si elle est au bord du parking.
- Le bus doit avoir un contrôle très simple, limité à la zone parking.
- Le moment important est l'offre d'Alex de déposer Anna vers le métro EPFL.
