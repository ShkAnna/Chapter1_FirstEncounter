import type { StorySceneId } from '../game/progress';

export type StoryLine = {
  speaker: 'Alex' | 'Anna' | 'Élève' | 'Narration';
  text: string;
  portrait?: 'hero' | 'companion' | 'npc';
  thought?: boolean;
};

export type StageObject = {
  key: string;
  texture: string;
  x: number;
  y: number;
  scale: number;
  depth?: number;
};

export type StageInteraction = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius?: number;
  lines: StoryLine[];
  requires?: string[];
  completes?: boolean;
  stageAdvance?: boolean;
  activateObject?: { key: string; texture: string };
};

export type ChapterStage = {
  background: string;
  location: string;
  objective: string;
  playerStart: { x: number; y: number };
  companionStart?: { x: number; y: number };
  playerTexture?: string;
  companionTexture?: string;
  opening: StoryLine[];
  walkArea: { x: number; y: number; width: number; height: number };
  blockers?: Array<{ x: number; y: number; width: number; height: number }>;
  objects?: StageObject[];
  npcCount?: number;
  interactions: StageInteraction[];
};

export type ChapterSceneConfig = {
  id: StorySceneId;
  title: string;
  transitionText: string;
  memories: string[];
  stages: ChapterStage[];
};

