import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Mic, 
  Users, 
  Phone, 
  Volume2, 
  Tv, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  CornerDownLeft, 
  Home, 
  Sun
} from 'lucide-react';
import { CityInfo } from '../types';
import { INITIATIVES_50 } from '../data/initiatives';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { speakText, stopSpeaking } from '../utils/speech';

interface TVModeViewProps {
  currentCity: CityInfo;
  onOpenSOS: () => void;
  onOpenHelpRequest: () => void;
  onGoToVillage: () => void;
  onExitTVMode: () => void;
}

export const TVModeView: React.FC<TVModeViewProps> = ({
  currentCity,
  onOpenSOS,
  onOpenHelpRequest,
  onGoToVillage,
  onExitTVMode,
}) => {
  // Focus index for remote control navigation:
  // 0: SOS
  // 1: Parler / Aide
  // 2: Place du Village
  // 3: Appeler un voisin
  // 4: Écouter la télé
  // 5: Quitter mode TV
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [tvSubscreen, setTvSubscreen] = useState<'home' | 'initiatives' | 'contacts'>('home');
  const [selectedContactIdx, setSelectedContactIdx] = useState<number>(0);

  const TV_MENU_ITEMS = [
    { id: 0, title: '🚨 SOS URGENCE', desc: 'Alerte immédiate à vos 3 voisins veilleurs', color: 'from-red-600 to-rose-700 ring-red-400' },
    { id: 1, title: '🎤 PARLER & DEMANDER', desc: 'Dicter un besoin sans clavier (Courses, Panne)', color: 'from-orange-600 to-amber-600 ring-orange-400' },
    { id: 2, title: '🏘️ PLACE DU VILLAGE', desc: 'Voir les 50 initiatives d\'entraide de La Grande-Motte', color: 'from-indigo-700 to-violet-800 ring-indigo-400' },
    { id: 3, title: '📞 APPELER UN VOISIN', desc: 'Lucas, Marie ou le CCAS au téléphone', color: 'from-emerald-700 to-teal-800 ring-emerald-400' },
  ];

  // Handle keyboard/remote control keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => (prev % 2 === 0 ? prev + 1 : prev));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => (prev % 2 === 1 ? prev - 1 : prev));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev < 2 ? prev + 2 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev >= 2 ? prev - 2 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          handleActivateIndex(focusedIndex);
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          if (tvSubscreen !== 'home') setTvSubscreen('home');
          else onExitTVMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, tvSubscreen]);

  const handleActivateIndex = (idx: number) => {
    switch (idx) {
      case 0:
        onOpenSOS();
        break;
      case 1:
        onOpenHelpRequest();
        break;
      case 2:
        onGoToVillage();
        break;
      case 3:
        setTvSubscreen('contacts');
        break;
      default:
        break;
    }
  };

  const handleReadScreen = () => {
    speakText(`Mode Télévision ProxiLien La Grande-Motte. Utilisez les flèches de la télécommande pour vous déplacer. Options : Urgence SOS, Parler et Demander de l'aide, Place du Village, et Appeler un voisin.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col justify-between select-none">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-amber-300 shadow-lg">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
                ProxiLien <span className="text-orange-500">TV</span>
              </span>
              <span className="bg-orange-600/30 text-orange-400 border border-orange-500/40 text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
                Google TV & Grand Écran
              </span>
            </div>
            <p className="text-sm text-slate-400 font-semibold">
              Ville de {currentCity.name} · Utilisez la télécommande (Touches Flèches & OK)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReadScreen}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-2xl transition border border-slate-700 text-sm cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-orange-400" />
            <span className="hidden sm:inline">Écouter à la voix</span>
          </button>

          <button
            onClick={onExitTVMode}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-2xl transition border border-slate-700 text-sm cursor-pointer"
          >
            Quitter le Mode TV
          </button>
        </div>
      </div>

      {/* Main 4 TV Quadrants */}
      {tvSubscreen === 'home' ? (
        <div className="my-auto py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-4xl font-black font-['Outfit'] text-amber-400">
              Que souhaitez-vous faire aujourd'hui ?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-1">
              Appuyez sur <strong className="text-white">OK</strong> sur la télécommande pour sélectionner votre choix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {TV_MENU_ITEMS.map((item) => {
              const isFocused = focusedIndex === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setFocusedIndex(item.id);
                    handleActivateIndex(item.id);
                  }}
                  onMouseEnter={() => setFocusedIndex(item.id)}
                  className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${item.color} text-white shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] relative overflow-hidden ${
                    isFocused
                      ? 'ring-8 ring-amber-400 scale-[1.03] shadow-amber-400/30 brightness-110 z-10'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
                      {item.title}
                    </span>
                    {isFocused && (
                      <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                        Sélectionné (OK)
                      </span>
                    )}
                  </div>

                  <p className="text-white/90 font-medium text-base sm:text-xl mt-3 leading-snug">
                    {item.desc}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs sm:text-sm font-bold text-white/80">
                    <span>Appuyer pour ouvrir</span>
                    <CornerDownLeft className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Subscreen: Phone Contacts on TV */
        <div className="my-auto py-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-emerald-400 flex items-center gap-3">
              <Phone className="w-8 h-8" />
              <span>Vos Voisins de Garde à {currentCity.name}</span>
            </h3>
            <button
              onClick={() => setTvSubscreen('home')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-sm"
            >
              Retour à l'accueil TV
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMERGENCY_CONTACTS.slice(3, 7).map((c, i) => (
              <div
                key={c.id}
                className="bg-slate-900 border-2 border-slate-700 p-5 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2 bg-slate-800 rounded-2xl">{c.avatar}</span>
                  <div>
                    <h4 className="font-extrabold text-xl text-white">{c.name}</h4>
                    <p className="text-sm text-slate-400">{c.role}</p>
                    <p className="text-xs text-emerald-400 font-bold mt-0.5">📞 {c.phone}</p>
                  </div>
                </div>
                <a
                  href={`tel:${c.phone.replace(/\s+/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-3 rounded-xl text-sm shadow-md"
                >
                  Appeler
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On-Screen Virtual Remote Control (to test TV controls on any device) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 max-w-3xl mx-auto w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            🎮 Télécommande TV Virtuelle :
          </span>
          <p className="text-xs text-slate-400">
            Vous pouvez tester avec les flèches du clavier ou les boutons ci-contre :
          </p>
        </div>

        {/* D-Pad Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFocusedIndex(prev => (prev >= 2 ? prev - 2 : prev))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl border border-slate-700 cursor-pointer shadow-sm"
            title="Flèche Haut"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFocusedIndex(prev => (prev < 2 ? prev + 2 : prev))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl border border-slate-700 cursor-pointer shadow-sm"
            title="Flèche Bas"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFocusedIndex(prev => (prev % 2 === 1 ? prev - 1 : prev))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl border border-slate-700 cursor-pointer shadow-sm"
            title="Flèche Gauche"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFocusedIndex(prev => (prev % 2 === 0 ? prev + 1 : prev))}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl border border-slate-700 cursor-pointer shadow-sm"
            title="Flèche Droite"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleActivateIndex(focusedIndex)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl cursor-pointer shadow-md text-xs sm:text-sm"
            title="Valider OK"
          >
            OK
          </button>
          <button
            onClick={onOpenSOS}
            className="px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl cursor-pointer shadow-md text-xs sm:text-sm animate-pulse"
            title="Bouton Rouge SOS"
          >
            SOS
          </button>
        </div>
      </div>
    </div>
  );
};
