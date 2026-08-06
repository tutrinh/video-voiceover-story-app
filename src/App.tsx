import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScriptGenerator } from './components/ScriptGenerator';
import { TeleprompterStudio } from './components/TeleprompterStudio';
import { OnTheSpotPractice } from './components/OnTheSpotPractice';
import { SavedStoriesLibrary } from './components/SavedStoriesLibrary';
import { ScriptData, AIEngineType, ModelOption } from './types/script';
import { getAllSavedStories } from './utils/idbStorage';
import { seedRandomTopicsToIndexedDB } from './utils/topicSeeder';
import { getDatabaseScripts } from './utils/dbScripts';

export function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [activeScript, setActiveScript] = useState<ScriptData | null>(null);
  const databaseScriptCount = getDatabaseScripts().length;
  const [savedStoriesCount, setSavedStoriesCount] = useState(databaseScriptCount);

  // CLI Engine & Models state
  const [claudeAvailable, setClaudeAvailable] = useState(false);
  const [codexAvailable, setCodexAvailable] = useState(false);
  const [modelsConfig, setModelsConfig] = useState<{
    claude: ModelOption[];
    codex: ModelOption[];
  }>({
    claude: [
      { id: 'claude-opus-5', name: 'Claude Opus 5 (Most Capable)', default: true },
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5 (Balanced)' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5 (Fast)' },
      { id: 'opus', name: 'Claude Opus (CLI alias)' },
      { id: 'sonnet', name: 'Claude Sonnet (CLI alias)' },
    ],
    codex: [
      { id: '', name: 'Codex configured default', default: true },
    ],
  });

  const [activeEngine, setActiveEngine] = useState<AIEngineType>('claude');
  const [activeModel, setActiveModel] = useState<string>('claude-opus-5');

  // Check Backend CLI Health & Seed Initial Topics to IndexedDB
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setClaudeAvailable(data.claudeAvailable);
          setCodexAvailable(data.codexAvailable);
          if (data.models) {
            setModelsConfig(data.models);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend server check note: using local browser fallback mode.', err);
      });

    // Auto-seed initial random topics into IndexedDB if library is empty
    getAllSavedStories().then(async (stories) => {
      if (stories.length === 0) {
        await seedRandomTopicsToIndexedDB();
        const updated = await getAllSavedStories();
        setSavedStoriesCount(databaseScriptCount + updated.length);
      } else {
        setSavedStoriesCount(databaseScriptCount + stories.length);
      }
    });
  }, []);

  const handleScriptGenerated = (script: ScriptData) => {
    setActiveScript(script);
    setActiveEngine((script.engineUsed.toLowerCase().includes('codex') ? 'codex' : 'claude') as AIEngineType);
    setActiveModel(script.modelUsed);
    setActiveTab('studio');
  };

  const handleLoadPracticeScript = (script: ScriptData) => {
    setActiveScript(script);
    setActiveTab('studio');
  };

  const handleLoadStoryIntoStudio = (script: ScriptData) => {
    setActiveScript(script);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#E1E3EA] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Header */}
      <Header
        activeTab={activeTab}
        activeEngine={activeEngine}
        activeModel={activeModel}
        claudeAvailable={claudeAvailable}
        codexAvailable={codexAvailable}
      />

      {/* Main Layout Shell */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedStoriesCount={savedStoriesCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'generator' && (
            <ScriptGenerator
              onScriptGenerated={handleScriptGenerated}
              claudeAvailable={claudeAvailable}
              codexAvailable={codexAvailable}
              modelsConfig={modelsConfig}
            />
          )}

          {activeTab === 'studio' && activeScript && (
            <TeleprompterStudio
              script={activeScript}
            />
          )}

          {activeTab === 'studio' && !activeScript && (
            <div className="max-w-2xl mx-auto metronic-card p-10 text-center">
              <h2 className="text-2xl font-bold text-white">Choose a script first</h2>
              <p className="text-sm text-[#9a9cae] mt-2">
                Open a saved database script or generate a new one before starting the teleprompter.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button onClick={() => setActiveTab('library')} className="metronic-btn-primary text-sm">
                  Browse saved scripts
                </button>
                <button onClick={() => setActiveTab('generator')} className="metronic-btn-secondary text-sm">
                  Generate a script
                </button>
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <OnTheSpotPractice onLoadPracticeScript={handleLoadPracticeScript} />
          )}

          {activeTab === 'library' && (
            <SavedStoriesLibrary
              onLoadStoryIntoStudio={handleLoadStoryIntoStudio}
              onRefreshCount={(count) => setSavedStoriesCount(count)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
