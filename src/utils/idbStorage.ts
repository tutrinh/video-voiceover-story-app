import { get, set, del, keys } from 'idb-keyval';
import { SavedStory, ScriptData, VoiceTake } from '../types/script';

const STORIES_PREFIX = 'story_';

export async function saveStoryToStorage(story: SavedStory): Promise<void> {
  const key = `${STORIES_PREFIX}${story.id}`;
  await set(key, story);
}

export async function getStoryFromStorage(id: string): Promise<SavedStory | undefined> {
  const key = `${STORIES_PREFIX}${id}`;
  return await get<SavedStory>(key);
}

export async function getAllSavedStories(): Promise<SavedStory[]> {
  const allKeys = await keys();
  const storyKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORIES_PREFIX));

  const stories: SavedStory[] = [];
  for (const k of storyKeys) {
    const item = await get<SavedStory>(k);
    if (item) {
      stories.push(item);
    }
  }

  // Sort descending by updatedAt
  return stories.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteStoryFromStorage(id: string): Promise<void> {
  const key = `${STORIES_PREFIX}${id}`;
  await del(key);
}

export function createNewSavedStory(script: ScriptData): SavedStory {
  return {
    id: script.id || `story_${Date.now()}`,
    script,
    takes: [],
    updatedAt: Date.now(),
    tags: [script.framework, script.tone, `${script.estimatedDurationSeconds}s`]
  };
}
