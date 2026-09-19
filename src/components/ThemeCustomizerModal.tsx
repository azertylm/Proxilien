import React from 'react';
import { ThemeConfig, ThemeId, FontFamilyId, TextSize } from '../types';
import { 
  Palette, 
  X, 
  Sparkles, 
  Check, 
  Sun, 
  Moon, 
  Eye, 
  Type, 
  Maximize2,
  Crown
} from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  onUpdateConfig: (newConfig: ThemeConfig) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const themes: {
    id: ThemeId;
    name: string;
    description: string;
    badge?: string;
    bgPreview: string;
    textPreview: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'gold-white',
      name: 'Or Précieux sur Fond Blanc & Nacre',
      description: 'Belles lettres d\'or sur fond blanc pur avec dorures chaleureuses et reflets solaires.',
      badge: 'Signature',
      bgPreview: 'bg-white border-2 border-amber-400',
      textPreview: 'text-amber-700 font-serif',
      icon: <Crown className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'light',
      name: 'Clair Doux & Chaleureux',
      description: 'Fond clair reposant avec des contrastes naturels orange terre cuite.',
      bgPreview: 'bg-slate-50 border-2 border-orange-200',
      textPreview: 'text-slate-900',
      icon: <Sun className="w-5 h-5 text-orange-500" />,
    },
    {
      id: 'dark',
      name: 'Mode Sombre Apaisant',
      description: 'Fond ardoise sombre velouté, idéal pour reposer la vue en soirée.',
      bgPreview: 'bg-slate-900 border-2 border-slate-700',
      textPreview: 'text-slate-100',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'gold-dark',
      name: 'Or Impérial sur Fond Nuit',
      description: 'Lettres d\'or étincelantes sur un fond noir profond très élégant.',
      bgPreview: 'bg-stone-950 border-2 border-amber-500',
      textPreview: 'text-amber-300 font-serif',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'mediterranean',
      name: 'Bleu Azur & Sables Dorés',
      description: 'Inspiré des flots marins et des plages de La Grande-Motte.',
      bgPreview: 'bg-sky-50 border-2 border-sky-300',
      textPreview: 'text-sky-950',
      icon: <span className="text-xl">🌊</span>,
    },
    {
      id: 'high-contrast',
      name: 'Contraste Maximal Malvoyant',
      description: 'Noir profond & jaune vif ultra-contrasté pour une lisibilité infaillible.',
      bgPreview: 'bg-black border-2 border-yellow-400',
      textPreview: 'text-yellow-300 font-black',
      icon: <Eye className="w-5 h-5 text-yellow-400" />,
    },
  ];

  const fonts: {
    id: FontFamilyId;
    name: string;
    sample: string;
    cssClass: string;
    desc: string;
  }[] = [
    {
      id: 'playfair',
      name: 'Playfair Display (Lettres Nobles & Or)',
      sample: 'ProxiLien Solidarité',
      cssClass: 'font-playfair font-bold',
      desc: 'Caractères classiques et majestueux avec pleins et déliés nobles.',
    },
    {
      id: 'cinzel',
      name: 'Cinzel (Prestige & Gravure Royale)',
      sample: 'LA GRANDE-MOTTE',
      cssClass: 'font-cinzel font-bold tracking-wider',
      desc: 'Inspiré des inscriptions impériales, parfait avec les lettres d\'or.',
    },
    {
      id: 'lexend',
      name: 'Lexend (Spécial Aînés & Basse Vision)',
      sample: 'Facile à lire sans lunettes',
      cssClass: 'font-lexend font-bold',
      desc: 'Police scientifique étudiée pour supprimer la fatigue visuelle.',
    },
    {
      id: 'outfit',
      name: 'Outfit (Moderne, Douce & Ronde)',
      sample: 'Chaleureux & Amical',
      cssClass: 'font-outfit font-bold',
      desc: 'Formes généreuses et contemporaines très lisibles de loin.',
    },
    {
      id: 'caveat',
      name: 'Caveat (Manuscrite comme une lettre de voisin)',
      sample: 'Comme un mot doux sur la table',
      cssClass: 'font-caveat font-bold text-xl',
      desc: 'Écriture à la main conviviale et pleine d\'humanité.',
    },
    {
      id: 'jakarta',
      name: 'Plus Jakarta Sans (Standard Universel)',
      sample: 'Net et épuré',
      cssClass: 'font-jakarta font-bold',
      desc: 'Caractères neutres et très équilibrés.',
    },
  ];

  const sizes: {
    id: TextSize;
    label: string;
    detail: string;
  }[] = [
    {
      id: 'large',
      label: 'Grand (Confort standard)',
      detail: 'Recommandé pour un usage quotidien agréable',
    },
    {
      id: 'xlarge',
      label: 'Très Grand (A+ Sans effort)',
      detail: 'Idéal si vous lisez d\'ordinaire avec des lunettes',
    },
    {
      id: 'giant',
      label: 'Géant (A++ Très gros caractères)',
      detail: 'Confort maximal pour aînés et malvoyants',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-300 flex flex-col max-h-[92vh]"
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Palette className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] flex items-center gap-2">
                <span>Personnalisation & Confort Visuel</span>
                <Sparkles className="w-5 h-5 text-amber-200" />
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Choisissez vos couleurs préférées, vos lettres en or et votre taille de texte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer la personnalisation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Live Preview Box */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/50 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Aperçu en direct de vos choix :
            </span>
            <div className={`p-4 rounded-xl shadow-xs transition-all ${
              config.themeId === 'gold-white' ? 'bg-white border-2 border-amber-400 text-amber-800' :
              config.themeId === 'gold-dark' ? 'bg-stone-950 border-2 border-amber-400 text-amber-300' :
              config.themeId === 'dark' ? 'bg-slate-900 border border-slate-700 text-white' :
              config.themeId === 'high-contrast' ? 'bg-black border-2 border-yellow-400 text-yellow-300' :
              config.themeId === 'mediterranean' ? 'bg-sky-50 border border-sky-300 text-sky-950' :
              'bg-slate-50 border border-slate-200 text-slate-900'
            }`}>
              <div className={`text-xl sm:text-2xl ${
                config.fontFamily === 'playfair' ? 'font-playfair font-black' :
                config.fontFamily === 'cinzel' ? 'font-cinzel font-black tracking-wider' :
                config.fontFamily === 'lexend' ? 'font-lexend font-bold' :
                config.fontFamily === 'caveat' ? 'font-caveat text-3xl font-bold' :
                config.fontFamily === 'outfit' ? 'font-outfit font-black' :
                'font-jakarta font-bold'
              } ${
                (config.themeId === 'gold-white' || config.themeId === 'gold-dark') ? 'text-gold-gradient' : ''
              }`}>
                ✨ ProxiLien La Grande-Motte
              </div>
              <p className="text-sm mt-1 opacity-90">
                « Voisins bienveillants et aînés se rencontrent chaque jour au port et au Couchant. »
              </p>
            </div>
          </div>

          {/* Section 1: Thème de couleur */}
          <div>
            <label className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-amber-600" />
              <span>1. Ambiance & Couleurs (Mode Sombre, Clair ou Lettres en Or) :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => {
                const isSelected = config.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdateConfig({ ...config, themeId: t.id })}
                    className={`p-3.5 rounded-2xl text-left border-2 transition cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">
                      {t.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {t.name}
                        </span>
                        {t.badge && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                            {t.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Police de caractères */}
          <div>
            <label className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 mb-3">
              <Type className="w-5 h-5 text-indigo-600" />
              <span>2. Style de la Police d'Écriture :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fonts.map((f) => {
                const isSelected = config.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onUpdateConfig({ ...config, fontFamily: f.id })}
                    className={`p-3.5 rounded-2xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-400/30 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {f.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className={`mt-2 text-base sm:text-lg text-slate-800 ${f.cssClass}`}>
                        {f.sample}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      {f.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Taille de lecture des aînés */}
          <div>
            <label className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 mb-3">
              <Maximize2 className="w-5 h-5 text-emerald-600" />
              <span>3. Grandeur des Lettres & Visibilité :</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sizes.map((s) => {
                const isSelected = config.textSize === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onUpdateConfig({ ...config, textSize: s.id })}
                    className={`p-3.5 rounded-2xl text-center border-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400/30 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-emerald-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="text-base sm:text-lg font-black">
                      {s.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {s.detail}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onUpdateConfig({
                themeId: 'gold-white',
                fontFamily: 'playfair',
                textSize: 'xlarge',
              });
            }}
            className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
          >
            ✨ Activer « Lettres d'Or & Grand Confort »
          </button>
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md cursor-pointer transition"
          >
            Enregistrer mes préférences
          </button>
        </div>
      </div>
    </div>
  );
};
