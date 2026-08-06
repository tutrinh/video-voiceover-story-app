import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Clock,
  Target,
  MessageSquare,
  Flame,
  ArrowRight,
  Dice5,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Star,
  FileCode2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { FrameworkType, AIEngineType, ScriptData, ModelOption } from '../types/script';

interface ScriptGeneratorProps {
  onScriptGenerated: (script: ScriptData) => void;
  claudeAvailable: boolean;
  codexAvailable: boolean;
  modelsConfig: {
    claude: ModelOption[];
    codex: ModelOption[];
  };
}

const CATEGORIZED_TOPICS: Record<string, string[]> = {
  'Motivational Stories': [
    'When you feel like giving up, remember why you started in the first place',
    'How 1 small win today creates unstoppable momentum for your entire week',
    'The story of turning rock bottom into the solid foundation for a new life',
    'Why your current struggle is building the exact strength you need for tomorrow',
    'How 1 random act of kindness from a stranger restored my faith in humanity',
    'The 100-day discipline challenge that proved you are capable of anything',
    'Why it is never too late to reinvent yourself and rewrite your story',
    'How shifting from "I have to" to "I get to" changes your entire day',
    'The inspirational story of someone who started with zero and built an empire',
    'Why the darkest hour comes right before the most beautiful sunrise',
    'How 5 minutes of daily courage can unlock opportunities you never imagined',
    'The uplifting truth about how far you have come despite all the odds',
    'Why your unique voice and story matters to someone who is hurting right now',
    'How forgiving your past self opens the door to your brightest future',
    'The quiet power of showing up every day even when nobody is clapping yet'
  ],
  'Everyday Lessons': [
    'What 5 years of overthinking taught me about making real decisions',
    'The awkward conversation I avoided for 3 months (and what happened when I had it)',
    'Why I stopped saying "I am busy" to the people I love',
    'The 10-minute evening walk habit that completely resets my mental health',
    'What losing my keys 3 times in a week taught me about daily mindfulness',
    'Why saying NO to good opportunities is the only way to say YES to great ones',
    'The smallest habit change that cured my 3 PM afternoon energy crash',
    'What I learned after turning off phone notifications for 30 full days',
    'The 1 rule I use to stop letting minor inconveniences ruin my entire day',
    'Why keeping a simple daily gratitude list felt cheesy until it saved my focus',
    'The lesson I learned from a random conversation with a stranger at a coffee shop',
    'What spending 1 hour in total silence every morning taught me about anxiety',
    'Why forgiving yourself for yesterday’s mistake is your greatest productivity secret'
  ],
  'Creator Tips': [
    '3 brutal mistakes every beginner creator makes in their first 30 days',
    'The 3-step formula for recording 10 viral reels in under 1 hour',
    'Why nobody is watching your videos (and how to fix your hook in 5 seconds)',
    'Stop editing your reels manually! Use this 3-minute voiceover trick',
    'The secret to talking on camera with 100% confidence with zero script memorization'
  ],
  'Business & Sales': [
    'How to build a $100k solo business using just voiceover reels',
    'Why traditional sales pitches fail on Instagram (And the 15-second fix)',
    '3 psychological triggers that make followers click your link in bio',
    'How I turned 1,000 views into 10 high-paying clients without paid ads',
    'The exact offer breakdown that generated 50 sales in 24 hours'
  ],
  'Productivity & Tech': [
    'How I cut my screen time in half using 1 simple iPhone setting',
    'Stop trying to be consistent until you fix this 1 morning habit',
    'Why most online courses fail (And the 5-minute daily replacement)',
    '3 hidden AI tools that will save you 20 hours every single week',
    'The 2-minute rule to beat procrastination before it ruins your day'
  ]
};

