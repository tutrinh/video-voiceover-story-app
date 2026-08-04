import React from 'react';
import { Wand2, Mic, Flame, FolderHeart, Sparkles, BookOpen, Layers } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedStoriesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  savedStoriesCount,
}) => {
  const navItems = [
    {
      id: 'generator',
      label: 'Script Generator',
      description: 'AI Instagram Reel Hook & Script Creator',
      icon: Wand2,
      badge: 'AI Powered',
      badgeColor: 'metronic-badge-primary',
    },
    {
      id: 'studio',
      label: 'Teleprompter Studio',
      description: 'Auto-scroll prompter & voice recorder',
      icon: Mic,
      badge: 'Live Mic',
      badgeColor: 'metronic-badge-purple',
    },
    {
      id: 'practice',
      label: 'On-the-Spot Practice',
      description: 'Camera spontaneity & speed challenge',
      icon: Flame,
      badge: 'Trainer',
      badgeColor: 'metronic-badge-success',
    },
    {
      id: 'library',
      label: 'Saved Stories',
      description: 'Re-read scripts & audio playback',
      icon: FolderHeart,
      count: savedStoriesCount,
    },
  ];

  return (
    <aside className="w-72 bg-[#181924] border-r border-[#2b2d3c] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6c7086]">
          Studio Navigation
        </div>

        <nav className="mt-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-[#1e1f29] text-white border border-[#3e97ff]/40 shadow-lg shadow-[#3e97ff]/10'
                    : 'text-[#9a9cae] hover:bg-[#1e1f29]/50 hover:text-white border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isActive
                      ? 'bg-[#3e97ff] text-white'
                      : 'bg-[#1e1f29] text-[#9a9cae]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`metronic-badge text-[10px] ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className="bg-[#2b2d3c] text-[#3e97ff] text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6c7086] truncate mt-0.5">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Metronic Sidebar Footer Card */}
      <div className="metronic-card p-4 bg-gradient-to-b from-[#1e1f29] to-[#151620] border-[#2b2d3c]">
        <div className="flex items-center space-x-2 text-[#3e97ff] mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-xs">Reel Formula Tip</span>
        </div>
        <p className="text-xs text-[#9a9cae] leading-relaxed">
          The first <span className="text-white font-medium">3 seconds</span> decide 90% of watch time. Make the spoken hook contrast with what's on screen!
        </p>
      </div>
    </aside>
  );
};
