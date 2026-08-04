import React from 'react';
import { Sparkles, Mic, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { AIEngineType } from '../types/script';

interface HeaderProps {
  activeTab: string;
  activeEngine: AIEngineType;
  activeModel: string;
  claudeAvailable: boolean;
  codexAvailable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeEngine,
  activeModel,
  claudeAvailable,
  codexAvailable,
}) => {
  return (
    <header className="h-16 bg-[#181924] border-b border-[#2b2d3c] px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3e97ff] to-[#7239ea] flex items-center justify-center text-white shadow-lg shadow-[#3e97ff]/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Metronic AI Reel Studio</h1>
              <span className="metronic-badge metronic-badge-primary">v9.5.0</span>
            </div>
            <p className="text-xs text-[#9a9cae]">
              Instagram Voiceover Teleprompter & Story Script Engine
            </p>
          </div>
        </div>
      </div>

      {/* Right Engine Status & Model Badge */}
      <div className="flex items-center space-x-4">
        {/* CLI Status Pills */}
        <div className="hidden md:flex items-center space-x-2 bg-[#1e1f29] px-3 py-1.5 rounded-lg border border-[#2b2d3c] text-xs">
          <Cpu className="w-3.5 h-3.5 text-[#3e97ff]" />
          <span className="text-[#9a9cae]">Active Engine:</span>
          <span className="font-semibold text-white uppercase">{activeEngine}</span>
          <span className="text-[#6c7086]">•</span>
          <span className="text-[#3e97ff] font-medium truncate max-w-[140px]">{activeModel}</span>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center space-x-2 text-xs">
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border ${
              claudeAvailable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={claudeAvailable ? 'Claude CLI binary ready' : 'Claude CLI in Web Mode'}
          >
            <Zap className="w-3 h-3" />
            <span className="font-mono text-[11px]">Claude CLI</span>
          </div>

          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md border ${
              codexAvailable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={codexAvailable ? 'Codex CLI binary ready' : 'Codex CLI in Web Mode'}
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="font-mono text-[11px]">Codex CLI</span>
          </div>
        </div>
      </div>
    </header>
  );
};
