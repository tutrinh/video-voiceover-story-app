import rawDatabase from '../db/db.json?raw';
import { Beat, ScriptData } from '../types/script';

type DatabaseScript = Partial<ScriptData> & {
  title?: unknown;
  hookHeadline?: unknown;
  estimatedDurationSeconds?: unknown;
  suggestedVisualTheme?: unknown;
  beats?: unknown;
};

function extractJsonObjects(source: string): unknown[] {
  const objects: unknown[] = [];
  let objectStart = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{') {
      if (depth === 0) objectStart = index;
      depth += 1;
      continue;
    }

    if (character === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        try {
          objects.push(JSON.parse(source.slice(objectStart, index + 1)));
        } catch {
          // db.json may also contain prompt text. Only complete JSON scripts are used.
        }
        objectStart = -1;
      }
    }
  }

  return objects;
}

function isBeat(value: unknown): value is Beat {
  if (!value || typeof value !== 'object') return false;
  const beat = value as Partial<Beat>;
  return (
    typeof beat.beatIndex === 'number' &&
    typeof beat.type === 'string' &&
    typeof beat.header === 'string' &&
    typeof beat.text === 'string' &&
    typeof beat.estimatedSeconds === 'number' &&
    typeof beat.visualCue === 'string' &&
    Array.isArray(beat.highlightKeywords) &&
    typeof beat.deliveryTip === 'string'
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function normalizeScript(value: unknown, index: number): ScriptData | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as DatabaseScript;
  if (
    typeof candidate.title !== 'string' ||
    typeof candidate.hookHeadline !== 'string' ||
    !Array.isArray(candidate.beats) ||
    candidate.beats.length < 2 ||
    !candidate.beats.every(isBeat)
  ) {
    return null;
  }

  const duration =
    typeof candidate.estimatedDurationSeconds === 'number'
      ? candidate.estimatedDurationSeconds
      : candidate.beats.reduce((total, beat) => total + beat.estimatedSeconds, 0);

  return {
    id: `database-${slugify(candidate.title) || index}-${index}`,
    title: candidate.title,
    hookHeadline: candidate.hookHeadline,
    framework: candidate.framework === 'framework_b' ? 'framework_b' : 'framework_a',
    topic:
      typeof candidate.topic === 'string' && candidate.topic.trim()
        ? candidate.topic
        : candidate.hookHeadline,
    audience:
      typeof candidate.audience === 'string' ? candidate.audience : 'Short-form video audience',
    tone: typeof candidate.tone === 'string' ? candidate.tone : 'Motivational & conversational',
    estimatedDurationSeconds: duration,
    suggestedVisualTheme:
      typeof candidate.suggestedVisualTheme === 'string'
        ? candidate.suggestedVisualTheme
        : 'Authentic creator studio',
    beats: candidate.beats,
    engineUsed: 'Saved database',
    modelUsed: 'db.json',
    createdAt: index,
  };
}

const databaseScripts = extractJsonObjects(rawDatabase)
  .map(normalizeScript)
  .filter((script): script is ScriptData => script !== null);

export function getDatabaseScripts(): ScriptData[] {
  return databaseScripts;
}
