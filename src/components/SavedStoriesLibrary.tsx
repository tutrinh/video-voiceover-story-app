import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Clock3,
  Database,
  FileAudio,
  Mic,
  Search,
  Subtitles,
  Trash2,
} from 'lucide-react';
import { SavedStory, ScriptData } from '../types/script';
import { getDatabaseScripts } from '../utils/dbScripts';
import { deleteStoryFromStorage, getAllSavedStories } from '../utils/idbStorage';
import { downloadSrtFile } from '../utils/srtExporter';

interface SavedStoriesLibraryProps {
  onLoadStoryIntoStudio: (script: ScriptData) => void;
  onRefreshCount: (count: number) => void;
}

type LibraryItem = {
  id: string;
  script: ScriptData;
  source: 'database' | 'recording';
  takeCount: number;
  updatedAt?: number;
};

export const SavedStoriesLibrary: React.FC<SavedStoriesLibraryProps> = ({
  onLoadStoryIntoStudio,
  onRefreshCount,
}) => {
  const databaseScripts = useMemo(() => getDatabaseScripts(), []);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<'all' | 'database' | 'recording'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refreshSavedStories = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const stories = await getAllSavedStories();
      setSavedStories(stories);
      onRefreshCount(databaseScripts.length + stories.length);
    } catch (error) {
      console.error('Unable to load browser-saved stories:', error);
      setLoadError('Browser recordings could not be loaded. Database scripts are still available.');
      onRefreshCount(databaseScripts.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshSavedStories();
  }, []);

  const items = useMemo<LibraryItem[]>(
    () => [
      ...databaseScripts.map((script) => ({
        id: script.id,
        script,
        source: 'database' as const,
        takeCount: 0,
      })),
      ...savedStories.map((story) => ({
        id: story.id,
        script: story.script,
        source: 'recording' as const,
        takeCount: story.takes?.length ?? 0,
        updatedAt: story.updatedAt,
      })),
    ],
    [databaseScripts, savedStories],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeSource !== 'all' && item.source !== activeSource) return false;
      if (!query) return true;
      const searchableText = [
        item.script.title,
        item.script.hookHeadline,
        item.script.topic,
        ...item.script.beats.map((beat) => beat.text),
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [activeSource, items, searchQuery]);

  const handleDelete = async (item: LibraryItem) => {
    if (item.source !== 'recording') return;
    if (!window.confirm(`Delete “${item.script.title}” and its saved takes?`)) return;
    await deleteStoryFromStorage(item.id);
    await refreshSavedStories();
  };

  const sourceCounts = {
    all: items.length,
    database: databaseScripts.length,
    recording: savedStories.length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <section className="metronic-card p-6 bg-[#181924]">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[#3e97ff] text-xs font-semibold">
              <Database className="w-4 h-4" />
              <span>{databaseScripts.length} scripts loaded from db/db.json</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">Choose a script to record</h2>
            <p className="text-sm text-[#9a9cae] mt-1 leading-relaxed">
              Select any saved script to open it in the teleprompter and start a new voiceover take.
            </p>
          </div>

          <div className="relative w-full xl:w-80">
            <label htmlFor="library-search" className="block text-xs font-semibold text-[#c7c9d3] mb-2">
              Search saved scripts
            </label>
            <Search className="w-4 h-4 text-[#9a9cae] absolute left-3 bottom-3" />
            <input
              id="library-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Title, hook, or script text"
              className="metronic-input w-full text-sm pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#2b2d3c]" aria-label="Filter scripts by source">
          {(['all', 'database', 'recording'] as const).map((source) => {
            const labels = { all: 'All scripts', database: 'Database', recording: 'My recordings' };
            const isActive = activeSource === source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => setActiveSource(source)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#3e97ff] border-[#3e97ff] text-white'
                    : 'bg-[#1e1f29] border-[#2b2d3c] text-[#9a9cae] hover:text-white hover:border-[#3e97ff]/60'
                }`}
              >
                {labels[source]} <span className="ml-1 opacity-75">{sourceCounts[source]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {loadError && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Loading saved scripts">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="metronic-card p-5 animate-pulse">
              <div className="h-3 w-24 rounded bg-[#2b2d3c]" />
              <div className="h-5 w-2/3 rounded bg-[#2b2d3c] mt-4" />
              <div className="h-14 rounded bg-[#1e1f29] mt-4" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="metronic-card p-12 text-center">
          <BookOpen className="w-10 h-10 text-[#6c7086] mx-auto" />
          <h3 className="text-lg font-bold text-white mt-4">No matching scripts</h3>
          <p className="text-sm text-[#9a9cae] mt-1">Try a different search or source filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSource('all');
            }}
            className="metronic-btn-secondary mt-5 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const firstBeat = item.script.beats[0];
            const isDatabase = item.source === 'database';
            return (
              <article
                key={`${item.source}-${item.id}`}
                className="metronic-card p-5 flex flex-col group hover:border-[#3e97ff]/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#9a9cae]">
                      {isDatabase ? <Database className="w-3.5 h-3.5" /> : <FileAudio className="w-3.5 h-3.5" />}
                      <span>{isDatabase ? 'DATABASE SCRIPT' : `${item.takeCount} SAVED TAKE${item.takeCount === 1 ? '' : 'S'}`}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg tracking-tight mt-2">{item.script.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#9a9cae] shrink-0">
                    <Clock3 className="w-3.5 h-3.5" />
                    <span>{item.script.estimatedDurationSeconds}s</span>
                  </div>
                </div>

                <p className="text-sm text-[#3e97ff] font-medium mt-3 line-clamp-2">
                  {item.script.hookHeadline}
                </p>
                <p className="text-sm text-[#9a9cae] leading-relaxed mt-3 line-clamp-3 flex-1">
                  {firstBeat?.text}
                </p>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#2b2d3c]">
                  <button
                    type="button"
                    onClick={() => onLoadStoryIntoStudio(item.script)}
                    className="metronic-btn-primary py-2.5 px-4 text-sm flex-1 flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Use script & record</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSrtFile(item.script)}
                    className="metronic-btn-secondary p-2.5"
                    title="Download SRT captions"
                    aria-label={`Download captions for ${item.script.title}`}
                  >
                    <Subtitles className="w-4 h-4 text-[#3e97ff]" />
                  </button>
                  {!isDatabase && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      className="p-2.5 rounded-lg border border-red-400/20 bg-red-400/10 text-red-400 hover:bg-red-400/20 active:scale-[0.98]"
                      title="Delete saved recording"
                      aria-label={`Delete ${item.script.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
