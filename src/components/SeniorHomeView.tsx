import React, { useState } from 'react';
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
  Minimize,
  ShieldCheck
} from 'lucide-react';
import { CityInfo, TextSize, ThemeConfig, CommunityEvent, ToolLoan, HelpRequest, DeviceMode } from '../types';
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
  deviceMode?: DeviceMode;
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
  deviceMode = 'auto',
}) => {
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';

  const [contactCategoryFilter, setContactCategoryFilter] = useState<'all' | 'voisins' | 'services'>('all');

  const trustedContacts = [
    {
      id: 'ccas-lgm',
      name: 'CCAS La Grande-Motte',
      category: 'services' as const,
      categoryLabel: 'Affaires Sociales & Téléalarme',
      role: 'Accompagnement communal, portage de repas à domicile & veille canicule/grand froid',
      phone: '04 67 29 03 03',
      distance: 'Centre-ville (Hôtel de Ville)',
      avatar: '🏛️',
    },
    {
      id: 'police-mun',
      name: 'Police Municipale La Grande-Motte',
      category: 'services' as const,
      categoryLabel: 'Sécurité & Opération Tranquillité',
      role: 'Patrouilles de proximité, îlotage bienveillant & sécurisation des résidences',
      phone: '04 67 12 84 50',
      distance: 'Port de Plaisance',
      avatar: '👮',
    },
    {
      id: 'voisin-lucas',
      name: 'Lucas V. (Veilleur Certifié ProxiLien)',
      category: 'voisins' as const,
      categoryLabel: 'Voisin Bienveillant · PSC1',
      role: 'Visite de courtoisie, aide smartphone/TV, changement d\'ampoule & vigilance douce',
      phone: '06 12 34 56 78',
      distance: '180 m (Le Couchant)',
      avatar: '🧑',
    },
    {
      id: 'voisine-marie',
      name: 'Marie D. (Infirmière libérale retraitée)',
      category: 'voisins' as const,
      categoryLabel: 'Voisine Référente Santé & Écoute',
      role: 'Conseils bien-être, repérage de fatigue, écoute amicale & premiers gestes',
      phone: '06 98 76 54 32',
      distance: '90 m (Point Zéro)',
      avatar: '👩‍⚕️',
    },
  ];

  const filteredLocalContacts = contactCategoryFilter === 'all'
    ? trustedContacts
    : trustedContacts.filter(c => c.category === contactCategoryFilter);

  const primaryActionsGridClass =
    deviceMode === 'mobile' ? 'grid grid-cols-1 gap-3 w-full' :
    deviceMode === 'tablet' ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 w-full' :
    deviceMode === 'pc' ? 'grid grid-cols-3 gap-3 w-full' :
    'grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full';

  const titleScaleClass =
    textSize === 'giant' ? 'text-2xl sm:text-3xl' :
    textSize === 'xlarge' ? 'text-xl sm:text-2xl' : 
    textSize === 'large' ? 'text-lg sm:text-xl' :
    'text-base sm:text-lg';

  const cardTitleClass =
    textSize === 'giant' ? 'text-xl sm:text-2xl' :
    textSize === 'xlarge' ? 'text-lg sm:text-xl' : 
    textSize === 'large' ? 'text-base sm:text-lg' :
    'text-sm sm:text-base';

  const bodyScaleClass =
    textSize === 'giant' ? 'text-base sm:text-lg' :
    textSize === 'xlarge' ? 'text-sm sm:text-base' : 
    textSize === 'large' ? 'text-xs sm:text-sm' :
    'text-xs sm:text-sm';

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full max-w-6xl mx-auto pb-12">
      {/* 1. LES 3 ACTIONS ESSENTIELLES (RESPONSIVE SMARTPHONE / TABLETTE / PC) */}
      <div id="senior-primary-actions" className={primaryActionsGridClass}>
        {/* 1. SOS URGENCE */}
        <div 
          id="senior-card-sos"
          onClick={onOpenSOS}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenSOS()}
          className="bg-gradient-to-br from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-md shadow-red-600/20 border-2 border-red-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-red-950/80 text-red-100 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                🚨 Secours Immédiats
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center text-base sm:text-lg shadow-inner group-hover:scale-110 transition flex-shrink-0">
                🚨
              </span>
            </div>
            <h2 className="font-black font-['Outfit'] leading-tight text-white text-base sm:text-lg">
              SOS URGENCE
            </h2>
            <p className="text-red-100 font-semibold mt-0.5 text-xs leading-snug line-clamp-2">
              Alerte en 1 clic vos 3 voisins certifiés & le SAMU (15).
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-red-400/50 flex items-center justify-between font-black text-xs text-white">
            <span>Déclencher l'alerte</span>
            <span className="text-sm sm:text-base">➔</span>
          </div>
        </div>

        {/* 2. VIENS ! BESOIN D'AIDE (VOCALE & VIDÉO) */}
        <div 
          id="senior-card-viens"
          onClick={onOpenHelpRequest}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenHelpRequest()}
          className={`rounded-2xl p-3.5 sm:p-4 shadow-md border-2 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden ${
            isGold
              ? 'bg-gradient-to-br from-amber-600 to-yellow-600 text-stone-950 border-amber-300 shadow-gold'
              : 'bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 text-white border-amber-300 shadow-orange-600/20'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-black/40 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                🎙️ Dictée vocale ou 📹 Vidéo
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center text-base sm:text-lg shadow-inner group-hover:scale-110 transition flex-shrink-0">
                ⚡
              </span>
            </div>
            <h2 className="font-black leading-tight text-white text-base sm:text-lg">
              Viens m'aider !
            </h2>
            <p className="font-semibold mt-0.5 text-xs leading-snug text-amber-50 line-clamp-2">
              Courses, ampoule, télévision : parlez au micro ou montrez en vidéo.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/30 flex items-center justify-between font-black text-xs text-white">
            <span>Parler ou montrer en vidéo</span>
            <span className="text-sm sm:text-base">➔</span>
          </div>
        </div>

        {/* 3. CHALEUR HUMAINE & LIEN */}
        <div 
          id="senior-card-chaleur-humaine"
          onClick={onOpenOrganizeModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenOrganizeModal()}
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl p-3.5 sm:p-4 shadow-md shadow-emerald-600/20 border-2 border-emerald-300 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 active:scale-98 group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="bg-emerald-950/80 text-emerald-100 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block">
                ☕ Lien & Chaleur humaine
              </span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center text-base sm:text-lg shadow-inner group-hover:scale-110 transition flex-shrink-0">
                ❤️
              </span>
            </div>
            <h2 className="font-black leading-tight text-white text-base sm:text-lg">
              Chaleur Humaine
            </h2>
            <p className="text-emerald-100 font-semibold mt-0.5 text-xs leading-snug line-clamp-2">
              Café, belote, balade, papote : partagez un moment en 1 clic !
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-400/50 flex items-center justify-between font-black text-xs text-white">
            <span>Organiser un moment</span>
            <span className="text-sm sm:text-base">➔</span>
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
            <span>Météo à {currentCity.name} : Soleil · 22°C</span>
          </div>
          <h1 className={`font-black tracking-tight leading-tight ${titleScaleClass} ${
            isGold ? 'text-gold-gradient' : ''
          }`}>
            Bonjour <span className={isGold ? 'text-amber-500' : 'text-orange-600'}>Jean</span> 👋
          </h1>
          <p className={`font-semibold mt-0.5 leading-relaxed ${bodyScaleClass} ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Quartier Le Couchant · 12 jeunes et aînés bienveillants sont connectés près de chez vous.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={() => speakText(`Bonjour Jean. Bienvenue à La Grande-Motte. Vos trois options d'urgence, de coup de main et de chaleur humaine sont prêtes en haut de l'écran.`)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition shadow-xs border ${
              isGold 
                ? 'bg-amber-100/80 border-amber-400 text-amber-950 hover:bg-amber-200' 
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>Écouter</span>
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition shadow-xs border active:scale-95 ${
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
                <Minimize className="w-4 h-4 text-stone-950 flex-shrink-0" />
              ) : (
                <Maximize className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              <span>{isFullscreen ? 'Normal' : 'Plein Écran'}</span>
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
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 transition-all ${
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <h3 className={`font-black ${cardTitleClass} ${isGold ? 'text-gold-gradient' : ''}`}>
                Rencontres & Moments Conviviaux à {currentCity.name}
              </h3>
            </div>
            <p className={`font-medium mt-0.5 ${bodyScaleClass} ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Retrouvez vos voisins pour papoter, jouer ou marcher ensemble au grand air.
            </p>
          </div>

          <button
            onClick={onOpenOrganizeModal}
            className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer transition active:scale-95 border border-amber-200"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Proposer une rencontre</span>
          </button>
        </div>

        {/* List of upcoming events */}
        <div className={deviceMode === 'mobile' ? 'grid grid-cols-1 gap-3' : deviceMode === 'tablet' ? 'grid grid-cols-2 gap-3.5' : deviceMode === 'pc' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {events.slice(0, 4).map((evt) => {
            const isAttending = evt.attendees.includes('Vous (Organisateur)') || evt.attendees.includes('Vous');

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border-2 transition flex flex-col justify-between ${
                  isGold
                    ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-2xl p-1.5 rounded-xl shadow-xs ${
                        isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white'
                      }`}>
                        {evt.icon}
                      </span>
                      <div>
                        <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                          isDark 
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-700/60' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {evt.categoryLabel}
                        </span>
                        <h4 className={`font-black text-base sm:text-lg mt-1 leading-snug ${
                          isGold ? 'text-gold-gradient' : (isDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {evt.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 my-2 text-xs font-bold">
                    <div className={`flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <div className={`flex items-center gap-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                      <Clock className="w-3.5 h-3.5" />
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

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}>
                  <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    👥 {evt.attendees.length} voisin{evt.attendees.length > 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => onJoinEvent(evt.id)}
                    disabled={isAttending}
                    className={`font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      isAttending
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                    }`}
                  >
                    {isAttending ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Inscrit !</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5 fill-current" />
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

      {/* Mes Voisins de Confiance & Services de Proximité */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 transition-all mt-4 ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white border-amber-300 shadow-gold'
          : themeConfig.themeId === 'gold-dark'
          ? 'bg-stone-900 border-amber-500 shadow-gold text-white'
          : themeConfig.themeId === 'dark'
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-amber-100/70 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-800 shadow-xs flex-shrink-0">
              🤝
            </span>
            <div>
              <h3 className={`font-black text-base sm:text-lg ${isGold ? 'text-gold-gradient' : ''}`}>
                Mes Voisins de Confiance & Services ({currentCity.name})
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} font-medium mt-0.5`}>
                Bénévoles certifiés de quartier et services municipaux joignables directement en 1 clic.
              </p>
            </div>
          </div>

          {/* Quick Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setContactCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer ${
                contactCategoryFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tous ({trustedContacts.length})
            </button>
            <button
              type="button"
              onClick={() => setContactCategoryFilter('voisins')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                contactCategoryFilter === 'voisins'
                  ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🧑 Voisins</span>
            </button>
            <button
              type="button"
              onClick={() => setContactCategoryFilter('services')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                contactCategoryFilter === 'services'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🏛️ Ville & CCAS</span>
            </button>
          </div>
        </div>

        {/* Responsive Grid on PC and Mobile */}
        <div className={deviceMode === 'mobile' ? 'grid grid-cols-1 gap-3' : deviceMode === 'tablet' ? 'grid grid-cols-2 gap-3.5' : deviceMode === 'pc' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {filteredLocalContacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`p-3.5 sm:p-4 rounded-xl border-2 flex flex-col justify-between transition-all hover:shadow-md ${
                isGold 
                  ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400' 
                  : isDark 
                  ? 'bg-slate-800/90 border-slate-700 text-white' 
                  : 'bg-white border-slate-200 hover:border-orange-300 shadow-xs'
              }`}
            >
              <div>
                {/* Header: Avatar + Badges + Audio Listen */}
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className={`text-2xl p-2 rounded-xl shadow-xs flex-shrink-0 ${
                      isDark ? 'bg-slate-700 border border-slate-600' : 'bg-amber-100/70 border border-amber-200 text-slate-800'
                    }`}>
                      {contact.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 mb-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          contact.category === 'services'
                            ? (isDark ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60' : 'bg-indigo-100 text-indigo-900 border border-indigo-200')
                            : (isDark ? 'bg-amber-950 text-amber-300 border border-amber-700/60' : 'bg-amber-100 text-amber-900 border border-amber-200')
                        }`}>
                          {contact.categoryLabel}
                        </span>
                        {contact.distance && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            isDark 
                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-700/50' 
                              : 'text-emerald-800 bg-emerald-100 border border-emerald-300/60'
                          }`}>
                            📍 {contact.distance}
                          </span>
                        )}
                      </div>
                      <h4 className={`font-black text-sm sm:text-base leading-snug ${
                        isGold ? 'text-amber-950' : (isDark ? 'text-white' : 'text-slate-900')
                      }`}>
                        {contact.name}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(`Contact : ${contact.name}, ${contact.categoryLabel}. ${contact.role}. Numéro de téléphone direct : ${contact.phone}`)}
                    className={`p-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
                      isDark 
                        ? 'text-slate-400 hover:text-orange-400 hover:bg-slate-700' 
                        : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                    title={`Écouter les coordonnées de ${contact.name}`}
                    aria-label={`Écouter ${contact.name}`}
                  >
                    <Volume2 className="w-4 h-4 text-orange-500" />
                  </button>
                </div>

                {/* Description / Role */}
                <p className={`text-xs font-semibold leading-relaxed mb-3 ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {contact.role}
                </p>
              </div>

              {/* Footer: Phone number and Call button */}
              <div className={`pt-2.5 border-t flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Numéro direct</span>
                  <span className={`font-mono font-black text-xs sm:text-sm tracking-wider ${
                    isDark ? 'text-amber-300' : 'text-slate-900'
                  }`}>
                    {contact.phone}
                  </span>
                </div>

                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-1.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer w-full sm:w-auto"
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
