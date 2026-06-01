# Scene: Quelques jours plus tard

## Intention

Cette scène remplace l'exploration par une interface de conversation WhatsApp. Elle montre que le lien continue après les cours de tir: Anna envoie des photos de pistolets, Alex propose le Miam Festival, puis il invite Anna à passer le voir à PolyLAN.

## Transition d'ouverture

La scène précédente se termine sur:

```text
Quelques jours plus tard...
```

Puis l'écran affiche une conversation WhatsApp.

## Interface

La conversation doit ressembler à un écran de téléphone.

Disposition:

- messages d'Alex à droite, en bulles vertes;
- avatar d'Alex à droite;
- messages d'Anna à gauche, en bulles blanches;
- avatar d'Anna à gauche;
- les messages apparaissent un par un, avec une petite pause entre chaque message;
- certains messages peuvent contenir une image ou un placeholder d'image.

## Avatars

État par défaut:

- les deux avatars sont contents.

Quand un personnage reçoit un message:

- son avatar devient blush, comme une réaction 😊.

Réactions spéciales:

- sur certains messages, l'avatar d'Anna explose de joie;
- à la fin, l'avatar d'Anna explose de joie avec une réaction shy/blushed.

## Conversation

Les messages et réactions détaillés sont dans:

`data/story/chats/whatsapp-miam-invitation.yaml`

## Déroulé principal

Anna envoie un message à Alex avec des photos de pistolets.

> Anna: Bon bah maintenant mes discussions avec les amis ressemblent à ça 🤣

Action:

> Anna envoie des photos des pistolets.

Alex répond.

> Alex: ahahah excellent 😂

Alex propose le Miam Festival.

> Alex: en parlant d'event, le weekend du 7 juin il y a le Miam Festival. C'est de la street food de Lausanne et autour, ça t'intéresserait ?

Réaction:

- l'avatar d'Anna explose de joie.

Anna répond avec enthousiasme et propose plusieurs programmes.

> Anna: Ouii, j'ai vu et j'aimerais beaucoup y aller 😃

> Anna: Par contre, j'étais en train d'essayer de planifier la visite de dix mille choses en une journée 😂

> Anna: En gros, le 7 et 8 juin, il y aura Geneva Food Fest + Miam Festival de Lausanne + caves ouvertes du canton de Vaud x)

> Anna: Du coup, j'ai deux programmes à te proposer 😂

Action:

> Anna explique ses idées.

> Anna: Est-ce qu'un des programmes, une partie des programmes, ou tout peut t'intéresser ? 😂

Réaction:

- l'avatar d'Anna explose de joie.

Alex répond.

> Alex: ah oui, c'est la saison 😂 yes ! je suis chaud pour tout en vrai 🤩

> Alex: je viens de check mon agenda et si tu veux compléter le samedi matin, je vais peut-être tirer à 50 m 😂

Anna répond.

> Anna: Ooh oui, ça serait une journée parfaite 😍

> Alex: trop bien 😍 je me réjouis 🥂

## Ellipse

Afficher:

```text
Un jour et quelques discussions plus tard...
```

Puis la conversation continue.

> Alex: je suis à PolyLAN

> Alex: Si tu n'as rien à faire demain, feel free de me rendre visite à Beaulieu si tu veux 😛

Réaction:

- l'avatar d'Anna explose de joie;
- puis devient shy/blushed.

> Anna: Oui avec plaisir 😊

## Transition de fin

Après le dernier message, lancer une cutscene/loading.

Texte:

```text
Lendemain à PolyLAN
31 mai
```

## Notes d'implémentation

- Cette scène peut être rendue avec HTML/CSS au-dessus de Phaser, ou directement dans Phaser avec des bulles et avatars.
- Le fichier YAML de conversation doit servir de source principale pour les messages.
- Prévoir des hooks de réaction d'avatar: `happy`, `blush`, `joy_explosion`, `shy_blush`, `shy_blush_joy`.
- Les photos de pistolets peuvent d'abord être des placeholders, puis remplacées par de vrais assets plus tard.
- Le joueur n'a pas besoin de choisir de réponse ici: la scène est une conversation animée.