const ALL_TOPICS = Object.values(CATEGORIZED_TOPICS).flat();

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  onScriptGenerated,
  claudeAvailable,
  codexAvailable,
  modelsConfig,
}) => {
  const [framework, setFramework] = useState<FrameworkType>('framework_a');
  const [engine, setEngine] = useState<AIEngineType>('claude');
  const [selectedModel, setSelectedModel] = useState<string>('claude-opus-5');

  const [topic, setTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Motivational Stories');
  const [audience, setAudience] = useState('Uplifting Story & Motivational Audience');
  const [tone, setTone] = useState('Motivational & Uplifting');
  const [duration, setDuration] = useState<number>(30);
  const [fullPromptText, setFullPromptText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fallbackWarning, setFallbackWarning] = useState('');

  // Build full system prompt sent to AI engine
  const buildPromptText = (
    curTopic: string,
    curFramework: FrameworkType,
    curAudience: string,
    curTone: string,
    curDuration: number
  ) => {
    const isA = curFramework === 'framework_a';
    const frameworkName = isA
      ? 'Hook, Beginning, Middle, Resolution & Outcome, CTA'
      : 'Hook, State Problem, Journey to Resolve, Resolution & Solution, CTA';

    return `You are a master storyteller and voiceover director writing scripts for Instagram Reels.

MANDATORY TOPIC RELEVANCE & RESOLUTION DIRECTIVES:
1. 100% TOPIC ALIGNMENT: Every single beat (Hook, Beginning/Context, Middle/Journey, Resolution, CTA) MUST be 100% directly focused on the specific topic provided: "${curTopic}". Do not drift into generic advice. Use the exact subject matter, specific scenarios, and real details of "${curTopic}" throughout the entire script.
2. PROVIDE CLEAR RESOLUTION TO THE PROBLEM: When a problem or obstacle is presented in "${curTopic}", YOU MUST PROVIDE A CONCRETE, CLEAR RESOLUTION.
3. STATE HOW IT WAS RESOLVED: Beat 4 MUST explicitly state the exact action, mindset shift, or practical solution that resolved the issue in "${curTopic}" and what positive outcome resulted. Under no circumstances leave the problem unresolved.
4. MEANINGFUL & LOGICAL NARRATIVE FLOW: The script must make complete sense when read out loud. Every beat must transition smoothly with complete, articulate sentences.

SPECIFICATIONS:
TOPIC/PRODUCT: ${curTopic}
TARGET AUDIENCE: ${curAudience}
TONE OF VOICE: ${curTone}
TARGET DURATION: ${curDuration} seconds total
FRAMEWORK: ${frameworkName}

FRAMEWORK STRUCTURE & TIMINGS:
${isA ? `1. HOOK (0-${Math.round(curDuration * 0.15)}s): Spoken hook directly about "${curTopic}".
2. BEGINNING (${Math.round(curDuration * 0.15)}-${Math.round(curDuration * 0.35)}s): Context and background directly related to "${curDuration}".
3. MIDDLE (${Math.round(curDuration * 0.35)}-${Math.round(curDuration * 0.70)}s): Core story journey, specific actions, or insights specifically regarding "${curTopic}".
4. RESOLUTION & OUTCOME (${Math.round(curDuration * 0.70)}-${Math.round(curDuration * 0.85)}s): State EXACTLY how the issue in "${curTopic}" was resolved and the positive outcome achieved.
5. CTA (${Math.round(curDuration * 0.85)}-${curDuration}s): Respectful community call to action.` : `1. HOOK (0-${Math.round(curDuration * 0.15)}s): Relatable spoken hook line introducing "${curTopic}".
2. STATE PROBLEM (${Math.round(curDuration * 0.15)}-${Math.round(curDuration * 0.35)}s): Describes the specific obstacle or struggle regarding "${curTopic}".
3. JOURNEY TO RESOLVE (${Math.round(curDuration * 0.35)}-${Math.round(curDuration * 0.65)}s): Outlines the realistic shift or effort taken to address "${curTopic}".
4. RESOLUTION & SOLUTION (${Math.round(curDuration * 0.65)}-${Math.round(curDuration * 0.85)}s): State EXACTLY how "${curTopic}" was resolved, the concrete step that fixed it, and the final positive outcome.
5. CTA (${Math.round(curDuration * 0.85)}-${curDuration}s): Warm engagement request.`}

INSTRUCTIONS:
Return ONLY valid JSON following this exact schema:
{
  "title": "Short Meaningful Title",
  "hookHeadline": "The main text hook to overlay on video",
  "estimatedDurationSeconds": ${curDuration},
  "suggestedVisualTheme": "Metronic Authentic Warm Aesthetic",
  "beats": [
    {
      "beatIndex": 0,
      "type": "HOOK",
      "header": "01. Spoken Hook",
      "text": "Full, complete, articulate sentence specifically introducing ${curTopic}...",
      "estimatedSeconds": ${Math.round(curDuration * 0.15)},
      "visualCue": "Specific visual cue (e.g. Natural eye contact, warm smile)",
      "highlightKeywords": ["keyword1", "keyword2"],
      "deliveryTip": "Voice tone advice (e.g. Conversational, clear emphasis)"
    }
  ]
}`;
  };

  // Sync prompt text whenever inputs change
  useEffect(() => {
    if (topic) {
      setFullPromptText(buildPromptText(topic, framework, audience, tone, duration));
    }
  }, [topic, framework, audience, tone, duration]);

  // Randomize topic on initial mount
  useEffect(() => {
    getRandomTopic('Motivational Stories');
  }, []);

  const getRandomTopic = (category = selectedCategory) => {
    let pool = ALL_TOPICS;
    if (category !== 'All' && CATEGORIZED_TOPICS[category]) {
      pool = CATEGORIZED_TOPICS[category];
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedTopic = pool[randomIndex];
    setTopic(selectedTopic);
    setFullPromptText(buildPromptText(selectedTopic, framework, audience, tone, duration));
  };

  // Handle engine change and update model default
  const handleEngineChange = (newEngine: AIEngineType) => {
    setEngine(newEngine);
    if (newEngine === 'claude') {
      setSelectedModel(modelsConfig.claude[0]?.id || 'claude-opus-5');
    } else if (newEngine === 'codex') {
      setSelectedModel(modelsConfig.codex[0]?.id || '');
    } else {
      setSelectedModel('Web Intelligent Emulator');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullPromptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetPrompt = () => {
    setFullPromptText(buildPromptText(topic, framework, audience, tone, duration));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');
    setFallbackWarning('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine,
          model: selectedModel,
          framework,
          topic,
          audience,
          tone,
          duration,
          customPrompt: fullPromptText,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (json.isFallback) {
          setFallbackWarning(
            json.fallbackReason || 'The AI engine was unavailable, so a built-in template was used.'
          );
        }

        const generatedScript: ScriptData = {
          ...json.data,
          id: `script_${Date.now()}`,
          framework,
          topic,
          audience,
          tone,
          engineUsed: json.engine || engine,
          modelUsed: json.model || selectedModel || 'Codex configured default',
          createdAt: Date.now(),
        };

        onScriptGenerated(generatedScript);
      } else {
        throw new Error(json.error || 'Failed to generate script payload');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Generation error. Switched to instant fallback.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentModelList =
    engine === 'claude'
      ? modelsConfig.claude
      : engine === 'codex'
      ? modelsConfig.codex
      : [{ id: 'web-engine', name: 'Instant Web Generator' }];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="metronic-card p-6 bg-gradient-to-r from-[#181924] via-[#1e1f29] to-[#151620] border-[#2b2d3c] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00d27a]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="metronic-badge metronic-badge-success">🌟 AI Engine Prompt Studio</span>
              <span className="text-xs text-[#9a9cae]">Instagram Voiceover Reel Studio</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              AI Story Script Generator & Editable System Prompt
            </h2>
            <p className="text-sm text-[#9a9cae] mt-1 max-w-2xl">
              Inspect and customize the exact prompt sent directly to <code className="text-[#3e97ff]">Claude CLI</code> or <code className="text-[#b58dff]">Codex CLI</code> to guarantee 100% topic alignment and clear problem resolutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => getRandomTopic()}
            className="metronic-btn-primary flex items-center space-x-2 text-xs shrink-0 self-start md:self-auto shadow-lg shadow-[#00d27a]/20"
          >
            <Star className="w-4 h-4 text-[#00d27a] animate-bounce" />
            <span>✨ Randomize Topic Prompt</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* 1. Framework Selection Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#9a9cae] uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#3e97ff]" />
            <span>Select Story Framework</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Framework A */}
            <div
              onClick={() => setFramework('framework_a')}
              className={`metronic-card p-5 cursor-pointer relative transition-all ${
                framework === 'framework_a'
                  ? 'border-[#3e97ff] bg-[#1e1f29] shadow-lg shadow-[#3e97ff]/15'
                  : 'hover:border-[#3b3d52]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="metronic-badge metronic-badge-primary mb-2">Framework 1</span>
                  <h3 className="font-bold text-white text-base">
                    Hook → Beginning → Middle → Resolution & Outcome → CTA
                  </h3>
                  <p className="text-xs text-[#9a9cae] mt-1">
                    Classic storytelling structure with explicit resolution beat for rapid value delivery.
                  </p>
                </div>
                {framework === 'framework_a' && (
                  <CheckCircle2 className="w-5 h-5 text-[#3e97ff] shrink-0" />
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">01. Hook</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">02. Context</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">03. Journey</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#00d27a]/20 text-[#00d27a] px-2 py-0.5 rounded font-bold">04. Resolution</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#3e97ff]/20 text-[#3e97ff] px-2 py-0.5 rounded font-bold">05. CTA</span>
              </div>
            </div>

            {/* Framework B */}
            <div
              onClick={() => setFramework('framework_b')}
              className={`metronic-card p-5 cursor-pointer relative transition-all ${
                framework === 'framework_b'
                  ? 'border-[#7239ea] bg-[#1e1f29] shadow-lg shadow-[#7239ea]/15'
                  : 'hover:border-[#3b3d52]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="metronic-badge metronic-badge-purple mb-2">Framework 2</span>
                  <h3 className="font-bold text-white text-base">
                    Hook → State Problem → Journey → Resolution & Solution → CTA
                  </h3>
                  <p className="text-xs text-[#9a9cae] mt-1">
                    Problem-Agitate-Solve framework with guaranteed resolution to the stated problem.
                  </p>
                </div>
                {framework === 'framework_b' && (
                  <CheckCircle2 className="w-5 h-5 text-[#7239ea] shrink-0" />
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">01. Hook</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">02. Problem</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#2b2d3c] text-white px-2 py-0.5 rounded">03. Journey</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#00d27a]/20 text-[#00d27a] px-2 py-0.5 rounded font-bold">04. Resolution</span>
                <span className="text-[#6c7086]">→</span>
                <span className="bg-[#7239ea]/20 text-[#b58dff] px-2 py-0.5 rounded font-bold">05. CTA</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Engine & Model Pickers */}
        <div className="metronic-card p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#2b2d3c] pb-3">
            <Cpu className="w-4 h-4 text-[#3e97ff]" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              AI Engine & Model Selection
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engine Selectors */}
            <div
              onClick={() => handleEngineChange('claude')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                engine === 'claude'
                  ? 'border-[#3e97ff] bg-[#1e1f29]'
                  : 'border-[#2b2d3c] bg-[#151620] hover:border-[#3b3d52]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#3e97ff]" />
                  <span className="font-bold text-sm text-white">Claude CLI</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    claudeAvailable ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#9a9cae] mt-1">
                Executes via <code className="text-[#3e97ff]">claude -p</code> binary on system
              </p>
            </div>

            <div
              onClick={() => handleEngineChange('codex')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                engine === 'codex'
                  ? 'border-[#7239ea] bg-[#1e1f29]'
                  : 'border-[#2b2d3c] bg-[#151620] hover:border-[#3b3d52]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#7239ea]" />
                  <span className="font-bold text-sm text-white">Codex CLI</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    codexAvailable ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#9a9cae] mt-1">
                Uses <code className="text-[#b58dff]">codex exec</code> with your ChatGPT sign-in
              </p>
            </div>

            <div
              onClick={() => handleEngineChange('web')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                engine === 'web'
                  ? 'border-[#00d27a] bg-[#1e1f29]'
                  : 'border-[#2b2d3c] bg-[#151620] hover:border-[#3b3d52]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#00d27a]" />
                  <span className="font-bold text-sm text-white">Browser AI Engine</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-[#9a9cae] mt-1">
                Instant high-converting template engine
              </p>
            </div>
          </div>

          {/* Model Pick Dropdown */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-[#9a9cae]">
              {engine === 'codex'
                ? 'Model selection is managed by Codex CLI:'
                : `Pick Respective Model (${engine.toUpperCase()} Engine):`}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={engine === 'codex'}
              className="metronic-input w-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
            >
              {currentModelList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.default ? '(Recommended Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Topic & Inputs */}
        <div className="metronic-card p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#9a9cae] uppercase tracking-wider flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#3e97ff]" />
                <span>Story Topic Prompt</span>
              </label>

              {/* Niche Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {Object.keys(CATEGORIZED_TOPICS).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      getRandomTopic(cat);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#00d27a] text-white font-bold'
                        : 'bg-[#1e1f29] text-[#9a9cae] border border-[#2b2d3c] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Field + Regenerate Button Group */}
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your reel topic prompt..."
                className="metronic-input flex-1 font-semibold text-base"
                required
              />

              <button
                type="button"
                onClick={() => getRandomTopic()}
                className="metronic-btn-secondary px-4 flex items-center space-x-2 text-xs font-bold shrink-0 hover:border-[#00d27a] hover:text-[#00d27a]"
                title="Generate another random topic"
              >
                <RefreshCw className="w-4 h-4 text-[#00d27a]" />
                <span className="hidden sm:inline">Regenerate Topic</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9a9cae] flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-[#3e97ff]" />
                <span>Target Audience</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="metronic-input w-full text-sm"
              />
            </div>

            {/* Tone of Voice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9a9cae] flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-[#7239ea]" />
                <span>Tone of Voice</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="metronic-input w-full text-sm font-medium"
              >
                <option value="Motivational & Uplifting">🌟 Motivational & Uplifting</option>
                <option value="Storytelling & Vulnerable">📖 Personal Storytelling & Reflection</option>
                <option value="High Energy & Engaging">🔥 High Energy & Scroll-Stopping</option>
                <option value="Educational & Authoritative">🧠 Educational & Authority</option>
                <option value="Relatable & Humorous">😂 Relatable Everyday Humor</option>
              </select>
            </div>

            {/* Reel Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9a9cae] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00d27a]" />
                <span>Target Reel Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      duration === d
                        ? 'bg-[#3e97ff] text-white border-[#3e97ff]'
                        : 'bg-[#1e1f29] text-[#9a9cae] border-[#2b2d3c] hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Full AI Engine System Prompt Textarea */}
        <div className="metronic-card p-5 space-y-3 border-[#3e97ff]/30 bg-[#151620]">
          <div className="flex items-center justify-between border-b border-[#2b2d3c] pb-3">
            <div className="flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-[#3e97ff]" />
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Full AI Engine System Prompt (Sent to {engine.toUpperCase()} / {selectedModel || 'configured default'})
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetPrompt}
                className="metronic-btn-secondary py-1 px-2.5 text-xs flex items-center space-x-1 hover:text-[#3e97ff]"
                title="Reset prompt template to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Prompt</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="metronic-btn-secondary py-1 px-2.5 text-xs flex items-center space-x-1 hover:text-[#00d27a]"
                title="Copy prompt string to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-[#9a9cae]">
            This exact system prompt instructions and constraints are passed directly into the AI CLI process. You can edit this text directly before generating!
          </p>

          <textarea
            value={fullPromptText}
            onChange={(e) => setFullPromptText(e.target.value)}
            rows={12}
            className="metronic-input w-full font-mono text-xs text-[#3e97ff] leading-relaxed bg-[#0f1015] border-[#2b2d3c] p-4 rounded-xl focus:border-[#3e97ff]"
            placeholder="AI engine system prompt..."
          />
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {fallbackWarning && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm space-y-1">
            <p className="font-bold">⚠ Template script — not AI generated</p>
            <p className="text-amber-200/80 text-xs">{fallbackWarning}</p>
            <p className="text-amber-200/60 text-xs">
              Only the hook line uses your topic; the remaining beats are fixed placeholder copy.
              Pick a different model or engine and generate again for a real script.
            </p>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isGenerating}
          className="metronic-btn-primary w-full py-4 text-base flex items-center justify-center space-x-2 shadow-xl shadow-[#3e97ff]/20"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Generating Script via {engine.toUpperCase()} ({selectedModel || 'configured default'})...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Execute AI Prompt & Open Teleprompter</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
