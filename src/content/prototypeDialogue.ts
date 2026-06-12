export type DialogueLine = {
  speaker: 'hero' | 'companion';
  text: string;
};

export const firstMeetingDialogue: DialogueLine[] = [
  {
    speaker: 'hero',
    text: 'Salut ! Enchanté tout le monde, je suis votre moniteur de tir.',
  },
  {
    speaker: 'hero',
    text: "Je suis content de vous voir pour ce module de tir au pistolet.",
  },
  {
    speaker: 'hero',
    text: "Maintenant, on va aller au parking, où le bus nous attend.",
  },
];
