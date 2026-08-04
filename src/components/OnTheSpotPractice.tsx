import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Eye,
  Video,
  Award,
  ArrowRight
} from 'lucide-react';
import { ScriptData } from '../types/script';

interface OnTheSpotPracticeProps {
  onLoadPracticeScript: (script: ScriptData) => void;
}

const PRACTICE_CHALLENGES = [
  {
    id: 'c1',
    title: '🔥 The 3-Second Hook Challenge',
    targetSeconds: 15,
    description: 'Hook the audience in under 3 seconds with intense eye contact and bold statement.',
    prompt: 'Stop wasting time on useless apps—do this 1 habit instead!',
    difficulty: 'Beginner',
  },
  {
    id: 'c2',
    title: '⚡ Spontaneous Problem-Solution Pitch',
    targetSeconds: 30,
    description: 'State a frustrating creator problem, share your struggle, and deliver a 1-step solution.',
    prompt: 'Why 90% of videos get stuck at 200 views (And the 1 setting to change).',
    difficulty: 'Intermediate',
  },
  {
    id: 'c3',
    title: '🏆 The 60-Second Storytelling Sprint',
    targetSeconds: 60,
    description: 'Tell a compelling transformation story with a strong Call-To-Action ending.',
    prompt: 'How I built my morning routine to record 5 voiceover reels before 9 AM.',
    difficulty: 'Advanced',
  },
];

