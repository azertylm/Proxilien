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
import { CityInfo, TextSize, ThemeConfig, CommunityEvent, ToolLoan, HelpRequest } from '../types';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { speakText } from '../utils/speech';
import { ToolLoansSection } from './ToolLoansSection';
import { SeniorHelpTrackingSection } from './SeniorHelpTrackingSection';

interface SeniorHomeViewProps {
  currentCity: CityInfo;
  textSize: TextSize;
  themeConfig: ThemeConfig;
  events: CommunityEvent[];
  toolLoans: ToolLoan[];
  activeRequests?: HelpRequest[];
  onConfirmResolvedRequest?: (reqId: string) => void;
  onSimulateNeighborArrival?: (reqId: string) => void;
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
  onOpenAIAssistant?: () => void;
  onOpenSovereignStatus?: () => void;
}

export const SeniorHomeView: React.FC<SeniorHomeViewProps> = ({
  currentCity,
  textSize,
  themeConfig,
  events,
  toolLoans,
  activeRequests = [],
  onConfirmResolvedRequest,
  onSimulateNeighborArrival,
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
  onOpenAIAssistant,
  onOpenSovereignStatus,
}) => {
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';

  const titleScaleClass =
    textSize === 'giant' ? 'text-3xl sm:text-5xl lg:text-6xl' :
    textSize === 'xlarge' ? 'text-2xl sm:text-4xl lg:text-5xl' : 
    textSize === 'large' ? 'text-xl sm:text-3xl lg:text-4xl' :
    'text-lg sm:text-2xl lg:text-3xl';

  const cardTitleClass =
    textSize === 'giant' ? 'text-2xl sm:text-4xl' :
    textSize === 'xlarge' ? 'text-xl sm:text-3xl' : 
    textSize === 'large' ? 'text-lg sm:text-2xl' :
    'text-base sm:text-xl';

  const bodyScaleClass =
    textSize === 'giant' ? 'text-xl sm:text-2xl' :
    textSize === 'xlarge' ? 'text-lg sm:text-xl' : 
    textSize === 'large' ? 'text-base sm:text-lg' :
    'text-sm sm:text-base';

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full max-w-6xl mx-auto pb-12">
      {/* 1. LES 3 ACTIONS ESSENTIELLES (TOUJOURS EN PREMIER SUR LA PAGE - RÉDUITES DE 40%) */}
      <div id="senior-primary-actions" className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
        {/* 1. SOS URGENCE */}
        <div 
          id="senior-card-sos"
          onClick={onOpenSOS}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenSOS()}
          className="bg-gradient-to-br from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-lg shadow-red-600/25 border-3 border-red-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-red-950/80 text-red-100 text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                🚨 Secours Immédiats
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg sm:text-xl shadow-inner group-hover:scale-110 transition flex-shrink-0">
                🚨
              </span>
            </div>
            <h2 className="font-black font-['Outfit'] leading-tight text-white text-lg sm:text-xl md:text-2xl">
              SOS URGENCE
            </h2>
            <p className="text-red-100 font-semibold mt-1 text-xs sm:text-sm leading-snug line-clamp-2">
              Alerte en 1 clic vos 3 voisins certifiés & le SAMU (15).
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-red-400/50 flex items-center justify-between font-black text-xs sm:text-sm text-white">
            <span>Déclencher l'alerte</span>
            <span className="text-base sm:text-lg">➔</span>
          </div>
        </div>

        {/* 2. VIENS ! BESOIN D'AIDE (VOCALE & VIDÉO) */}
        <div 
          id="senior-card-viens"
          onClick={onOpenHelpRequest}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenHelpRequest()}
          className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-lg border-3 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden ${
            isGold
              ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 border-amber-300 shadow-gold'
              : 'bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white border-amber-300 shadow-orange-600/25'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-black/40 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                🎙️ Dictée vocale ou 📹 Vidéo
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg sm:text-xl shadow-inner group-hover:scale-110 transition flex-shrink-0">
                ⚡
              </span>
            </div>
            <h2 className="font-black leading-tight text-white text-lg sm:text-xl md:text-2xl">
              Viens m'aider !
            </h2>
            <p className="font-semibold mt-1 text-xs sm:text-sm leading-snug text-amber-50 line-clamp-2">
              Courses, ampoule, télévision : parlez au micro ou montrez en vidéo.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/30 flex items-center justify-between font-black text-xs sm:text-sm text-white">
            <span>Parler ou montrer en vidéo</span>
            <span className="text-base sm:text-lg">➔</span>
          </div>
        </div>

        {/* 3. CHALEUR HUMAINE & LIEN */}
        <div 
          id="senior-card-chaleur-humaine"
          onClick={onOpenOrganizeModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenOrganizeModal()}
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-lg shadow-emerald-600/25 border-3 border-emerald-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-emerald-950/80 text-emerald-100 text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                ☕ Lien & Chaleur humaine
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg sm:text-xl shadow-inner group-hover:scale-110 transition flex-shrink-0">
                ❤️
              </span>
            </div>
            <h2 className="font-black leading-tight text-white text-lg sm:text-xl md:text-2xl">
              Chaleur Humaine
            </h2>
            <p className="text-emerald-100 font-semibold mt-1 text-xs sm:text-sm leading-snug line-clamp-2">
              Café, belote, balade, papote : partagez un moment en 1 clic !
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-400/50 flex items-center justify-between font-black text-xs sm:text-sm text-white">
            <span>Organiser un moment</span>
            <span className="text-base sm:text-lg">➔</span>
          </div>
        </div>
      </div>

      {/* Live Help & Arrival Tracking for Senior */}
      {activeRequests.length > 0 && onConfirmResolvedRequest && (
        <SeniorHelpTrackingSection
          requests={activeRequests}
          textSize={textSize}
          themeConfig={themeConfig}
          onConfirmResolved={onConfirmResolvedRequest}
          onSimulateNeighborArrival={onSimulateNeighborArrival}
        />
      )}

      {/* Friendly Weather & Welcome Bar */}
      <div className={`rounded-3xl p-4 sm:p-5 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full ${
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
        <div className="w-full flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-extrabold text-orange-700 bg-orange-100/80 px-3 py-1 rounded-full w-fit max-w-full mb-1.5">
            <Sun className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
            <span className="break-words">Météo à {currentCity.name} : Soleil · 22°C</span>
          </div>
          <h1 className={`font-black tracking-tight break-words ${titleScaleClass} ${
            isGold ? 'text-gold-gradient' : ''
          }`}>
            Bonjour <span className={isGold ? 'text-amber-500' : 'text-orange-600'}>Jean</span> 👋
          </h1>
          <p className={`font-semibold mt-0.5 break-words ${bodyScaleClass} ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Quartier Le Couchant · 12 jeunes et aînés bienveillants sont connectés près de chez vous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => speakText(`Bonjour Jean. Bienvenue à La Grande-Motte. Vos trois options d'urgence, de coup de main et de chaleur humaine sont prêtes en haut de l'écran.`)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black text-sm sm:text-base cursor-pointer transition shadow-xs border-2 ${
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
              className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black text-sm sm:text-base cursor-pointer transition shadow-xs border-2 active:scale-95 ${
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

      {/* L'Ami Bienveillant ProxiLien Banner (Assistant Souverain) */}
      {onOpenAIAssistant && (
        <div 
          onClick={onOpenAIAssistant}
          className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md ${
            themeConfig.themeId === 'gold-white'
              ? 'bg-amber-50/80 border-amber-300 shadow-gold'
              : themeConfig.themeId === 'gold-dark'
              ? 'bg-stone-900 border-amber-500 shadow-gold text-white'
              : isDark
              ? 'bg-slate-900 border-slate-700 text-white'
              : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-orange-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-md flex-shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">
                  L'Ami Bienveillant ProxiLien
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  Moteur Souverain ALPHABETTE
                </span>
              </div>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} text-xs sm:text-sm mt-0.5`}>
                Besoin d'aide pour rédiger une demande de voisin, trouver une sortie ou discuter en toute confiance ?
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <span>Demander conseil</span>
            <span>→</span>
          </button>
        </div>
      )}



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
            className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-7 py-4 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 text-lg sm:text-xl cursor-pointer transition active:scale-95 border-2 border-amber-200"
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
                    ? 'bg-slate-800 border-slate-700 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl p-2 rounded-2xl shadow-xs ${
                        isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white'
                      }`}>
                        {evt.icon}
                      </span>
                      <div>
                        <span className={`text-sm font-black uppercase px-3 py-1 rounded-full ${
                          isDark 
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-700/60' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {evt.categoryLabel}
                        </span>
                        <h4 className={`font-black text-xl sm:text-2xl mt-1.5 leading-snug ${
                          isGold ? 'text-gold-gradient' : (isDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {evt.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 my-2.5 text-xs sm:text-sm font-bold">
                    <div className={`flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{evt.date}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <div className={`flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      <Clock className="w-4 h-4" />
                      <span>{evt.time}</span>
                    </div>
                    <div className={`flex items-center gap-1 w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} mt-0.5`}>
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="break-words line-clamp-1">{evt.location} ({evt.quartier})</span>
                    </div>
                  </div>

                  <p className={`font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'} ${bodyScaleClass}`}>
                    {evt.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className={`text-sm sm:text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    👥 {evt.attendees.length} voisin{evt.attendees.length > 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => onJoinEvent(evt.id)}
                    disabled={isAttending}
                    className={`font-black text-base sm:text-lg px-5 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 ${
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
              <h3 className={`font-black text-lg sm:text-xl ${isGold ? 'text-gold-gradient' : ''}`}>
                Mes Voisins de Confiance ({currentCity.name})
              </h3>
              <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                Bénévoles certifiés disponibles par téléphone ou visite.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {EMERGENCY_CONTACTS.slice(3, 6).map((contact) => (
            <div 
              key={contact.id} 
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition ${
                isGold 
                  ? 'bg-amber-50/50 border-amber-300' 
                  : isDark 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-slate-50 border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`text-3xl p-2 rounded-xl shadow-2xs flex-shrink-0 ${
                  isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white'
                }`}>{contact.avatar}</span>
                <div className="min-w-0 flex-1">
                  <h4 className={`font-black text-base sm:text-lg break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {contact.name}
                  </h4>
                  <p className={`text-sm font-bold break-words ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{contact.role}</p>
                  {contact.distance && (
                    <span className={`inline-block text-xs sm:text-sm font-black px-2 py-0.5 rounded-md ${
                      isDark ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700/50' : 'text-emerald-800 bg-emerald-100'
                    }`}>
                      📍 {contact.distance}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => speakText(`Contact : ${contact.name}, ${contact.role}. Numéro : ${contact.phone}`)}
                  className={`p-2 rounded-xl transition ${
                    isDark 
                      ? 'text-slate-300 hover:text-orange-400 hover:bg-slate-700' 
                      : 'text-slate-600 hover:text-orange-600 hover:bg-white'
                  }`}
                  title="Écouter le contact"
                >
                  <Volume2 className="w-5 h-5 text-orange-500" />
                </button>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-sm sm:text-base flex items-center gap-1.5 shadow-2xs"
                  title={`Appeler ${contact.name}`}
                >
                  <Phone className="w-4 h-4" />
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
