import type Phaser from 'phaser';

export const STORY_SCENES = [
  'prologue',
  'first_meeting',
  'arrival_vernand',
  'vernand_safety_and_first_shots',
  'second_shooting_lesson',
  'final_course_farewell',
  'whatsapp_miam_invitation',
  'polylan_lan_date',
  'chaudron_missed_bus',
  'lausanne_station_first_kiss',
] as const;

export type StorySceneId = (typeof STORY_SCENES)[number];

type SaveData = {
  currentScene: StorySceneId;
  completedScenes: StorySceneId[];
  unlockedMemories: string[];
};

const STORAGE_KEY = 'chapter1-first-encounter-save-v1';

const defaultSave = (): SaveData => ({
  currentScene: 'prologue',
  completedScenes: [],
  unlockedMemories: [],
});

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const currentScene = STORY_SCENES.includes(parsed.currentScene as StorySceneId)
      ? (parsed.currentScene as StorySceneId)
      : 'prologue';
    return {
      currentScene,
      completedScenes: (parsed.completedScenes ?? []).filter((scene) =>
        STORY_SCENES.includes(scene),
      ),
      unlockedMemories: parsed.unlockedMemories ?? [],
    };
  } catch {
    return defaultSave();
  }
}

export function resetSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Local storage may be disabled; the game remains playable for this session.
  }
}

export function completeScene(sceneId: StorySceneId, memories: string[]): StorySceneId | null {
  const save = loadSave();
  const completedScenes = Array.from(new Set([...save.completedScenes, sceneId]));
  const unlockedMemories = Array.from(new Set([...save.unlockedMemories, ...memories]));
  const currentIndex = STORY_SCENES.indexOf(sceneId);
  const nextScene = STORY_SCENES[currentIndex + 1] ?? null;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentScene: nextScene ?? sceneId,
        completedScenes,
        unlockedMemories,
      } satisfies SaveData),
    );
  } catch {
    // Saving is best-effort so private browsing does not block progression.
  }

  return nextScene;
}

export function startStoryScene(scene: Phaser.Scene, sceneId: StorySceneId): void {
  switch (sceneId) {
    case 'prologue':
      scene.scene.start('PrologueScene');
      break;
    case 'first_meeting':
      scene.scene.start('FirstMeetingScene');
      break;
    case 'arrival_vernand':
      scene.scene.start('VernandArrivalScene');
      break;
    case 'whatsapp_miam_invitation':
      scene.scene.start('WhatsAppScene');
      break;
    case 'lausanne_station_first_kiss':
      scene.scene.start('FinaleScene');
      break;
    default:
      scene.scene.start('ChapterScene', { sceneId });
  }
}

export function finishWithTransition(
  scene: Phaser.Scene,
  sceneId: StorySceneId,
  memories: string[],
  transitionText: string,
): void {
  const nextScene = completeScene(sceneId, memories);
  scene.scene.start('TransitionScene', {
    completedScene: sceneId,
    nextScene,
    memories,
    transitionText,
  });
}
