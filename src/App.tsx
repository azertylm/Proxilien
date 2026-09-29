import React, { useState } from 'react';
import { UserMode, TextSize, CityInfo, HelpRequest, Initiative, ThemeConfig, CommunityEvent, ToolLoan, HelpRequestStatus, CitizenAlert } from './types';
import { CITIES_DATA } from './data/cities';
import { INITIAL_HELP_REQUESTS, INITIAL_COMMUNITY_EVENTS, INITIAL_TOOL_LOANS } from './data/mockData';
import { INITIAL_CITIZEN_ALERTS } from './data/mockAlerts';
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
import { P2PSyncModal } from './components/p2p/P2PSyncModal';
import { FullscreenBanner } from './components/FullscreenBanner';
import { useFullscreen } from './hooks/useFullscreen';
import { 
  getStoredLGMGeoStatus, 
  verifyRealLGMGeolocation, 
  simulateLGMGeolocation, 
  LGMGeoResult 
} from './services/geolocationService';
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
  Heart,
  Radio,
  Lock,
  MapPin,
  ExternalLink,
  Compass
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
  const [isP2PSyncOpen, setIsP2PSyncOpen] = useState(false);

  // Active requests, community events, tool loans, and encrypted citizen alerts
  const [activeRequests, setActiveRequests] = useState<HelpRequest[]>(INITIAL_HELP_REQUESTS);
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>(INITIAL_COMMUNITY_EVENTS);
  const [toolLoans, setToolLoans] = useState<ToolLoan[]>(INITIAL_TOOL_LOANS);
  const [citizenAlerts, setCitizenAlerts] = useState<CitizenAlert[]>(INITIAL_CITIZEN_ALERTS);

  // La Grande-Motte Mandatory Geolocation Status for 1-Year 100% Free Pass
  const [lgmGeoStatus, setLgmGeoStatus] = useState<LGMGeoResult>(getStoredLGMGeoStatus());
  const [isGeoLocating, setIsGeoLocating] = useState<boolean>(false);

  const handleVerifyGPS = async () => {
    setIsGeoLocating(true);
    try {
      const res = await verifyRealLGMGeolocation();
      setLgmGeoStatus(res);
    } finally {
      setIsGeoLocating(false);
    }
  };

  const handleSimulateLGM = (quartier = 'Le Couchant') => {
    const res = simulateLGMGeolocation(quartier, false);
    setLgmGeoStatus(res);
  };

  // Merge P2P civic data without server
  const handleMergeCivicData = (data: {
    helpRequests?: HelpRequest[];
    toolLoans?: ToolLoan[];
    communityEvents?: CommunityEvent[];
    citizenAlerts?: CitizenAlert[];
  }) => {
    let count = 0;
    if (data.helpRequests && data.helpRequests.length > 0) {
      setActiveRequests(prev => {
        const existing = new Set(prev.map(r => r.id));
        const toAdd = data.helpRequests!.filter(r => !existing.has(r.id));
        count += toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (data.toolLoans && data.toolLoans.length > 0) {
      setToolLoans(prev => {
        const existing = new Set(prev.map(l => l.id));
        const toAdd = data.toolLoans!.filter(l => !existing.has(l.id));
        count += toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (data.communityEvents && data.communityEvents.length > 0) {
      setCommunityEvents(prev => {
        const existing = new Set(prev.map(e => e.id));
        const toAdd = data.communityEvents!.filter(e => !existing.has(e.id));
        count += toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (data.citizenAlerts && data.citizenAlerts.length > 0) {
      setCitizenAlerts(prev => {
        const existing = new Set(prev.map(a => a.id));
        const toAdd = data.citizenAlerts!.filter(a => !existing.has(a.id));
        count += toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    showToast(
      "Synchronisation P2P réussie ! 🟢",
      `${count} fiches civiques et alertes chiffrées intégrées en direct hors-serveur.`
    );
  };

  const handleBroadcastNewAlert = (newAlert: CitizenAlert) => {
    setCitizenAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
    showToast(
      "Alerte Citoyenne chiffrée ! 🚨",
      `"${newAlert.title}" est diffusée sur le réseau local P2P.`,
      'alert'
    );
  };

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

  const isAnyModalOpen = isHelpRequestOpen || isSOSOpen || isCitySelectorOpen || isOrganizeModalOpen || isNewToolLoanOpen || Boolean(selectedLoanForReceipt) || isThemeCustomizerOpen || isSovereignModalOpen || isSubscriptionModalOpen || isAIAssistantOpen || isP2PSyncOpen;

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
        onOpenP2PSync={() => setIsP2PSyncOpen(true)}
        isLGMVerified={lgmGeoStatus.verified && lgmGeoStatus.isLGM}
        onVerifyGeolocation={() => setIsSubscriptionModalOpen(true)}
      />

      {/* LA GRANDE-MOTTE 1ère ANNÉE GRATUITE — GÉOLOCALISATION OBLIGATOIRE BANNER */}
      {currentCity.name === 'La Grande-Motte' && (
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 pt-2 pb-0">
          {!lgmGeoStatus.verified ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-950 text-white border-2 border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-xl bg-amber-400 text-stone-950 font-black flex-shrink-0 animate-bounce shadow-md">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wide shadow-xs">
                      Offre Municipale Pilote · 1ère Année 100 % Gratuite
                    </span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-red-600 text-white shadow-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Géolocalisation Obligatoire
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-100 mt-1 font-semibold leading-relaxed">
                    Pour tous les habitants, aînés, commerces et associations de <strong className="text-amber-300 font-black underline decoration-amber-400 underline-offset-2">La Grande-Motte</strong> : validez votre géolocalisation pour activer votre <span className="text-emerald-300 font-extrabold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50">Pass 1ère année 100 % gratuite</span> (valeur 59 € offerte par ALPHABETTE SASU et la Ville).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleVerifyGPS}
                  disabled={isGeoLocating}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isGeoLocating ? 'Géolocalisation...' : 'Valider ma position GPS'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateLGM('Le Couchant')}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/50 font-black rounded-xl text-xs transition cursor-pointer"
                  title="Simuler présence à La Grande-Motte pour test"
                >
                  Simuler LGM
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  Détails
                </button>
              </div>
            </div>
          ) : lgmGeoStatus.isLGM ? (
            <div className="p-3.5 rounded-2xl bg-stone-950 border-2 border-emerald-400 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500 text-stone-950 font-black flex-shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-stone-950 font-black text-xs uppercase tracking-wide shadow-xs">
                      Pass Citoyen La Grande-Motte Actif
                    </span>
                    <span className="text-xs font-black text-emerald-300">
                      Quartier {lgmGeoStatus.quartier || 'Centre-Ville'} validé par géolocalisation
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-200 mt-1 font-semibold">
                    1ère année 100 % offerte par ALPHABETTE SASU & la Ville (0 € au lieu de 59 €/an).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-md cursor-pointer self-end sm:self-auto transition"
              >
                Voir les détails du Pass
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-stone-950 border-2 border-amber-400 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-black flex-shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wide">
                    Position Hors Périmètre Communal
                  </span>
                  <p className="text-xs sm:text-sm text-stone-200 mt-1 font-semibold">
                    Position détectée à {lgmGeoStatus.distanceKm} km du centre de La Grande-Motte. Vous bénéficiez de 7 jours d'essai gratuit puis des formules BYOK (39€) ou Confort (59€).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md cursor-pointer self-end sm:self-auto flex-shrink-0 transition"
              >
                Voir les tarifs
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Encrypted Citizen Alerts Banner */}
      {citizenAlerts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 pt-2 pb-0">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-stone-900 to-amber-950/70 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-red-600 text-white animate-pulse flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/40">
                    Alerte Citoyenne Chiffrée
                  </span>
                  <span className="text-xs font-black text-white truncate">
                    {citizenAlerts[0].title}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 truncate hidden sm:block">
                  {citizenAlerts[0].message} · {citizenAlerts[0].quartier}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setIsP2PSyncOpen(true)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Synchro P2P / Alertes ({citizenAlerts.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        onOpenPricing={() => setIsSubscriptionModalOpen(true)}
      />

      <AlphabetteSubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        themeConfig={themeConfig}
        onOpenSovereignStatus={() => {
          setIsSubscriptionModalOpen(false);
          setIsSovereignModalOpen(true);
        }}
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

      <P2PSyncModal
        isOpen={isP2PSyncOpen}
        onClose={() => setIsP2PSyncOpen(false)}
        themeConfig={themeConfig}
        cityName={currentCity.name}
        userMode={userMode}
        helpRequests={activeRequests}
        toolLoans={toolLoans}
        communityEvents={communityEvents}
        citizenAlerts={citizenAlerts}
        onMergeCivicData={handleMergeCivicData}
        onBroadcastNewAlert={handleBroadcastNewAlert}
      />

      {/* Bottom Footer with Municipal, Sovereign & Ethical ALPHABETTE Partnerships */}
      <footer className={`border-t mt-4 py-4 px-3 text-center transition-colors w-full max-w-full overflow-hidden ${
        themeConfig.themeId === 'gold-white'
          ? 'bg-white/95 border-amber-300 text-stone-700'
          : themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark'
          ? 'bg-slate-900 border-slate-800 text-slate-400'
          : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto space-y-3 text-xs">
          {/* LIEN PIED DE PAGE OBLIGATOIRE VERS LE HUB CENTRAL ALPHABETTE */}
          <div className="py-2 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xs">
            <a
              href="http://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-xs sm:text-sm text-orange-600 dark:text-amber-400 hover:underline inline-flex items-center justify-center gap-1.5 transition"
            >
              <span>Découvrir toutes les applications de la suite sur http://alphabette.fr</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
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
                id="btn-footer-lgm-geo"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className={`cursor-pointer inline-flex items-center gap-1 font-black px-2 py-0.5 rounded shadow-2xs transition ${
                  lgmGeoStatus.verified && lgmGeoStatus.isLGM
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-stone-900 text-amber-300 border border-amber-400 hover:bg-stone-800'
                }`}
                title="1ère année 100% offerte pour les habitants de La Grande-Motte (géolocalisation obligatoire)"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{lgmGeoStatus.verified && lgmGeoStatus.isLGM ? 'Pass 1 an LGM Validé' : 'Pass 1 an LGM Gratuit'}</span>
              </button>
              <span>·</span>
              <button
                id="btn-footer-p2p-sync"
                onClick={() => setIsP2PSyncOpen(true)}
                className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1 font-black"
                title="Synchronisation P2P Décentralisée sans serveur (WebRTC / Wi-Fi local)"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                <span>Synchro P2P</span>
              </button>
              <span>·</span>
              <button
                id="btn-footer-sovereign-status"
                onClick={() => setIsSovereignModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer inline-flex items-center gap-1 font-extrabold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mistral AI Souverain</span>
              </button>
              <span>·</span>
              <button
                id="btn-footer-alphabette-pricing"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="text-orange-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1 font-extrabold"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Grille Tarifaire (39€ / 59€ · Bouquet 99€/199€)</span>
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

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Édité par <strong>ALPHABETTE SASU</strong> (fondée par Valentin RICHAUD) · Zéro pistage publicitaire, conformité RGPD stricte.
            </span>
            <span>
              Hébergement souverain OVH France · Moteur Mistral AI Europe · <span className="font-mono">alphabette.fr</span>
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
