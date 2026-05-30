export type DialogueLine = {
  speaker: 'hero' | 'companion';
  text: string;
};

export const firstMeetingDialogue: DialogueLine[] = [
  {
    speaker: 'companion',
    text: 'Tu te souviens de ce moment ?',
  },
  {
    speaker: 'hero',
    text: "J'ai l'impression que le lieu me dit quelque chose.",
  },
  {
    speaker: 'companion',
    text: "Alors cherche le petit detail. C'est souvent lui qui raconte tout.",
  },
];
