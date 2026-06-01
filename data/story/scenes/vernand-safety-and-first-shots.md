# Scene: Les premières consignes

## Intention

Cette scène montre le premier vrai moment où Anna observe Alex autrement que comme simple moniteur. Elle découvre qu'il est jeune, bien habillé, intelligent, passionné et très clair dans ses explications. Côté gameplay, cette scène installe aussi le stand de tir, les règles de sécurité et les premières interactions directes entre Alex et les élèves.

## Personnages

- Alex: environ 30 ans, moniteur de tir, contrôlé par le joueur après la séquence de briefing.
- Anna: environ 25 ans, élève du cours, dans le premier groupe de tireurs.
- Six autres élèves: quatre au tir avec Anna, et deux en attente derrière.

## Lieu 1: salle de briefing intérieure

Le groupe arrive à l'intérieur du stand de tir.

La pièce contient une longue table placée vers le nord. Sur cette table, il y a trois pistolets différents, posés de manière claire et sécurisée.

Placement:

- Alex est à côté de la table.
- Les sept élèves sont en demi-cercle autour de lui, devant la table.
- Tous les personnages portent des pamirs sur la tête.

## Briefing sécurité

Alex s'adresse au groupe.

> Alex: Tout d'abord, avant de faire du tir, il faut que vous appreniez les quatre règles fondamentales de sécurité. Sans ça, je ne peux pas vous autoriser à tirer.

> Alex: Première règle: toujours considérer une arme comme chargée.

> Alex: Deuxième règle: toujours pointer l'arme dans une direction sûre.

> Alex: Troisième règle: garder le doigt hors de la détente tant que vous n'êtes pas prêt à tirer.

> Alex: Quatrième règle: être sûr de sa cible et de ce qu'il y a derrière.

Pendant qu'Alex continue à expliquer, l'animation le montre en train de parler et de désigner les pistolets sur la table. Le son ou le texte peut devenir plus léger, comme si Anna écoutait encore, mais que ses pensées prenaient le dessus.

La caméra se déplace doucement vers Anna.

## Pensées d'Anna

Une bulle de pensée apparaît au-dessus d'Anna.

> Anna: Wow... Je pensais que notre prof serait une personne âgée, mais il est super jeune. C'est trop cool.

Nouvelle bulle de pensée quelques secondes plus tard.

> Anna: En plus, il est super joliment habillé. J'aime bien son style.

Nouvelle bulle de pensée.

> Anna: Il est aussi super intelligent et il adore ce qu'il fait. Il connaît vraiment bien les armes, et il explique tout de façon claire et intéressante. Je suis très impressionnée.

La caméra revient sur Alex.

> Alex: Maintenant que vous connaissez les règles, on peut aller tirer.

Transition vers le pas de tir.

## Lieu 2: pas de tir 25 m

Référence visuelle temporaire:

- L'utilisateur ajoutera des photos plus tard.
- L'idée générale ressemble à un stand 25 m couvert, avec une longue table et des séparations entre les tireurs.
- La référence fournie doit être interprétée en miroir si nécessaire pour correspondre à la scène.

Le pas de tir est dans une petite structure couverte. Devant la longue table de tir, l'extérieur est visible: nature, verdure et cibles au loin.

Éléments de décor:

- longue table avec cinq postes de tir;
- séparations entre les tireurs;
- cinq cibles à 25 m;
- environnement extérieur vert derrière les cibles;
- impression de stand calme et concentré.

## Placement au pas de tir

Il y a cinq places pour cinq tireurs.

Au premier tour:

- Anna est à un poste de tir;
- quatre autres élèves sont chacun à leur poste;
- Alex est derrière les tireurs;
- deux élèves attendent leur tour derrière Alex.

Tous les personnages portent des pamirs.

## Posture des tireurs

Les tireurs utilisent des pistolets Hammerli 215 .22 LR.

Posture visuelle:

- tir au pistolet en style olympique;
- pistolet tenu avec une seule main, la main droite;
- corps légèrement de côté;
- côté droit tourné vers les cibles;
- bras droit tendu vers la cible.

L'animation doit rester stylisée et lisible en top-down/chibi.

## Début de la série

Alex annonce les commandes.

> Alex: Tireurs, chargez 5 coups.

Petite pause.

> Alex: Êtes-vous prêts ?

Petite pause.

> Alex: Feu libre.

Animation:

1. Les tireurs lèvent ou stabilisent leur pistolet.
2. De petits flashs apparaissent au niveau des pistolets, un tireur après l'autre.
3. Les tirs ne doivent pas être trop agressifs visuellement: petits flashs, léger recul, bruit court.
4. Après quelques coups, tout le monde s'arrête.

## Retour des cibles

Après les tirs, les cibles reviennent automatiquement vers les tireurs.

Animation:

- chaque cible glisse sur son rail vers son tireur;
- les impacts deviennent visibles quand la cible arrive;
- chaque tireur peut regarder sa cible.

## Phase de discussion

Alex devient contrôlable. Le joueur peut s'approcher des élèves et cliquer sur eux pour discuter.

### Élèves qui attendent leur tour

Si Alex clique sur un élève qui ne tire pas:

> Élève: Est-ce que je peux tirer par la suite ?

> Alex: Oui, bien sûr. Tu peux échanger ta place avec quelqu'un après.

### Tireurs sauf Anna

Si Alex clique sur un tireur autre qu'Anna, choisir une phrase d'Alex parmi ces variantes:

> Alex: Tu as bien tiré ! C'est bien ça, bravo.

> Alex: C'est bien. Tu peux essayer de tirer un peu plus à droite.

> Alex: Pas mal du tout. Tu peux viser un peu plus haut sur la prochaine série.

> Alex: Très bien, continue comme ça.

## Interaction spéciale avec Anna

Si Alex s'approche d'Anna et clique sur elle:

> Alex: Tu as très bien tiré. Trop bien !

> Alex: Il y a quelques coups arrachés, mais il faut surtout éviter de forcer le départ du coup.

> Alex: Ce n'est pas toi qui décides exactement quand le coup part. Ça doit presque te surprendre.

Anna répond avec un sourire.

> Anna: Merci beaucoup ! J'ai tout compris.

Une bulle de pensée apparaît au-dessus d'Alex.

> Alex: Elle est très chou ^^

## Fin de scène

Après la pensée d'Alex, lancer une cutscene courte.

Effet proposé:

- léger zoom ou pause sur Anna et Alex;
- fondu doux;
- transition vers la suite de l'histoire.

## Notes d'implémentation

- La scène de briefing peut être quasi cinématique, avec quelques animations simples.
- Les pensées d'Anna doivent apparaître comme des bulles distinctes, pas comme des dialogues parlés.
- Les pistolets sur la table du briefing sont des objets visuels, pas interactifs pour l'instant.
- La phase au pas de tir doit être interactive uniquement après le retour des cibles.
- Les armes doivent rester représentées dans un contexte sportif, calme et encadré.
- Les retours d'Alex doivent renforcer son côté pédagogue et passionné.
- Le moment important de la scène est le double déclic discret: Anna est impressionnée par Alex, puis Alex trouve Anna très chou.
