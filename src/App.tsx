import React, { useState } from 'react';
import { UserMode, TextSize, CityInfo, HelpRequest, Initiative, ThemeConfig, CommunityEvent, ToolLoan, HelpRequestStatus } from './types';
import { CITIES_DATA } from './data/cities';
import { INITIAL_HELP_REQUESTS, INITIAL_COMMUNITY_EVENTS, INITIAL_TOOL_LOANS } from './data/mockData';
import { Header } from './components/Header';
import { SeniorHomeView } from './components/SeniorHomeView';
import { Village50View } from './components/Village50View';
import { YouthDashboardView } from './components/YouthDashboardView';
import { TVModeView } from './components/TVModeView';
import { SOSModal } from './components/SOSModal';
import { VideoAudioRequestModal } from './components/VideoAudioRequestModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { OrganizeEventModal } from './components/OrganizeEventModal';
import { CommunityEventsSection } from './components/CommunityEventsSection';
import { NewToolLoanModal } from './components/NewToolLoanModal';
import { ToolReceiptModal } from './components/ToolReceiptModal';
import { SovereignStatusModal } from './components/SovereignStatusModal';
import { AlphabetteSubscriptionModal } from './components/AlphabetteSubscriptionModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { FullscreenBanner } from './components/FullscreenBanner';
import { useFullscreen } from './hooks/useFullscreen';
import { 
  Home, 
  Sparkles, 
  AlertTriangle, 
  Calendar,
  CheckCircle2, 
  Palette,
  Crown,
  ShieldCheck,
  Building2,
  Bot,
  Mic,
  Heart
} from 'lucide-react';

