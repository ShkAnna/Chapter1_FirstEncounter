# Scene: Arrivée au stand de Vernand

## Intention

Cette scène fait la transition entre le trajet en bus et l'entrée dans le stand de tir. Elle doit montrer que le groupe arrive dans un vrai lieu de tir: parking, restaurant, autres tireurs, fusils, puis Alex qui prend son matériel et guide les élèves vers l'intérieur.

## Références de lieux

- Parking du stand de tir de Vernand: https://maps.app.goo.gl/18k1FG8NMRQYVGAY6
- Restaurant près du stand: https://maps.app.goo.gl/6WAFVfFTYubtey15A
- Stand de tir de Vernand: https://maps.app.goo.gl/QaBxTJkFMd3xDH3u5
- Entrée du stand: https://maps.app.goo.gl/g62YkKgFouG2ZmSc9

## Ambiance

- Arrivée calme après le trajet.
- Lieu vivant mais plus sérieux que le campus.
- Quelques tireurs déjà présents autour des voitures.
- Restaurant visible avec des tables dehors.
- Atmosphère réaliste de stand de tir suisse, mais gardée en style top-down chibi / semi-pixel art.

## Layout de la map

Point de départ: le petit bus blanc VW arrive et se gare sur le parking du stand de tir de Vernand.

Autour du parking:

- plusieurs voitures déjà garées;
- quelques personnages près des voitures;
- à côté de certains personnages, un fusil posé ou tenu de manière non menaçante, par exemple un FAS 90 ou un mousqueton;
- le restaurant avec quelques tables dehors;
- des personnages assis qui boivent, mangent quelque chose ou discutent;
- le bâtiment du stand de tir;
- la porte d'entrée du stand, qui sert de point de transition vers la scène intérieure.

## Début de scène

La cutscene/loading du bus se termine.

Le bus arrive dans la map depuis le bord de l'écran, ralentit, puis se gare sur une place du parking.

Animation:

1. Le bus s'arrête.
2. Le moteur vibre encore légèrement.
3. Les phares s'éteignent ou diminuent.
4. La porte coulissante s'ouvre.

## Descente du groupe

Les sept élèves sortent du bus un par un.

Ordre suggéré:

1. un élève garçon;
2. une élève fille;
3. Anna;
4. deux autres élèves;
5. les deux derniers élèves;
6. Alex sort en dernier.

Tous se placent à côté du bus en petit groupe.

## Caisse à outils noire

Alex ouvre ou accède à l'arrière du bus et sort une caisse à outils noire sur roulettes. Elle ressemble à une valise rigide.

Animation:

1. Alex se tourne vers l'arrière ou le côté du bus.
2. La caisse apparaît près de lui.
3. Alex la prend par la poignée.
4. La caisse suit Alex avec un léger délai, comme une valise sur roulettes.

## Dialogue d'Alex

Alex se tourne vers le groupe.

> Alex: Maintenant, on va rentrer au stand, mettez vos pamirs et on peut y aller.

Note: `pamirs` désigne les casques antibruit pour le tir. On peut éventuellement afficher une petite icône de casque antibruit au-dessus des élèves pour rendre l'action claire.

## Déplacement vers l'entrée

Après le dialogue:

1. Alex marche vers la porte du stand avec la caisse noire.
2. Les sept élèves suivent Alex.
3. La caisse roule derrière ou à côté d'Alex.
4. Le groupe traverse le parking.
5. Les tireurs et les clients du restaurant restent en animation d'ambiance.

## Ambiance autour du parking

### Restaurant

Le restaurant doit être visible près du stand.

Animations possibles:

- personnages assis à des tables;
- une personne qui boit;
- une personne qui mange;
- deux personnages qui discutent face à face.

### Autres tireurs

Sur le parking, quelques personnages sont près d'autres voitures.

Détails visuels:

- un fusil par personnage concerné;
- fusils représentés de manière claire mais stylisée;
- exemples: FAS 90, mousquetons;
- les fusils restent posés ou tenus calmement, sans action agressive.

## Transition vers l'intérieur

Quand Alex et le groupe atteignent la porte du stand:

1. Alex entre avec la caisse.
2. Les élèves entrent après lui.
3. L'écran lance une cutscene courte de passage à l'intérieur.

Effet proposé:

- fondu noir rapide;
- son ou animation de porte;
- transition vers la scène intérieure du stand.

## Notes d'implémentation

- Cette scène peut être courte et semi-automatique: le joueur peut contrôler Alex après la descente du bus, mais l'objectif doit rester clair.
- Les fusils dans le décor sont des objets d'ambiance liés au stand, pas des objets interactifs pour cette scène.
- Les pamirs peuvent devenir un petit objet visuel ajouté aux personnages avant l'entrée.
- La caisse noire sur roulettes est importante: elle doit être visible et reconnaissable.
- La scène suivante commence à l'intérieur du stand de tir.
