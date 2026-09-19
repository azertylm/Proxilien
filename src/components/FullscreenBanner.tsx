import React from 'react';
import { Minimize, Maximize, X } from 'lucide-react';

interface FullscreenBannerProps {
  isFullscreen: boolean;
  onExit: () => void;
  isGold?: boolean;
  isModalOpen?: boolean;
}

export const FullscreenBanner: React.FC<FullscreenBannerProps> = ({
  isFullscreen,
  onExit,
  isGold,
  isModalOpen = false,
}) => {
  if (!isFullscreen || isModalOpen) return null;

  return (
    <aside
      role="status"
      aria-label="Mode Plein Écran Actif"
      className="fixed bottom-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto"
    >
      <div
        className={`flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-md transition ${
          isGold
            ? 'bg-amber-950/90 border-amber-400 text-amber-100'
            : 'bg-slate-900/90 border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <span className="text-xs sm:text-sm font-black whitespace-nowrap">
            Plein Écran
          </span>
          <span className="hidden md:inline text-[11px] text-slate-400 font-medium">
            (Échap ou F)
          </span>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs"
          title="Quitter le mode plein écran"
          aria-label="Quitter le mode plein écran"
        >
          <Minimize className="w-3 h-3" />
          <span>Quitter</span>
        </button>
      </div>
    </aside>
  );
};
