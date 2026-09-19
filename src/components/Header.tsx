import React, { useState } from 'react';
import { UserMode, TextSize, CityInfo, ThemeConfig } from '../types';
import { 
  Heart, 
  MapPin, 
  Tv, 
  User, 
  Users, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  ChevronDown,
  Palette,
  Sun,
  Moon,
  Crown,
  Maximize,
  Minimize
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface HeaderProps {
  currentCity: CityInfo;
  onOpenCitySelector: () => void;
  userMode: UserMode;
  onChangeUserMode: (mode: UserMode) => void;
  textSize: TextSize;
  onChangeTextSize: (size: TextSize) => void;
  onTriggerSOS: () => void;
  activeScreenTitle: string;
  activeScreenDesc?: string;
  themeConfig: ThemeConfig;
  onOpenThemeCustomizer: () => void;
  onQuickToggleTheme: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onOpenCitySelector,
  userMode,
  onChangeUserMode,
  textSize,
  onChangeTextSize,
  onTriggerSOS,
  activeScreenTitle,
  activeScreenDesc,
  themeConfig,
  onOpenThemeCustomizer,
  onQuickToggleTheme,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = `${activeScreenTitle}. ${activeScreenDesc || ''}. Vous êtes sur ProxiLien, ville de ${currentCity.name}.`;
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  const cycleTextSize = () => {
    if (textSize === 'large') onChangeTextSize('xlarge');
    else if (textSize === 'xlarge') onChangeTextSize('giant');
    else onChangeTextSize('large');
  };

  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';

  return (
    <header className={`sticky top-0 z-40 w-full max-w-full overflow-hidden transition-colors border-b ${
      themeConfig.themeId === 'gold-white' 
        ? 'bg-white/95 backdrop-blur-md border-amber-300 shadow-gold' :
      themeConfig.themeId === 'gold-dark' 
        ? 'bg-stone-950/95 backdrop-blur-md border-amber-500/80 shadow-gold-lg text-white' :
      themeConfig.themeId === 'dark' 
        ? 'bg-slate-900/95 backdrop-blur-md border-slate-700 shadow-md text-white' :
      themeConfig.themeId === 'high-contrast' 
        ? 'bg-black border-b-4 border-yellow-400 text-yellow-300' :
        'bg-white/95 backdrop-blur-md border-slate-200 shadow-xs'
    }`}>
      {/* Pilot City & National Expansion Bar */}
      <div className={`px-2.5 sm:px-4 py-1 text-xs font-semibold flex items-center justify-between w-full max-w-full ${
        isGold
          ? 'bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 text-white'
          : themeConfig.themeId === 'dark'
          ? 'bg-slate-950 text-slate-300 border-b border-slate-800'
          : themeConfig.themeId === 'high-contrast'
          ? 'bg-yellow-400 text-black font-black'
          : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold flex-shrink-0">
            {currentCity.badge === 'pilote' ? 'Pilote' : 'Active'}
          </span>
          <button 
            id="btn-header-city"
            onClick={onOpenCitySelector}
            className="flex items-center gap-1 hover:underline font-extrabold truncate cursor-pointer text-xs"
            title="Changer de ville"
          >
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{currentCity.name} ({currentCity.postalCode})</span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-xs">
          <span className="hidden md:inline font-bold">Solidarité Intergénérationnelle</span>
          <button
            onClick={onOpenCitySelector}
            className="bg-white/90 hover:bg-white text-slate-900 font-extrabold px-2 py-0.5 rounded shadow-xs transition cursor-pointer text-[11px] sm:text-xs"
          >
            + Autre ville
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-3">
        {/* Top Row: Brand on left + Quick Actions (Theme, Audio, SOS) on right */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${
              isGold
                ? 'bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-700 border border-amber-300 text-stone-900'
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
            }`}>
              {isGold ? <Crown className="w-5 h-5 text-stone-950" /> : <Heart className="w-5 h-5 fill-white" />}
            </div>
            <div className="min-w-0">
              <span className={`font-black text-xl sm:text-3xl tracking-tight leading-none block truncate ${
                isGold ? 'text-gold-gradient' : (isDark ? 'text-white' : 'text-slate-900')
              }`}>
                Proxi<span className={isGold ? 'text-amber-500' : 'text-orange-600'}>Lien</span>
              </span>
              <p className={`text-[11px] font-bold hidden sm:block truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {currentCity.name} · Aînés & Jeunes
              </p>
            </div>
          </div>

          {/* Desktop Mode Selector (Hidden on small mobile, visible on md+) */}
          <div className={`hidden md:flex items-center p-1 rounded-2xl border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200/80'
          }`}>
            <button
              id="btn-mode-senior"
              onClick={() => onChangeUserMode('senior')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                userMode === 'senior'
                  ? (isGold ? 'bg-amber-500 text-stone-950 shadow-md font-black' : 'bg-orange-600 text-white shadow-sm')
                  : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60')
              }`}
            >
              <User className="w-4 h-4" />
              <span>Mode Aîné</span>
            </button>

            <button
              id="btn-mode-jeune"
              onClick={() => onChangeUserMode('jeune')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                userMode === 'jeune'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : (isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60')
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Voisins & Jeunes</span>
            </button>

            <button
              id="btn-mode-tv"
              onClick={() => onChangeUserMode('tv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
                userMode === 'tv'
                  ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-400'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-purple-100/60'
              }`}
              title="Google TV"
            >
              <Tv className="w-4 h-4 text-amber-300" />
              <span className="font-extrabold">TV</span>
            </button>
          </div>

          {/* Right Tools (Responsive: icon buttons on mobile, full on desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Theme Customizer button */}
            <button
              id="btn-header-theme"
              onClick={onOpenThemeCustomizer}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border-2 flex items-center gap-1.5 text-xs font-black transition cursor-pointer ${
                isGold
                  ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-gold'
                  : (isDark
                      ? 'bg-slate-800 border-amber-400/60 text-amber-300 hover:bg-slate-700'
                      : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50 shadow-xs')
              }`}
              title="Personnaliser : Lettres d'Or, Mode Sombre, Polices"
              aria-label="Personnaliser les thèmes et polices"
            >
              <Palette className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="hidden lg:inline">
                {themeConfig.themeId === 'gold-white' ? 'Style Or' : 'Thème'}
              </span>
            </button>

            {/* Quick Dark/Light toggle */}
            <button
              onClick={onQuickToggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Mode Clair / Sombre"
              aria-label="Basculer mode clair ou sombre"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Read aloud button */}
            <button
              id="btn-audio-read"
              onClick={handleToggleSpeak}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-200 border-amber-400 text-amber-950 animate-pulse'
                  : (isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
              }`}
              title="Écouter à voix haute"
              aria-label="Écouter à voix haute"
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 text-amber-800 flex-shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
              )}
              <span className="hidden xl:inline">{isSpeaking ? 'Arrêter' : 'Écouter'}</span>
            </button>

            {/* Text Size Cycle with Large label */}
            <button
              id="btn-toggle-text-size"
              onClick={cycleTextSize}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
              title={`Taille du texte : ${textSize}. Cliquer pour agrandir.`}
            >
              <span className="text-orange-600 font-black">
                {textSize === 'large' ? 'A' : textSize === 'xlarge' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* Fullscreen Mode Button */}
            {onToggleFullscreen && (
              <button
                id="btn-header-fullscreen"
                onClick={onToggleFullscreen}
                className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs font-black transition cursor-pointer active:scale-95 ${
                  isFullscreen
                    ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md ring-2 ring-amber-300'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isFullscreen ? "Quitter le plein écran (Touche Échap ou F)" : "Activer le mode plein écran (Grand confort visuel, Touche F)"}
                aria-label={isFullscreen ? "Quitter le mode plein écran" : "Activer le mode plein écran"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-stone-950 flex-shrink-0" />
                ) : (
                  <Maximize className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {isFullscreen ? 'Normal' : 'Plein Écran'}
                </span>
              </button>
            )}

            {/* Direct SOS Button in Header */}
            <button
              id="btn-header-sos"
              onClick={onTriggerSOS}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-1 text-xs sm:text-sm tracking-wide transition cursor-pointer active:scale-95"
              aria-label="Déclencher SOS Urgence"
            >
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Row 2: Mode Selector full width (Visible on mobile only, hidden on md+) */}
        <div className="md:hidden mt-2 pt-1 border-t border-slate-200/50">
          <div className={`grid grid-cols-3 p-1 rounded-xl border gap-1 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200/80'
          }`}>
            <button
              onClick={() => onChangeUserMode('senior')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                userMode === 'senior'
                  ? (isGold ? 'bg-amber-500 text-stone-950 shadow-sm font-black' : 'bg-orange-600 text-white shadow-xs')
                  : (isDark ? 'text-slate-300' : 'text-slate-700')
              }`}
            >
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Mode Aîné</span>
            </button>

            <button
              onClick={() => onChangeUserMode('jeune')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                userMode === 'jeune'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : (isDark ? 'text-slate-300' : 'text-slate-700')
              }`}
            >
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Jeune</span>
            </button>

            <button
              onClick={() => onChangeUserMode('tv')}
              className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                userMode === 'tv'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" />
              <span className="truncate">TV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
