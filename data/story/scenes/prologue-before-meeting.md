# Scene: Avant que tout commence

## Intention

Cette scène raconte l'enchaînement discret qui rend la première rencontre possible: Anna choisit le cours de tir par curiosité, envoie une demande d'autorisation, puis Alex lui répond. Le ton doit être léger, drôle et un peu magique, comme si un détail administratif devenait le début d'une grande histoire.

## Lieu 1: Chambre d'Anna

Anna est assise dans sa chambre, devant son ordinateur. Elle fait défiler le site d'Unil Sport et cherche une nouvelle activité à tester.

### Dialogue et actions

Anna regarde l'écran.

> Anna: Hmm... Je veux tester un nouveau sport. Qu'est-ce que je pourrais choisir ?

Elle continue à faire défiler la liste.

> Anna: Équitation... Trop loin, pas pratique.

Elle continue.

> Anna: Parachutisme... Peut-être une autre fois.

Elle continue.

> Anna: Pilates... Trop tranquille.

Elle s'arrête.

> Anna: Tir...

Animation: les yeux d'Anna deviennent très grands, comme si elle venait de voir quelque chose d'inattendu.

> Anna: Tir ? Sérieusement ? Avec de vraies armes ?

Animation: les yeux d'Anna deviennent brillants, avec des étoiles.

> Anna: Wow, ça a l'air trop cool ! Let's go, on fait ça.

Texte d'action à l'écran:

> Remplissage des informations...

Le texte change:

> Envoi du mail à Alexandre C., moniteur de tir, pour demander l'autorisation de participer au cours en tant qu'étrangère.

Anna termine son mail.

> Anna: C'est tout bon. J'espère que je serai autorisée à faire du tir. J'ai trop hâte de tester !

Transition vers la chambre d'Alex.

## Lieu 2: Chambre d'Alex

Alex est devant son ordinateur. Il consulte les mails liés au nouveau semestre du cours de tir.

> Alex: Il y a beaucoup de mails pour le nouveau semestre de tir. Vas-y, je vais y répondre.

Une fenêtre de boîte mail apparaît au centre de l'écran. Le mail d'Anna est ouvert.

### Mail reçu

Ce texte reste exact dans le jeu.

```text
Bonjour M. C.,

Je suis Anna S., assistant scientifique des laboratoires L. et C. à EPFL.
Suite à ma nationalité étrangère (ukrainienne), j'aimerais demander une autorisation officielle de tir nécessaire pour la 2ème module de 4 semaines de tir au pistolet.

Je vous remercie d'avance pour votre réponse.

Cordialement,
Anna S.
```

Bouton affiché: `Répondre`

Quand le joueur clique sur `Répondre`, la fenêtre de lecture est remplacée par une fenêtre de rédaction.

## Choix du joueur

Deux choix apparaissent en bas de l'écran:

1. Accepter la participation
2. Refuser la participation

### Si le joueur choisit "Refuser la participation"

Une bulle de dialogue apparaît au-dessus d'Alex.

> Alex: Les Ukrainiens n'ont aucune restriction de participation, donc je n'ai aucune raison de refuser.

Les deux choix réapparaissent. Le choix `Refuser la participation` est maintenant désactivé et non cliquable. Le joueur peut uniquement choisir `Accepter la participation`.

### Si le joueur choisit "Accepter la participation"

Le texte de réponse apparaît automatiquement avec un effet de frappe au clavier.

```text
Bonjour Anna,

Je peux vous confirmer qu'il n'y a pas de restrictions particulières pour les ressortissants ukrainiens dans la législation suisse sur les armes. Vous pouvez donc venir au cours sans procédure additionnelle.

Avec mes meilleures salutations,

Alexandre C.
```

Bouton affiché: `Envoyer`

Quand le joueur clique sur `Envoyer`, la fenêtre de mail se ferme.

> Alex: Trop bien, c'est fait !

> Alex: Maintenant, je peux me reposer et jouer un peu à LoL.

## Fin de scène

Alex clique sur son ordinateur. Le jeu apparaît sur son écran, et on voit qu'il commence à jouer.

Effet de transition: un cercle noir part des bords de l'écran et se referme vers le centre jusqu'à rendre l'écran complètement noir.

La scène suivante peut commencer après ce fondu noir.

## Notes d'implémentation

- Le site Unil Sport peut être représenté par une interface simplifiée, pas par une vraie page web.
- Le bouton `Refuser la participation` doit être cliquable la première fois, puis désactivé après la réponse d'Alex.
- L'email reçu et l'email envoyé doivent être affichés comme des popups au centre de l'écran.
- Le texte de réponse d'Alex doit utiliser un effet de typing machine.
- La scène peut être jouée comme une intro interactive avant que le joueur contrôle vraiment Alex dans les scènes suivantes.