export const OnTheSpotPractice: React.FC<OnTheSpotPracticeProps> = ({
  onLoadPracticeScript,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState(PRACTICE_CHALLENGES[0]);
  const [prepTimer, setPrepTimer] = useState<number | null>(null);
  const [isPrepping, setIsPrepping] = useState(false);

  // Self Evaluation State
  const [energyRating, setEnergyRating] = useState(4);
  const [eyeContactRating, setEyeContactRating] = useState(4);
  const [pacingRating, setPacingRating] = useState(3);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const startPrepTimer = () => {
    setIsPrepping(true);
    setPrepTimer(5);
  };

  useEffect(() => {
    let timer: any = null;
    if (isPrepping && prepTimer !== null && prepTimer > 0) {
      timer = setInterval(() => {
        setPrepTimer((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (isPrepping && prepTimer === 0) {
      setIsPrepping(false);
      setPrepTimer(null);

      // Launch teleprompter script for practice
      const practiceScript: ScriptData = {
        id: `practice_${Date.now()}`,
        title: selectedChallenge.title,
        hookHeadline: selectedChallenge.prompt,
        framework: 'framework_b',
        topic: selectedChallenge.prompt,
        audience: 'Reel Audience',
        tone: 'High Energy On-the-Spot',
        estimatedDurationSeconds: selectedChallenge.targetSeconds,
        suggestedVisualTheme: 'Metronic Practice Mode',
        engineUsed: 'Camera Practice Trainer',
        modelUsed: 'On-The-Spot Practice Mode',
        createdAt: Date.now(),
        beats: [
          {
            beatIndex: 0,
            type: 'HOOK',
            header: '01. Rapid Hook (0-3s)',
            text: selectedChallenge.prompt,
            estimatedSeconds: 4,
            visualCue: 'Stare directly into lens, hold hands up',
            highlightKeywords: ['Stop wasting', 'do this instead'],
            deliveryTip: 'Zero hesitation, punchy delivery',
          },
          {
            beatIndex: 1,
            type: 'STATE PROBLEM',
            header: '02. State Problem (4-10s)',
            text: 'You sit down to record, mind goes blank, and you end up deleting 20 takes.',
            estimatedSeconds: 6,
            visualCue: 'Relatable head shake',
            highlightKeywords: ['mind goes blank', 'deleting 20 takes'],
            deliveryTip: 'Empathetic & relatable tone',
          },
          {
            beatIndex: 2,
            type: 'SOLUTION',
            header: '03. Delivery Solution (11-20s)',
            text: 'Instead of memorizing a script, read 1 bullet beat at a time on camera with total confidence.',
            estimatedSeconds: 10,
            visualCue: 'Point to screen checklist',
            highlightKeywords: ['1 bullet beat', 'total confidence'],
            deliveryTip: 'Authoritative solution delivery',
          },
          {
            beatIndex: 3,
            type: 'CTA',
            header: '04. Instant CTA (21-30s)',
            text: 'Hit save on this reel and practice your next take right now!',
            estimatedSeconds: 5,
            visualCue: 'Point to save button below',
            highlightKeywords: ['Hit save', 'right now'],
            deliveryTip: 'High energy call to action',
          },
        ],
      };

      onLoadPracticeScript(practiceScript);
    }
    return () => clearInterval(timer);
  }, [isPrepping, prepTimer]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="metronic-card p-6 bg-gradient-to-r from-[#181924] via-[#1e1f29] to-[#151620] border-[#2b2d3c] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="metronic-badge metronic-badge-success">Camera Trainer</span>
              <span className="text-xs text-[#9a9cae]">Spontaneity & Thinking On The Spot</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Camera Spontaneity & On-The-Spot Practice Room
            </h2>
            <p className="text-sm text-[#9a9cae] mt-1 max-w-2xl">
              Train your camera presence, deliver hooks with zero overthinking, and build instant spontaneity for viral Instagram Reels.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#00d27a]/10 border border-[#00d27a]/30 text-[#00d27a] flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Countdown Modal Overlay */}
      {isPrepping && prepTimer !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="metronic-card p-10 max-w-md w-full text-center space-y-6 animate-in zoom-in-95">
            <span className="metronic-badge metronic-badge-primary">On-The-Spot Countdown</span>
            <h3 className="text-3xl font-extrabold text-white">Get Ready to Speak!</h3>

            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#3e97ff] to-[#7239ea] text-white font-mono text-6xl font-black flex items-center justify-center mx-auto shadow-2xl shadow-[#3e97ff]/40 animate-pulse">
              {prepTimer}
            </div>

            <p className="text-sm text-[#9a9cae]">
              Look directly into the camera lens, take a deep breath, and hit your hook!
            </p>
          </div>
        </div>
      )}

      {/* Practice Challenge Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#9a9cae] uppercase tracking-wider flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-[#00d27a]" />
          <span>Pick a Camera Practice Challenge</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRACTICE_CHALLENGES.map((ch) => {
            const isSelected = selectedChallenge.id === ch.id;
            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChallenge(ch)}
                className={`metronic-card p-5 cursor-pointer transition-all space-y-3 relative ${
                  isSelected
                    ? 'border-[#00d27a] bg-[#1e1f29] shadow-lg shadow-[#00d27a]/15'
                    : 'hover:border-[#3b3d52]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="metronic-badge metronic-badge-success">{ch.difficulty}</span>
                  <span className="text-xs font-mono text-[#3e97ff]">{ch.targetSeconds}s Reel</span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{ch.title}</h3>
                <p className="text-xs text-[#9a9cae] leading-relaxed">{ch.description}</p>

                <div className="p-2.5 rounded-lg bg-[#0f1015] border border-[#2b2d3c] text-xs text-[#3e97ff] font-medium">
                  "{ch.prompt}"
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Practice Session Button */}
      <div className="metronic-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-base">Ready for On-the-Spot Practice?</h4>
          <p className="text-xs text-[#9a9cae] mt-0.5">
            5-second countdown will start, then automatically loads into the teleprompter recorder.
          </p>
        </div>

        <button
          onClick={startPrepTimer}
          className="metronic-btn-primary py-3.5 px-6 text-sm flex items-center space-x-2 shrink-0"
        >
          <Video className="w-5 h-5" />
          <span>Launch 5-Second Prep & Teleprompter</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Self-Evaluation Scorecard */}
      <div className="metronic-card p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#2b2d3c] pb-3">
          <Award className="w-5 h-5 text-[#3e97ff]" />
          <h3 className="font-bold text-base text-white">Post-Take Self Evaluation Scorecard</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Energy & Enthusiasm */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9a9cae] flex items-center justify-between">
              <span>Energy & Enthusiasm:</span>
              <span className="text-white font-bold">{energyRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyRating}
              onChange={(e) => setEnergyRating(Number(e.target.value))}
              className="w-full accent-[#3e97ff]"
            />
          </div>

          {/* Eye Contact */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9a9cae] flex items-center justify-between">
              <span>Eye Contact & Camera Focus:</span>
              <span className="text-white font-bold">{eyeContactRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={eyeContactRating}
              onChange={(e) => setEyeContactRating(Number(e.target.value))}
              className="w-full accent-[#7239ea]"
            />
          </div>

          {/* Pacing */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9a9cae] flex items-center justify-between">
              <span>Pacing & Pause Control:</span>
              <span className="text-white font-bold">{pacingRating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={pacingRating}
              onChange={(e) => setPacingRating(Number(e.target.value))}
              className="w-full accent-[#00d27a]"
            />
          </div>
        </div>

        <button
          onClick={() => setHasEvaluated(true)}
          className="metronic-btn-secondary text-xs py-2 px-4"
        >
          {hasEvaluated ? 'Scorecard Saved!' : 'Log Practice Scorecard'}
        </button>
      </div>
    </div>
  );
};