export default function App() {
  const [cities, setCities] = useState<CityInfo[]>(CITIES_DATA);
  const [currentCity, setCurrentCity] = useState<CityInfo>(CITIES_DATA[0]); // La Grande-Motte
  const [userMode, setUserMode] = useState<UserMode>('senior');
  const [activeTab, setActiveTab] = useState<'accueil' | 'evenements' | 'village'>('accueil');
  const [selectedVillageCategory, setSelectedVillageCategory] = useState<string | undefined>(undefined);

  // Fullscreen controller (native and immersive fallback)
  const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreen();

  // Theme & Readability Customization (Supports requested "belles lettres en or sur fond blanc")
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    themeId: 'gold-white', // Belles lettres en or sur fond blanc signature
    fontFamily: 'lexend',   // Confort maximal pour la vue des aînés
    textSize: 'xlarge',    // Écrit en très grand par défaut (Haute lisibilité aînés)
  });

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isHelpRequestOpen, setIsHelpRequestOpen] = useState(false);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isNewToolLoanOpen, setIsNewToolLoanOpen] = useState(false);
  const [selectedLoanForReceipt, setSelectedLoanForReceipt] = useState<ToolLoan | null>(null);
  const [isSovereignModalOpen, setIsSovereignModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Active requests, community events, and tool loans
  const [activeRequests, setActiveRequests] = useState<HelpRequest[]>(INITIAL_HELP_REQUESTS);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>(INITIAL_COMMUNITY_EVENTS);
  const [toolLoans, setToolLoans] = useState<ToolLoan[]>(INITIAL_TOOL_LOANS);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'alert' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleHelpRequestSubmitted = (title: string, description: string, category: string) => {
    const newReq: HelpRequest = {
      id: `req-${Date.now()}`,
      seniorName: 'Jean P.',
      age: 81,
      quartier: 'Le Couchant',
      timeAgo: 'À l\'instant',
      title,
      description,
      urgency: 'urgent',
      category: category as any,
      status: 'en_attente',
    };
    setActiveRequests([newReq, ...activeRequests]);
    showToast(
      "Demande d'aide transmise !",
      `Votre message a été diffusé aux voisins veilleurs de ${currentCity.name}.`
    );
  };

  const handleTakeHelpRequest = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(r => r.id === reqId ? { 
        ...r, 
        status: 'pris_en_charge', 
        helperName: 'Lucas Valentin (Vous)',
        helperRole: 'Bénévole certifié (21 ans)',
        helperAvatar: '🧑‍🎓',
        helperPhone: '06 12 34 56 78',
        estimatedArrivalTime: 'Dans 20 minutes',
        arrivalTransport: 'À pied (5 min)',
        arrivalNote: "J'arrive pour vous aider !"
      } : r)
    );
    showToast(
      "Mission bénévole acceptée ! 🎉",
      "L'aîné a été notifié de votre arrivée prochaine. +50 points d'engagement ajoutés."
    );
  };

  const handleTakeHelpRequestWithArrival = (
    reqId: string,
    arrivalData: { estimatedTime: string; transport: string; arrivalNote: string; helperPhone: string }
  ) => {
    setActiveRequests(prev =>
      prev.map(r => r.id === reqId ? {
        ...r,
        status: 'pris_en_charge',
        helperName: 'Lucas Valentin (Vous)',
        helperRole: 'Bénévole certifié (21 ans)',
        helperAvatar: '🧑‍🎓',
        helperPhone: arrivalData.helperPhone || '06 12 34 56 78',
        estimatedArrivalTime: arrivalData.estimatedTime,
        arrivalTransport: arrivalData.transport,
        arrivalNote: arrivalData.arrivalNote,
        acceptedAt: 'À l\'instant',
        isDelayNotified: false
      } : r)
    );
    showToast(
      "Heure d'arrivée transmise à l'aîné ! ⏰",
      `Arrivée prévue : ${arrivalData.estimatedTime}. Trajet : ${arrivalData.transport}.`
    );
  };

  const handleUpdateHelpRequestStatus = (reqId: string, newStatus: HelpRequestStatus) => {
    setActiveRequests(prev =>
      prev.map(r => {
        if (r.id !== reqId) return r;
        if (newStatus === 'en_route') {
          return { ...r, status: 'en_route', enRouteAt: 'À l\'instant' };
        }
        if (newStatus === 'arrive') {
          return { ...r, status: 'arrive', arrivedAt: 'À l\'instant' };
        }
        if (newStatus === 'resolu') {
          return { ...r, status: 'resolu' };
        }
        return { ...r, status: newStatus };
      })
    );

    if (newStatus === 'en_route') {
      showToast("Statut : En route ! 🚗", "L'aîné voit désormais que vous êtes en chemin.");
    } else if (newStatus === 'arrive') {
      showToast("Statut : Arrivé à la porte ! 🔔", "L'aîné sait que vous êtes devant sa porte.");
    } else if (newStatus === 'resolu') {
      showToast("Coup de main validé ! 🎉", "Merci pour ce geste solidaire ! +50 XP ajoutés.");
    }
  };

  const handleAddDelayToHelpRequest = (reqId: string) => {
    setActiveRequests(prev =>
      prev.map(r => {
        if (r.id !== reqId) return r;
        const currentEst = r.estimatedArrivalTime || '';
        return {
          ...r,
          isDelayNotified: true,
          estimatedArrivalTime: `${currentEst} (+10 min de retard)`,
        };
      })
    );
    showToast(
      "Retard de 10 min signalé ⏳",
      "L'aîné a été rassuré sur votre arrivée légèrement décalée."
    );
  };

  const handleSimulateNeighborArrival = (reqId: string) => {
    handleTakeHelpRequestWithArrival(reqId, {
      estimatedTime: 'Dans 20 minutes (14h30)',
      transport: 'À vélo (5 min)',
      arrivalNote: "Bonjour ! J'ai vu votre demande et je passe vous donner un coup de main avec grand plaisir.",
      helperPhone: '06 12 34 56 78',
    });
  };

  const handleInitiativeAction = (initiative: Initiative, actionText: string) => {
    showToast(initiative.title, actionText);
  };

  const handleAddNewCity = (newCity: CityInfo) => {
    setCities(prev => [...prev, newCity]);
    showToast(
      `Ville ajoutée : ${newCity.name}`,
      "ProxiLien est prêt à accueillir les aînés et jeunes de cette commune !"
    );
  };

  const handleEventCreated = (newEvent: CommunityEvent) => {
    setCommunityEvents(prev => [newEvent, ...prev]);
    setIsOrganizeModalOpen(false);
    setActiveTab('accueil');
    showToast(
      "Rencontre publiée ! 🎉",
      `"${newEvent.title}" est bien publiée ! Vous êtes de retour sur l'accueil.`
    );
  };

  const handleJoinEvent = (eventId: string) => {
    setCommunityEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          if (e.attendees.includes('Vous')) return e;
          return { ...e, attendees: [...e.attendees, 'Vous'] };
        }
        return e;
      })
    );
    showToast(
      "Participation confirmée ! ☕",
      "Vos voisins ont hâte de vous retrouver. Votre présence a bien été enregistrée."
    );
  };

  const handleLoanCreated = (newLoan: ToolLoan) => {
    setToolLoans(prev => [newLoan, ...prev]);
    setSelectedLoanForReceipt(newLoan);
    showToast(
      "Prêt d'outil enregistré ! 🤝",
      `Le reçu ${newLoan.receiptCode} est archivé et un SMS de confirmation a été transmis.`
    );
  };

  const handleMarkToolAsReturned = (loanId: string) => {
    setToolLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              status: 'rendu',
              actualReturnDate: `Aujourd'hui à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
            }
          : l
      )
    );
    showToast(
      "Matériel restitué avec succès ! ✅",
      "L'outil est noté comme rendu en bon état. La trace reste disponible dans votre historique."
    );
  };

  const handleSendLoanReminder = (loanId: string) => {
    showToast(
      "Rappel bienveillant envoyé 📲",
      "Un SMS courtois a été adressé au jeune voisin avec les détails et la date convenue."
    );
  };

  const handleQuickToggleTheme = () => {
    if (themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark') {
      setThemeConfig(prev => ({ ...prev, themeId: 'gold-white' }));
      showToast("Style Or & Nacre activé", "Belles lettres dorées sur fond blanc.");
    } else {
      setThemeConfig(prev => ({ ...prev, themeId: 'dark' }));
      showToast("Mode Sombre activé", "Idéal pour reposer la vue en soirée.");
    }
  };

  const handleUpdateTextSize = (newSize: TextSize) => {
    setThemeConfig(prev => ({ ...prev, textSize: newSize }));
  };

  // Resolve font class
  const fontClass = 
    themeConfig.fontFamily === 'playfair' ? 'font-playfair' :
    themeConfig.fontFamily === 'cinzel' ? 'font-cinzel' :
    themeConfig.fontFamily === 'lexend' ? 'font-lexend' :
    themeConfig.fontFamily === 'outfit' ? 'font-outfit' :
    themeConfig.fontFamily === 'caveat' ? 'font-caveat' : 'font-jakarta';

  // Resolve root background & text color
  const rootBgClass =
    themeConfig.themeId === 'gold-white'
      ? 'bg-[#FAF8F5] text-stone-900'
      : themeConfig.themeId === 'gold-dark'
      ? 'bg-[#0F0E0C] text-amber-100'
      : themeConfig.themeId === 'dark'
      ? 'bg-slate-950 text-slate-100'
      : themeConfig.themeId === 'high-contrast'
      ? 'bg-black text-yellow-300'
      : themeConfig.themeId === 'mediterranean'
      ? 'bg-sky-50/70 text-slate-900'
      : 'bg-slate-100/90 text-slate-900';

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';

  // Text size scaling (Supports 4 levels: normal, large, xlarge, giant)
  const textScaleWrapper =
    themeConfig.textSize === 'giant' ? 'text-xl sm:text-2xl' :
    themeConfig.textSize === 'xlarge' ? 'text-lg sm:text-xl' : 
    themeConfig.textSize === 'large' ? 'text-base sm:text-lg' :
    'text-sm sm:text-base';

  const isAnyModalOpen = isHelpRequestOpen || isSOSOpen || isCitySelectorOpen || isOrganizeModalOpen || isNewToolLoanOpen || Boolean(selectedLoanForReceipt) || isThemeCustomizerOpen || isSovereignModalOpen || isSubscriptionModalOpen || isAIAssistantOpen;

  // If in TV Mode, render Google TV view
  if (userMode === 'tv') {
    return (
      <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 font-['Outfit'] ${textScaleWrapper} ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
        <TVModeView
          currentCity={currentCity}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenHelpRequest={() => setIsHelpRequestOpen(true)}
          onGoToVillage={() => {
            setUserMode('senior');
            setActiveTab('village');
          }}
          onExitTVMode={() => setUserMode('senior')}
        />

        <FullscreenBanner
          isFullscreen={isFullscreen}
          onExit={exitFullscreen}
          isGold={false}
          isModalOpen={isAnyModalOpen}
        />

        <SOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          cityName={currentCity.name}
        />

        <VideoAudioRequestModal
          isOpen={isHelpRequestOpen}
          onClose={() => setIsHelpRequestOpen(false)}
          cityName={currentCity.name}
          onRequestSubmitted={handleHelpRequestSubmitted}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${rootBgClass} ${fontClass} ${textScaleWrapper} flex flex-col justify-between transition-colors duration-200 ${
      isFullscreen ? 'fixed inset-0 z-40 overflow-y-auto p-0 sm:p-2' : ''
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-white text-base">{toastMessage.title}</h4>
            <p className="text-slate-300 mt-0.5 font-semibold text-xs sm:text-sm">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Header with Theme Customizer & Audio (100% mobile-safe) */}
      <Header
        currentCity={currentCity}
        onOpenCitySelector={() => setIsCitySelectorOpen(true)}
        userMode={userMode}
        onChangeUserMode={setUserMode}
        textSize={themeConfig.textSize}
        onChangeTextSize={handleUpdateTextSize}
        onTriggerSOS={() => setIsSOSOpen(true)}
        activeScreenTitle={activeTab === 'accueil' ? 'Accueil' : activeTab === 'evenements' ? 'Rencontres & Événements' : 'Place du Village'}
        activeScreenDesc={userMode === 'senior' ? 'Espace Aîné simple et lisible' : 'Espace Voisins & Jeunes'}
        themeConfig={themeConfig}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
        onQuickToggleTheme={handleQuickToggleTheme}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenSovereignStatus={() => setIsSovereignModalOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 overflow-x-hidden">
        {/* Navigation Tabs (Responsive grid on mobile, always fits within 100vw) */}
        <div className={`grid grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6 w-full max-w-xl mx-auto p-1 sm:p-1.5 rounded-2xl border-2 shadow-xs transition-all ${
          themeConfig.themeId === 'gold-white'
            ? 'bg-white border-amber-300 shadow-gold'
            : themeConfig.themeId === 'gold-dark'
            ? 'bg-stone-900 border-amber-500 text-white shadow-gold'
            : themeConfig.themeId === 'dark'
            ? 'bg-slate-900 border-slate-700 text-white'
            : themeConfig.themeId === 'high-contrast'
            ? 'bg-black border-2 border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200'
        }`}>
          <button
            id="tab-nav-accueil"
            onClick={() => setActiveTab('accueil')}
            className={`py-2.5 sm:py-3.5 px-1 sm:px-4 rounded-xl font-black text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer min-w-0 w-full overflow-hidden ${
              activeTab === 'accueil'
                ? (themeConfig.themeId === 'gold-white'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'bg-orange-600 text-white shadow-sm')
                : (isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="truncate max-w-full text-center block">Accueil</span>
          </button>

          {userMode === 'senior' ? (
            <button
              id="tab-nav-viens"
              onClick={() => setIsHelpRequestOpen(true)}
              className="py-2.5 sm:py-3.5 px-1 sm:px-3 rounded-xl font-black text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 transition cursor-pointer active:scale-95 min-w-0 w-full overflow-hidden"
              title="Demander de l'aide par dictée vocale ou vidéo"
            >
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 animate-pulse" />
              <span className="truncate max-w-full text-center block">Viens !</span>
            </button>
          ) : (
            <button
              id="tab-nav-village"
              onClick={() => {
                setSelectedVillageCategory(undefined);
                setActiveTab('village');
              }}
              className={`py-2.5 sm:py-3.5 px-1 sm:px-4 rounded-xl font-black text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer min-w-0 w-full overflow-hidden ${
                activeTab === 'village'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : (isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 flex-shrink-0" />
              <span className="truncate max-w-full text-center block">50 Idées</span>
            </button>
          )}

          <button
            id="tab-nav-evenements"
            onClick={() => setActiveTab('evenements')}
            className={`py-2.5 sm:py-3.5 px-1 sm:px-4 rounded-xl font-black text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer min-w-0 w-full overflow-hidden ${
              activeTab === 'evenements'
                ? 'bg-emerald-600 text-white shadow-md'
                : (isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
            title="Chaleur Humaine - Moments, rencontres et lien social"
          >
            {userMode === 'senior' ? (
              <>
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-full text-center font-black">Chaleur Humaine</span>
                <span className="sm:hidden truncate max-w-full text-[11px] leading-tight text-center font-black block">Chaleur</span>
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 flex-shrink-0" />
                <span className="truncate max-w-full text-center block">Moments</span>
              </>
            )}
          </button>

          <button
            id="tab-nav-urgences"
            onClick={() => setIsSOSOpen(true)}
            className="py-2.5 sm:py-3.5 px-1 sm:px-4 rounded-xl font-black text-xs sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-red-700 bg-red-100 hover:bg-red-200 border-2 border-red-300 transition cursor-pointer active:scale-95 min-w-0 w-full overflow-hidden"
            title="Alerte secours et 3 voisins"
          >
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 animate-bounce" />
            <span className="truncate max-w-full font-black text-center block">SOS</span>
          </button>
        </div>

        {/* View Routing */}
        {activeTab === 'accueil' && (
          userMode === 'senior' ? (
            <SeniorHomeView
              currentCity={currentCity}
              textSize={themeConfig.textSize}
              themeConfig={themeConfig}
              events={communityEvents}
              toolLoans={toolLoans}
              activeRequests={activeRequests}
              onConfirmResolvedRequest={(reqId) => handleUpdateHelpRequestStatus(reqId, 'resolu')}
              onSimulateNeighborArrival={handleSimulateNeighborArrival}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onOpenSOS={() => setIsSOSOpen(true)}
              onOpenHelpRequest={() => setIsHelpRequestOpen(true)}
              onOpenOrganizeModal={() => setIsOrganizeModalOpen(true)}
              onJoinEvent={handleJoinEvent}
              onOpenNewLoanModal={() => setIsNewToolLoanOpen(true)}
              onOpenReceipt={(loan) => setSelectedLoanForReceipt(loan)}
              onMarkAsReturned={handleMarkToolAsReturned}
              onSendReminder={handleSendLoanReminder}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onOpenSovereignStatus={() => setIsSovereignModalOpen(true)}
              onGoToVillage={(cat) => {
                setSelectedVillageCategory(cat);
                setActiveTab('village');
              }}
            />
          ) : (
            <YouthDashboardView
              currentCity={currentCity}
              activeRequests={activeRequests}
              toolLoans={toolLoans}
              themeConfig={themeConfig}
              onTakeHelpRequest={handleTakeHelpRequest}
              onTakeHelpRequestWithArrival={handleTakeHelpRequestWithArrival}
              onUpdateStatus={handleUpdateHelpRequestStatus}
              onAddDelay={handleAddDelayToHelpRequest}
              onConfirmResolved={(reqId) => handleUpdateHelpRequestStatus(reqId, 'resolu')}
              onGoToVillage={() => setActiveTab('village')}
              onOpenReceipt={(loan) => setSelectedLoanForReceipt(loan)}
              onMarkAsReturned={handleMarkToolAsReturned}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onOpenSovereignStatus={() => setIsSovereignModalOpen(true)}
            />
          )
        )}

        {activeTab === 'evenements' && (
          <CommunityEventsSection
            events={communityEvents}
            currentCity={currentCity}
            themeConfig={themeConfig}
            onOpenOrganizeModal={() => setIsOrganizeModalOpen(true)}
            onJoinEvent={handleJoinEvent}
            onBackToHome={() => setActiveTab('accueil')}
          />
        )}

        {activeTab === 'village' && (
          <Village50View
            userMode={userMode}
            cityName={currentCity.name}
            initialCategory={selectedVillageCategory}
            themeConfig={themeConfig}
            onInitiativeAction={handleInitiativeAction}
          />
        )}
      </main>

      {/* Modals */}
      <SOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        cityName={currentCity.name}
      />

      <VideoAudioRequestModal
        isOpen={isHelpRequestOpen}
        onClose={() => setIsHelpRequestOpen(false)}
        cityName={currentCity.name}
        onRequestSubmitted={handleHelpRequestSubmitted}
      />

      <CitySelectorModal
        isOpen={isCitySelectorOpen}
        onClose={() => setIsCitySelectorOpen(false)}
        cities={cities}
        currentCity={currentCity}
        onSelectCity={setCurrentCity}
        onAddNewCity={handleAddNewCity}
      />

      <ThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        config={themeConfig}
        onUpdateConfig={setThemeConfig}
      />

      <OrganizeEventModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        currentCity={currentCity}
        onEventCreated={handleEventCreated}
      />

      <NewToolLoanModal
        isOpen={isNewToolLoanOpen}
        onClose={() => setIsNewToolLoanOpen(false)}
        currentCity={currentCity}
        onLoanCreated={handleLoanCreated}
      />

      <ToolReceiptModal
        isOpen={Boolean(selectedLoanForReceipt)}
        loan={selectedLoanForReceipt}
        onClose={() => setSelectedLoanForReceipt(null)}
        onMarkAsReturned={handleMarkToolAsReturned}
        onSendReminder={handleSendLoanReminder}
      />

      <SovereignStatusModal
        isOpen={isSovereignModalOpen}
        onClose={() => setIsSovereignModalOpen(false)}
        themeConfig={themeConfig}
      />

      <AlphabetteSubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        themeConfig={themeConfig}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        themeConfig={themeConfig}
        currentCity={currentCity}
        userMode={userMode}
        onOpenSovereignStatus={() => {
          setIsAIAssistantOpen(false);
          setIsSovereignModalOpen(true);
        }}
      />

      {/* Bottom Footer with Municipal, Sovereign & Ethical ALPHABETTE Partnerships */}
      <footer className={`border-t mt-3 py-3 px-3 text-center transition-colors w-full max-w-full overflow-hidden ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white/95 border-amber-300 text-stone-700'
          : themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark'
          ? 'bg-slate-900 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="font-extrabold text-stone-800 dark:text-stone-200">
                ProxiLien · {currentCity.name}
              </span>
              <span className="hidden sm:inline text-stone-400">|</span>
              <span className="hidden sm:inline font-medium">Solidaire & Intergénérationnel</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-[11px] sm:text-xs">
              <button
                id="btn-footer-sovereign-status"
                onClick={() => setIsSovereignModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1 font-extrabold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Moteur Souverain</span>
              </button>
              <span>·</span>
              <button
                id="btn-footer-alphabette-pricing"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="text-orange-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1 font-extrabold"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Tarif Éthique (1€/mois · Pack 3€)</span>
              </button>
              <span>·</span>
              <button 
                onClick={() => setIsThemeCustomizerOpen(true)}
                className="text-amber-600 hover:underline cursor-pointer inline-flex items-center gap-1 font-black"
              >
                <Palette className="w-3 h-3" />
                <span>Personnaliser</span>
              </button>
              <span>·</span>
              <button 
                onClick={() => setIsCitySelectorOpen(true)}
                className="text-orange-600 hover:underline cursor-pointer"
              >
                Changer de ville
              </button>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Édité par <strong>ALPHABETTE</strong> (fondée par Valentin RICHAUD) · Zéro pistage publicitaire, respect de la vie privée.
            </span>
            <span>
              Hébergement web & données sur serveurs souverains OVH (France) · <span className="font-mono">alphabette.fr / alphabette.eu</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Fullscreen Exit HUD */}
      <FullscreenBanner
        isFullscreen={isFullscreen}
        onExit={exitFullscreen}
        isGold={themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark'}
        isModalOpen={isAnyModalOpen}
      />
    </div>
  );
}
