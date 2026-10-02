import React from 'react';
import { Layers, Sparkles, ExternalLink, ShieldCheck, Crown } from 'lucide-react';

interface AlphabetteNavbarProps {
  onOpenSubscriptionModal: () => void;
  onOpenSovereignStatus?: () => void;
}

export const AlphabetteNavbar: React.FC<AlphabetteNavbarProps> = ({
  onOpenSubscriptionModal,
  onOpenSovereignStatus,
}) => {
  const bouquetApps = [
    { name: 'Proxilien', active: true, tag: 'Actif' },
    { name: 'Info Perso', active: false, tag: 'Grand format' },
    { name: 'Focus News', active: false, tag: 'Actualités' },
    { name: "L'Œil de l'Atelier", active: false, tag: '3D & IoT' },
    { name: 'Papier Papier', active: false, tag: 'Édition' },
    { name: 'IA Débat', active: false, tag: 'Agora' },
  ];

  return (
    <nav aria-label="Navigation du bouquet Alphabette" className="w-full bg-stone-950 text-stone-200 px-3 py-1.5 text-[11px] font-medium border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="flex items-center gap-1 font-black text-amber-400 tracking-wider uppercase">
          <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>ALPHABETTE</span>
        </span>
        <span className="text-stone-600">|</span>
        <div className="hidden md:flex items-center gap-1.5">
          {bouquetApps.map((app, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded transition ${
                app.active
                  ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white cursor-pointer'
              }`}
              title={`Application ${app.name} (${app.tag}) - Bouquet Alphabette`}
            >
              {app.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition cursor-pointer"
          title="Bouquet Intégral Alphabette (40€/an)"
        >
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Bouquet 40€/an</span>
        </button>

        {onOpenSovereignStatus && (
          <button
            type="button"
            onClick={onOpenSovereignStatus}
            className="text-stone-400 hover:text-stone-200 hidden sm:flex items-center gap-1 cursor-pointer"
            title="Conformité Souveraine & RGPD (Mistral AI)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Souverain</span>
          </button>
        )}
      </div>
    </nav>
  );
};