export const CHAPTER_SCENES: Partial<Record<StorySceneId, ChapterSceneConfig>> = {
  arrival_vernand: {
    id: 'arrival_vernand',
    title: 'Arrivée au stand de Vernand',
    transitionText: "À l'intérieur du stand...",
    memories: ['vernand_arrival', 'black_tool_case'],
    stages: [
      {
        background: 'vernand-exterior',
        location: 'Stand de Vernand · Parking',
        objective: "Prendre la caisse noire puis rejoindre l'entrée",
        playerStart: { x: 750, y: 720 },
        companionStart: { x: 690, y: 760 },
        opening: [
          { speaker: 'Narration', text: 'Après le trajet, le groupe arrive au stand de Vernand.' },
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: 'Maintenant, on va rentrer au stand. Mettez vos pamirs et on peut y aller.',
          },
        ],
        walkArea: { x: 120, y: 380, width: 1420, height: 500 },
        blockers: [
          { x: 900, y: 300, width: 620, height: 260 },
          { x: 40, y: 200, width: 450, height: 260 },
        ],
        objects: [
          { key: 'arrival-bus', texture: 'minibus-closed', x: 670, y: 600, scale: 0.2 },
          { key: 'tool-case', texture: 'case-closed', x: 805, y: 665, scale: 0.11 },
        ],
        npcCount: 5,
        interactions: [
          {
            id: 'case',
            label: 'la caisse noire',
            x: 805,
            y: 700,
            lines: [
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "Je prends la caisse avec le matériel avant d'entrer.",
              },
            ],
          },
          {
            id: 'restaurant',
            label: 'le restaurant',
            x: 350,
            y: 485,
            lines: [
              {
                speaker: 'Narration',
                text: 'Quelques visiteurs discutent tranquillement près du restaurant.',
              },
            ],
          },
          {
            id: 'entrance',
            label: "l'entrée du stand",
            x: 1250,
            y: 560,
            requires: ['case'],
            completes: true,
            lines: [
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: 'Tout le monde est prêt ? On passe aux règles de sécurité.',
              },
            ],
          },
        ],
      },
    ],
  },
  vernand_safety_and_first_shots: {
    id: 'vernand_safety_and_first_shots',
    title: 'Les premières consignes',
    transitionText: 'Une semaine plus tard · 2e cours de tir',
    memories: ['safety_briefing', 'anna_first_shots', 'alex_first_thought'],
    stages: [
      {
        background: 'vernand-briefing',
        location: 'Stand de Vernand · Salle de briefing',
        objective: 'Présenter les quatre règles fondamentales',
        playerStart: { x: 780, y: 610 },
        companionStart: { x: 700, y: 720 },
        playerTexture: 'hero-shooting',
        companionTexture: 'companion-shooting-idle',
        opening: [
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: "Avant de faire du tir, il faut apprendre les quatre règles fondamentales de sécurité.",
          },
        ],
        walkArea: { x: 100, y: 360, width: 1470, height: 500 },
        blockers: [{ x: 420, y: 120, width: 850, height: 300 }],
        npcCount: 6,
        interactions: [
          {
            id: 'rules',
            label: 'la table des règles',
            x: 840,
            y: 430,
            stageAdvance: true,
            lines: [
              { speaker: 'Alex', portrait: 'hero', text: 'Toujours considérer une arme comme chargée.' },
              { speaker: 'Alex', portrait: 'hero', text: 'Toujours la pointer dans une direction sûre.' },
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "Garder le doigt hors de la détente tant que l'on n'est pas prêt.",
              },
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "Être sûr de sa cible et de ce qu'il y a derrière.",
              },
              {
                speaker: 'Anna',
                portrait: 'companion',
                thought: true,
                text: "Il est jeune, passionné et il explique tout d'une façon vraiment claire.",
              },
              { speaker: 'Alex', portrait: 'hero', text: 'Maintenant, on peut aller tirer.' },
            ],
          },
        ],
      },
      {
        background: 'vernand-range',
        location: 'Stand de Vernand · Pas de tir 25 m',
        objective: 'Lancer la série puis parler à Anna',
        playerStart: { x: 830, y: 760 },
        companionStart: { x: 1040, y: 600 },
        playerTexture: 'hero-shooting',
        companionTexture: 'companion-shooting-pose',
        opening: [
          { speaker: 'Alex', portrait: 'hero', text: 'Tireurs, chargez 5 coups.' },
          { speaker: 'Alex', portrait: 'hero', text: 'Êtes-vous prêts ? Feu libre.' },
        ],
        walkArea: { x: 80, y: 500, width: 1510, height: 380 },
        blockers: [{ x: 120, y: 400, width: 1430, height: 155 }],
        npcCount: 6,
        interactions: [
          {
            id: 'student',
            label: 'un élève',
            x: 600,
            y: 650,
            lines: [
              { speaker: 'Élève', portrait: 'npc', text: 'Est-ce que je peux tirer au prochain tour ?' },
              { speaker: 'Alex', portrait: 'hero', text: 'Oui, vous échangerez les places après cette série.' },
            ],
          },
          {
            id: 'anna',
            label: 'Anna',
            x: 1040,
            y: 650,
            completes: true,
            lines: [
              { speaker: 'Alex', portrait: 'hero', text: 'Tu as très bien tiré. Trop bien !' },
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "Évite seulement de forcer le départ du coup. Il doit presque te surprendre.",
              },
              { speaker: 'Anna', portrait: 'companion', text: "Merci beaucoup ! J'ai tout compris." },
              { speaker: 'Alex', portrait: 'hero', thought: true, text: 'Elle est très chou ^^' },
            ],
          },
        ],
      },
    ],
  },
  second_shooting_lesson: {
    id: 'second_shooting_lesson',
    title: 'Deuxième cours de tir',
    transitionText: 'Deux semaines plus tard · Fin du dernier cours',
    memories: ['one_week_later', 'anna_posture_advice', 'anna_happy_to_see_alex'],
    stages: [
      {
        background: 'vernand-range',
        location: 'Stand de Vernand · Pas de tir 25 m',
        objective: 'Observer le groupe et conseiller Anna',
        playerStart: { x: 820, y: 760 },
        companionStart: { x: 1040, y: 600 },
        playerTexture: 'hero-shooting',
        companionTexture: 'companion-shooting-pose',
        opening: [{ speaker: 'Narration', text: 'Une semaine plus tard · 2e cours de tir' }],
        walkArea: { x: 80, y: 500, width: 1510, height: 380 },
        blockers: [{ x: 120, y: 400, width: 1430, height: 155 }],
        npcCount: 6,
        interactions: [
          {
            id: 'students',
            label: 'les autres tireurs',
            x: 610,
            y: 650,
            lines: [
              { speaker: 'Alex', portrait: 'hero', text: 'Bon groupement. Gardez la même posture.' },
            ],
          },
          {
            id: 'anna',
            label: 'Anna',
            x: 1040,
            y: 650,
            completes: true,
            lines: [
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: 'Très bons résultats ! Change un peu la position de tes pieds, tes coups partent légèrement à gauche.',
              },
              {
                speaker: 'Anna',
                portrait: 'companion',
                text: 'Merci beaucoup ! Je vais essayer avec la nouvelle posture.',
              },
              {
                speaker: 'Anna',
                portrait: 'companion',
                thought: true,
                text: 'Il est tellement intelligent et attentif. Je suis très contente de le revoir.',
              },
            ],
          },
        ],
      },
    ],
  },
  final_course_farewell: {
    id: 'final_course_farewell',
    title: 'Fin du dernier cours',
    transitionText: 'Quelques jours plus tard...',
    memories: ['final_course_group_goodbye', 'anna_low_battery', 'alex_offers_ride'],
    stages: [
      {
        background: 'unil-sport-background',
        location: 'UNIL Sport · Parking',
        objective: 'Parler à Anna avant de repartir',
        playerStart: { x: 690, y: 430 },
        companionStart: { x: 920, y: 370 },
        opening: [
          { speaker: 'Narration', text: 'Deux semaines plus tard · À la fin du dernier cours de tir' },
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: "Merci beaucoup d'être venus. J'espère que ça vous a plu et qu'on se reverra !",
          },
          { speaker: 'Élève', portrait: 'npc', text: 'Merci pour les cours ! À bientôt !' },
        ],
        walkArea: { x: 320, y: 210, width: 700, height: 560 },
        objects: [
          { key: 'farewell-bus', texture: 'minibus-closed', x: 660, y: 340, scale: 0.2 },
          { key: 'low-battery', texture: 'phone-low-battery', x: 920, y: 325, scale: 0.07 },
        ],
        npcCount: 4,
        interactions: [
          {
            id: 'bus',
            label: 'le bus',
            x: 660,
            y: 430,
            lines: [
              {
                speaker: 'Alex',
                portrait: 'hero',
                thought: true,
                text: "Je pourrais partir mettre de l'essence... mais j'ai peut-être oublié quelque chose.",
              },
            ],
          },
          {
            id: 'anna',
            label: 'Anna',
            x: 920,
            y: 420,
            completes: true,
            lines: [
              { speaker: 'Anna', portrait: 'companion', text: "Il ne me reste que 1% de batterie." },
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: 'Est-ce que je peux te ramener ? Je passe près du métro EPFL.',
              },
              {
                speaker: 'Anna',
                portrait: 'companion',
                text: "Oui, ce serait génial ! Merci beaucoup, ça va énormément m'aider.",
              },
            ],
          },
        ],
      },
    ],
  },
  polylan_lan_date: {
    id: 'polylan_lan_date',
    title: 'Lendemain à PolyLAN',
    transitionText: '2 heures du matin · Place Chauderon',
    memories: ['polylan_discovery', 'cozy_lan_places', 'late_night_walk'],
    stages: [
      {
        background: 'polylan-hall',
        location: 'PolyLAN · Beaulieu Lausanne',
        objective: 'Découvrir le bar, la VR et jouer aux deux jeux',
        playerStart: { x: 1040, y: 820 },
        companionStart: { x: 990, y: 830 },
        playerTexture: 'hero-polylan',
        companionTexture: 'companion-polylan',
        opening: [
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: "Bienvenue à PolyLAN. On va se balader et regarder ce qu'il y a.",
          },
        ],
        walkArea: { x: 70, y: 180, width: 1500, height: 680 },
        blockers: [
          { x: 350, y: 145, width: 890, height: 430 },
          { x: 1290, y: 80, width: 300, height: 620 },
          { x: 20, y: 560, width: 250, height: 230 },
        ],
        npcCount: 8,
        interactions: [
          {
            id: 'bar',
            label: 'le bar',
            x: 260,
            y: 700,
            lines: [
              {
                speaker: 'Narration',
                text: 'Ils prennent des nuggets et une boisson, puis font une petite pause ensemble.',
              },
            ],
          },
          {
            id: 'vr',
            label: 'le poste VR',
            x: 185,
            y: 250,
            lines: [
              {
                speaker: 'Anna',
                portrait: 'companion',
                text: 'On teste ? Je vais essayer de ne pas avoir l’air trop concentrée.',
              },
              { speaker: 'Narration', text: 'Quelques minutes de Beat Saber plus tard...' },
            ],
          },
          {
            id: 'stage',
            label: 'la scène des finales',
            x: 1410,
            y: 420,
            lines: [
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "C'est ici que les finales 3v3 sont jouées.",
              },
            ],
          },
          {
            id: 'pico',
            label: 'les places cozy · Pico Park',
            x: 560,
            y: 390,
            lines: [
              { speaker: 'Alex', portrait: 'hero', text: 'On commence par Pico Park ?' },
              { speaker: 'Anna', portrait: 'companion', text: 'Oui ! Ça va être chaotique 😂' },
            ],
          },
          {
            id: 'unrailed',
            label: 'les places cozy · Unrailed',
            x: 690,
            y: 390,
            requires: ['pico'],
            completes: true,
            lines: [
              { speaker: 'Alex', portrait: 'hero', text: 'Encore un jeu : Unrailed.' },
              { speaker: 'Anna', portrait: 'companion', text: "Le temps est passé beaucoup trop vite." },
              {
                speaker: 'Alex',
                portrait: 'hero',
                text: "Il est déjà 2 heures. Je vais t'accompagner jusqu'à l'arrêt de bus.",
              },
            ],
          },
        ],
      },
    ],
  },
  chaudron_missed_bus: {
    id: 'chaudron_missed_bus',
    title: 'Le bus manqué',
    transitionText: 'Gare de Lausanne · Quelques minutes plus tard',
    memories: ['bus_stop_hug', 'walk_to_station'],
    stages: [
      {
        background: 'chauderon',
        location: 'Place Chauderon · Lausanne',
        objective: 'Attendre le bus avec Anna',
        playerStart: { x: 790, y: 405 },
        companionStart: { x: 850, y: 405 },
        opening: [
          {
            speaker: 'Alex',
            portrait: 'hero',
            text: 'Je suis très content que tu aies pu venir. Merci beaucoup.',
          },
          {
            speaker: 'Anna',
            portrait: 'companion',
            text: "J'étais trop contente de découvrir cet événement de geeks avec toi.",
          },
        ],
        walkArea: { x: 100, y: 300, width: 1470, height: 190 },
        objects: [{ key: 'city-bus', texture: 'city-bus', x: 1120, y: 590, scale: 0.24 }],
        interactions: [
          {
            id: 'hug',
            label: "l'arrêt de bus",
            x: 820,
            y: 420,
            completes: true,
            lines: [
              { speaker: 'Narration', text: 'Ils se rapprochent et se prennent dans les bras.' },
              { speaker: 'Narration', text: "Le bus passe devant eux... sans s'arrêter." },
              { speaker: 'Alex', portrait: 'hero', text: "C'est trop bizarre. Pourquoi il ne s'est pas arrêté ?" },
              { speaker: 'Alex', portrait: 'hero', text: "Dans ce cas, je t'accompagne jusqu'à la gare." },
            ],
          },
        ],
      },
    ],
  },
};
