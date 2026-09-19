import React from 'react';
import { 
  AlertTriangle, 
  Video, 
  Users, 
  Phone, 
  Volume2, 
  MapPin, 
  Sun, 
  Sparkles, 
  Calendar,
  Clock,
  Heart,
  Plus, 
  CheckCircle2,
  Maximize,
  Minimize
} from 'lucide-react';
import { CityInfo, TextSize, ThemeConfig, CommunityEvent, ToolLoan } from '../types';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { speakText } from '../utils/speech';
import { ToolLoansSection } from './ToolLoansSection';

interface SeniorHomeViewProps {
  currentCity: CityInfo;
  textSize: TextSize;
  themeConfig: ThemeConfig;
  events: CommunityEvent[];
  toolLoans: ToolLoan[];
  onOpenSOS: () => void;
  onOpenHelpRequest: () => void;
  onGoToVillage: (categoryFilter?: string) => void;
  onOpenOrganizeModal: () => void;
  onJoinEvent: (eventId: string) => void;
  onOpenNewLoanModal: () => void;
  onOpenReceipt: (loan: ToolLoan) => void;
  onMarkAsReturned: (loanId: string) => void;
  onSendReminder: (loanId: string) => void;
  onSelectInitiative?: (id: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const SeniorHomeView: React.FC<SeniorHomeViewProps> = ({
  currentCity,
  textSize,
  themeConfig,
  events,
  toolLoans,
  onOpenSOS,
  onOpenHelpRequest,
  onGoToVillage,
  onOpenOrganizeModal,
  onJoinEvent,
  onOpenNewLoanModal,
  onOpenReceipt,
  onMarkAsReturned,
  onSendReminder,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';

  const titleScaleClass =
    textSize === 'giant' ? 'text-3xl sm:text-5xl' :
    textSize === 'xlarge' ? 'text-2xl sm:text-4xl' : 
    'text-xl sm:text-3xl';

  const cardTitleClass =
    textSize === 'giant' ? 'text-2xl sm:text-3xl' :
    textSize === 'xlarge' ? 'text-xl sm:text-2xl' : 
    'text-lg sm:text-xl';

  const bodyScaleClass =
    textSize === 'giant' ? 'text-lg sm:text-xl' :
    textSize === 'xlarge' ? 'text-base sm:text-lg' : 
    'text-sm sm:text-base';

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-6xl mx-auto pb-16 overflow-hidden">
      {/* Friendly Weather & Welcome Bar */}
      <div className={`rounded-3xl p-4 sm:p-7 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white border-amber-300 shadow-gold'
          : themeConfig.themeId === 'gold-dark'
          ? 'bg-stone-900 border-amber-500 shadow-gold-lg text-white'
          : themeConfig.themeId === 'dark'
          ? 'bg-slate-900 border-slate-700 text-white shadow-md'
          : themeConfig.themeId === 'high-contrast'
          ? 'bg-black border-4 border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-base font-extrabold text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full w-fit mb-2">
            <Sun className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
            <span className="truncate">Météo à {currentCity.name} : Soleil · 22°C</span>
          </div>
          <h1 className={`font-black tracking-tight ${titleScaleClass} ${
            isGold ? 'text-gold-gradient' : ''
          }`}>
            Bonjour <span className={isGold ? 'text-amber-500' : 'text-orange-600'}>Jean</span> 👋
          </h1>
          <p className={`font-semibold mt-1 ${bodyScaleClass} ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Quartier Le Couchant · 12 jeunes et aînés bienveillants sont connectés près de chez vous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => speakText(`Bonjour Jean. Bienvenue à La Grande-Motte dans le quartier du Couchant. Douze voisins sont connectés pour vous aider. Si vous avez besoin d'aide ou d'une urgence, tout est écrit en grand ci-dessous.`)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-base cursor-pointer transition shadow-xs border-2 ${
              isGold 
                ? 'bg-amber-100/80 border-amber-400 text-amber-950 hover:bg-amber-200' 
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <Volume2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <span>Écouter</span>
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black text-xs sm:text-base cursor-pointer transition shadow-xs border-2 active:scale-95 ${
                isFullscreen
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md ring-2 ring-amber-300'
                  : isGold
                  ? 'bg-amber-100/80 border-amber-400 text-amber-950 hover:bg-amber-200'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
              title={isFullscreen ? "Quitter le plein écran (Touche Échap)" : "Afficher en plein écran pour un grand confort visuel (Touche F)"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-stone-950 flex-shrink-0" />
              ) : (
                <Maximize className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <span>{isFullscreen ? 'Quitter Plein Écran' : 'Plein Écran'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Giant Action Cards for Seniors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 w-full">
        {/* 1. SOS URGENCE */}
        <div 
          onClick={onOpenSOS}
          className="bg-gradient-to-br from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-red-600/30 border-4 border-red-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-white/20 flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 shadow-inner group-hover:scale-110 transition">
              🚨
            </div>
            <span className="bg-red-950/80 text-red-100 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md mb-2 inline-block">
              Secours Immédiats
            </span>
            <h2 className={`font-black font-['Outfit'] leading-tight text-white ${cardTitleClass}`}>
              URGENCE (SOS)
            </h2>
            <p className={`text-red-100 font-semibold mt-2.5 leading-snug ${bodyScaleClass}`}>
              Alerte en 1 clic vos 3 voisins de garde certifiés et contacte le SAMU (15).
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-4 border-t border-red-400/50 flex items-center justify-between font-black text-sm sm:text-base text-white">
            <span>Appuyer pour voir l'alerte</span>
            <span className="text-xl sm:text-2xl">➔</span>
          </div>
        </div>

        {/* 2. J'AI BESOIN D'AIDE */}
        <div 
          onClick={onOpenHelpRequest}
          className={`rounded-3xl p-5 sm:p-7 shadow-xl border-4 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 active:scale-98 group relative overflow-hidden ${
            isGold
              ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 border-amber-300 shadow-gold'
              : 'bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white border-amber-300 shadow-orange-600/30'
          }`}
        >
          <div>
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-white/20 flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 shadow-inner group-hover:scale-110 transition">
              🎙️
            </div>
            <span className="bg-black/30 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md mb-2 inline-block">
              Dictée vocale ou Vidéo
            </span>
            <h2 className={`font-black leading-tight text-white ${cardTitleClass}`}>
              J'ai besoin d'un coup de main
            </h2>
            <p className={`font-semibold mt-2.5 leading-snug text-amber-50 ${bodyScaleClass}`}>
              Courses, ampoule, télévision, sac lourd : parlez simplement dans votre micro.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-4 border-t border-white/30 flex items-center justify-between font-black text-sm sm:text-base text-white">
            <span>Parler à un voisin</span>
            <span className="text-xl sm:text-2xl">➔</span>
          </div>
        </div>

        {/* 3. ORGANISER OU REJOINDRE UN MOMENT */}
        <div 
          onClick={onOpenOrganizeModal}
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-emerald-600/30 border-4 border-emerald-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 active:scale-98 group relative overflow-hidden"
        >
          <div>
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-white/20 flex items-center justify-center text-3xl sm:text-4xl mb-3 sm:mb-4 shadow-inner group-hover:scale-110 transition">
              ☕
            </div>
            <span className="bg-emerald-950/80 text-emerald-100 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md mb-2 inline-block">
              Lien & Chaleur humaine
            </span>
            <h2 className={`font-black leading-tight text-white ${cardTitleClass}`}>
              Organiser un Moment
            </h2>
            <p className={`text-emerald-100 font-semibold mt-2.5 leading-snug ${bodyScaleClass}`}>
              Café au port, belote, balade en bord de mer, goûter maison : créez une rencontre en 1 clic !
            </p>
          </div>
          <div className="mt-6 sm:mt-8 pt-4 border-t border-emerald-400/50 flex items-center justify-between font-black text-sm sm:text-base text-white">
            <span>Lancer une invitation</span>
            <span className="text-xl sm:text-2xl">➔</span>
          </div>
        </div>
      </div>

      {/* SECTION: GESTION & TRACE DES PRÊTS D'OUTILS */}
      <ToolLoansSection
        loans={toolLoans}
        currentCity={currentCity}
        themeConfig={themeConfig}
        onOpenNewLoanModal={onOpenNewLoanModal}
        onOpenReceipt={onOpenReceipt}
        onMarkAsReturned={onMarkAsReturned}
        onSendReminder={onSendReminder}
      />

      {/* SECTION: MOMENTS & ÉVÉNEMENTS CONVIVIAUX DU QUARTIER */}
      <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white border-amber-300 shadow-gold'
          : themeConfig.themeId === 'gold-dark'
          ? 'bg-stone-900 border-amber-500 shadow-gold-lg text-white'
          : themeConfig.themeId === 'dark'
          ? 'bg-slate-900 border-slate-700 text-white'
          : themeConfig.themeId === 'high-contrast'
          ? 'bg-black border-4 border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎉</span>
              <h3 className={`font-black ${cardTitleClass} ${isGold ? 'text-gold-gradient' : ''}`}>
                Rencontres & Moments Conviviaux à {currentCity.name}
              </h3>
            </div>
            <p className={`font-medium mt-1 ${bodyScaleClass} ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Retrouvez vos voisins pour papoter, jouer ou marcher ensemble au grand air.
            </p>
          </div>

          <button
            onClick={onOpenOrganizeModal}
            className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 text-base cursor-pointer transition active:scale-95 border-2 border-amber-200"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            <span>+ Proposer une rencontre</span>
          </button>
        </div>

        {/* List of upcoming events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.slice(0, 4).map((evt) => {
            const isAttending = evt.attendees.includes('Vous (Organisateur)') || evt.attendees.includes('Vous');

            return (
              <div
                key={evt.id}
                className={`p-5 rounded-2xl border-2 transition flex flex-col justify-between ${
                  isGold
                    ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                    : isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs">
                        {evt.icon}
                      </span>
                      <div>
                        <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {evt.categoryLabel}
                        </span>
                        <h4 className={`font-black text-lg sm:text-xl mt-1 leading-snug ${
                          isGold ? 'text-gold-gradient' : (isDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {evt.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 my-3 text-xs sm:text-sm font-bold text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-orange-700">
                      <Calendar className="w-4 h-4" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-700">
                      <Clock className="w-4 h-4" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 w-full truncate">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="truncate">{evt.location} ({evt.quartier})</span>
                    </div>
                  </div>

                  <p className={`font-medium text-slate-700 leading-relaxed ${bodyScaleClass}`}>
                    {evt.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    👥 {evt.attendees.length} voisin{evt.attendees.length > 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => onJoinEvent(evt.id)}
                    disabled={isAttending}
                    className={`font-black text-sm px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      isAttending
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                    }`}
                  >
                    {isAttending ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Vous participez !</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Je viens !</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mes Voisins de Confiance (Compact) */}
      <div className={`rounded-2xl p-4 sm:p-5 border-2 transition-all mt-4 ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white border-amber-300 shadow-gold'
          : themeConfig.themeId === 'gold-dark'
          ? 'bg-stone-900 border-amber-500 shadow-gold text-white'
          : themeConfig.themeId === 'dark'
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🤝</span>
            <div>
              <h3 className={`font-black text-base sm:text-lg ${isGold ? 'text-gold-gradient' : ''}`}>
                Mes Voisins de Confiance ({currentCity.name})
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                Bénévoles certifiés disponibles par téléphone ou visite.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {EMERGENCY_CONTACTS.slice(3, 6).map((contact) => (
            <div 
              key={contact.id} 
              className={`p-3 rounded-xl border-2 flex items-center justify-between gap-2.5 transition ${
                isGold 
                  ? 'bg-amber-50/50 border-amber-300' 
                  : isDark 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-slate-50 border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl sm:text-3xl p-1.5 bg-white rounded-xl shadow-2xs flex-shrink-0">{contact.avatar}</span>
                <div className="min-w-0">
                  <h4 className={`font-black text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {contact.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-bold truncate">{contact.role}</p>
                  {contact.distance && (
                    <span className="inline-block text-[10px] text-emerald-800 font-black bg-emerald-100 px-1.5 py-0.2 rounded">
                      📍 {contact.distance}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => speakText(`Contact : ${contact.name}, ${contact.role}. Numéro : ${contact.phone}`)}
                  className="p-1.5 text-slate-600 hover:text-orange-600 rounded-lg hover:bg-white transition"
                  title="Écouter le contact"
                >
                  <Volume2 className="w-4 h-4 text-orange-600" />
                </button>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-2xs"
                  title={`Appeler ${contact.name}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
