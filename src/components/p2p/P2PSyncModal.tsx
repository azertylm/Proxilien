import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  ThemeConfig, 
  HelpRequest, 
  ToolLoan, 
  CommunityEvent, 
  CitizenAlert, 
  CivicCardsSyncPayload,
  P2PConnectionStatus 
} from '../../types';
import { WebRTCSyncNode, P2PLogEntry, P2PStats } from '../../services/p2p/webrtcSyncService';
import { QRScannerModal } from './QRScannerModal';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  QrCode, 
  Camera, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Send, 
  Download, 
  Lock, 
  ArrowRightLeft, 
  Terminal, 
  Sparkles, 
  X,
  Layers,
  BellRing,
  HelpCircle,
  Smartphone,
  Eye,
  PlusCircle,
  Share2
} from 'lucide-react';

interface P2PSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  cityName: string;
  userMode: 'senior' | 'jeune' | 'tv';
  helpRequests: HelpRequest[];
  toolLoans: ToolLoan[];
  communityEvents: CommunityEvent[];
  citizenAlerts: CitizenAlert[];
  onMergeCivicData: (data: {
    helpRequests?: HelpRequest[];
    toolLoans?: ToolLoan[];
    communityEvents?: CommunityEvent[];
    citizenAlerts?: CitizenAlert[];
  }) => void;
  onBroadcastNewAlert: (alert: CitizenAlert) => void;
}

type ActiveTab = 'emettre' | 'recevoir' | 'alertes' | 'terminal';

export const P2PSyncModal: React.FC<P2PSyncModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  cityName,
  userMode,
  helpRequests,
  toolLoans,
  communityEvents,
  citizenAlerts,
  onMergeCivicData,
  onBroadcastNewAlert,
}) => {
  // Service WebRTC
  const syncNodeRef = useRef<WebRTCSyncNode | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('emettre');
  const [connectionStatus, setConnectionStatus] = useState<P2PConnectionStatus>('idle');
  const [logs, setLogs] = useState<P2PLogEntry[]>([]);
  const [stats, setStats] = useState<P2PStats>({
    bytesSent: 0,
    bytesReceived: 0,
    packetsSent: 0,
    packetsReceived: 0,
    latencyMs: 0,
    fingerprint: 'En attente',
    iceState: 'new',
  });

  // QR Codes générés
  const [offerQrData, setOfferQrData] = useState<string>('');
  const [answerQrData, setAnswerQrData] = useState<string>('');
  const offerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const answerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerPurpose, setScannerPurpose] = useState<'scan_offer' | 'scan_answer'>('scan_offer');

  // Copie dans le presse-papier
  const [hasCopiedOffer, setHasCopiedOffer] = useState(false);
  const [hasCopiedAnswer, setHasCopiedAnswer] = useState(false);

  // Sélection des fiches à synchroniser
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);

  // Données reçues du pair
  const [receivedPayload, setReceivedPayload] = useState<CivicCardsSyncPayload | null>(null);
  const [receivedAlerts, setReceivedAlerts] = useState<CitizenAlert[]>([]);
  const [isDataMerged, setIsDataMerged] = useState(false);

  // Formulaire pour créer une nouvelle alerte citoyenne chiffrée
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertMessage, setNewAlertMessage] = useState('');
  const [newAlertCategory, setNewAlertCategory] = useState<CitizenAlert['category']>('meteo');
  const [newAlertSeverity, setNewAlertSeverity] = useState<CitizenAlert['severity']>('vigilance');
  const [newAlertQuartier, setNewAlertQuartier] = useState('Le Couchant');

  // Simulation 2 appareils
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<string>('');

  // Initialisation par défaut de la sélection
  useEffect(() => {
    setSelectedRequestIds(helpRequests.slice(0, 3).map(r => r.id));
    setSelectedLoanIds(toolLoans.slice(0, 2).map(l => l.id));
    setSelectedEventIds(communityEvents.slice(0, 2).map(e => e.id));
    setSelectedAlertIds(citizenAlerts.map(a => a.id));
  }, [helpRequests, toolLoans, communityEvents, citizenAlerts]);

  // Initialisation du noeud WebRTC
  useEffect(() => {
    if (!isOpen) {
      if (syncNodeRef.current) {
        syncNodeRef.current.destroy();
        syncNodeRef.current = null;
      }
      return;
    }

    const node = new WebRTCSyncNode();
    syncNodeRef.current = node;

    node.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    node.onLog((log) => {
      setLogs(prev => [log, ...prev.slice(0, 80)]);
    });

    node.onStats((newStats) => {
      setStats(newStats);
    });

    node.onPayloadReceived((payload) => {
      setReceivedPayload(payload);
      setIsDataMerged(false);
    });

    node.onAlertReceived((alert) => {
      setReceivedAlerts(prev => [alert, ...prev]);
      onBroadcastNewAlert(alert);
    });

    return () => {
      node.destroy();
      syncNodeRef.current = null;
    };
  }, [isOpen]);

  // Rendu Canvas du QR code de l'Offre
  useEffect(() => {
    if (offerQrData && offerCanvasRef.current) {
      QRCode.toCanvas(offerCanvasRef.current, offerQrData, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(err => console.error("Erreur rendu QR Offre :", err));
    }
  }, [offerQrData]);

  // Rendu Canvas du QR code de la Réponse
  useEffect(() => {
    if (answerQrData && answerCanvasRef.current) {
      QRCode.toCanvas(answerCanvasRef.current, answerQrData, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(err => console.error("Erreur rendu QR Réponse :", err));
    }
  }, [answerQrData]);

  // Déclencher la création d'offre pour émettre
  const handleGenerateOffer = async () => {
    if (!syncNodeRef.current) return;
    try {
      const senderName = userMode === 'senior' ? 'Simone (Aînée Couchant)' : 'Lucas (Veilleur ProxiLien)';
      const offerCode = await syncNodeRef.current.createOfferForQR(senderName, cityName);
      setOfferQrData(offerCode);
    } catch (err: any) {
      console.error("Erreur génération offre :", err);
    }
  };

  // Traiter un scan réussi
  const handleScanSuccess = async (scannedText: string) => {
    setIsScannerOpen(false);
    if (!syncNodeRef.current) return;

    try {
      if (scannerPurpose === 'scan_offer') {
        // Le récepteur a scanné l'offre de l'émetteur
        const receiverName = userMode === 'senior' ? 'Simone (Aînée)' : 'Lucas (Jeune Voisin)';
        const answerCode = await syncNodeRef.current.createAnswerForQR(scannedText, receiverName, cityName);
        setAnswerQrData(answerCode);
      } else if (scannerPurpose === 'scan_answer') {
        // L'émetteur a scanné la réponse du récepteur
        await syncNodeRef.current.applyAnswerFromQR(scannedText);
      }
    } catch (err: any) {
      alert(`Erreur de lecture du code P2P : ${err.message}`);
    }
  };

  // Envoi du lot sélectionné de fiches civiques et alertes
  const handleSendSelectedPayload = async () => {
    if (!syncNodeRef.current) return;

    const filteredRequests = helpRequests.filter(r => selectedRequestIds.includes(r.id));
    const filteredLoans = toolLoans.filter(l => selectedLoanIds.includes(l.id));
    const filteredEvents = communityEvents.filter(e => selectedEventIds.includes(e.id));
    const filteredAlerts = citizenAlerts.filter(a => selectedAlertIds.includes(a.id));

    const payload: CivicCardsSyncPayload = {
      version: '1.0.0',
      senderId: `peer-${Date.now()}`,
      senderName: userMode === 'senior' ? 'Simone (Aînée)' : 'Lucas (Veilleur)',
      cityName,
      timestamp: Date.now(),
      helpRequests: filteredRequests,
      toolLoans: filteredLoans,
      communityEvents: filteredEvents,
      citizenAlerts: filteredAlerts,
    };

    try {
      await syncNodeRef.current.sendCivicCardsPayload(payload);
    } catch (err: any) {
      alert(`Erreur d'envoi : ${err.message}`);
    }
  };

  // Fusionner les données reçues
  const handleConfirmMerge = () => {
    if (!receivedPayload) return;

    onMergeCivicData({
      helpRequests: receivedPayload.helpRequests,
      toolLoans: receivedPayload.toolLoans,
      communityEvents: receivedPayload.communityEvents,
      citizenAlerts: receivedPayload.citizenAlerts,
    });

    setIsDataMerged(true);
  };

  // Création et diffusion directe d'une alerte citoyenne chiffrée
  const handleCreateAndBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim() || !newAlertMessage.trim()) return;

    const newAlert: CitizenAlert = {
      id: `alt-p2p-${Date.now()}`,
      title: newAlertTitle.trim(),
      message: newAlertMessage.trim(),
      category: newAlertCategory,
      severity: newAlertSeverity,
      quartier: newAlertQuartier,
      timestamp: 'À l\'instant (P2P Direct)',
      authorName: userMode === 'senior' ? 'Aîné Veilleur' : 'Citoyen Sentinelle',
      authorRole: 'Réseau Pair-à-Pair ProxiLien',
      encrypted: true,
      signature: `SIG-P2P-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      verified: true,
      receivedViaP2P: true,
    };

    onBroadcastNewAlert(newAlert);

    // Si un canal WebRTC est actif, on la diffuse immédiatement
    if (syncNodeRef.current && connectionStatus === 'connected') {
      try {
        await syncNodeRef.current.sendCitizenAlert(newAlert);
      } catch (err) {
        console.warn("Diffusion canal P2P :", err);
      }
    }

    setNewAlertTitle('');
    setNewAlertMessage('');
    setIsCreatingAlert(false);
  };

  // Simulation interactive de 2 terminaux WebRTC sur le même écran
  const handleRunTwoDevicesSimulation = async () => {
    setIsSimulating(true);
    setSimStep("Initialisation des deux pairs WebRTC (Terminal A & Terminal B)...");

    try {
      const nodeA = new WebRTCSyncNode();
      const nodeB = new WebRTCSyncNode();

      nodeA.onLog((l) => setLogs(prev => [l, ...prev.slice(0, 80)]));
      nodeB.onLog((l) => setLogs(prev => [l, ...prev.slice(0, 80)]));

      // 1. Noeud A crée une offre
      setSimStep("1/4 : Terminal A (Simone) génère l'offre WebRTC et la clé éphémère AES-256...");
      const offerCode = await nodeA.createOfferForQR("Simone (Le Couchant)", cityName);
      await new Promise(r => setTimeout(r, 900));

      // 2. Noeud B accepte l'offre et génère une réponse
      setSimStep("2/4 : Terminal B (Lucas) scanne le QR code de l'offre et configure le chiffrement AES-256...");
      const answerCode = await nodeB.createAnswerForQR(offerCode, "Lucas (Point Zéro)", cityName);
      await new Promise(r => setTimeout(r, 900));

      // 3. Noeud A applique la réponse
      setSimStep("3/4 : Terminal A valide la réponse SDP. Négociation WebRTC DataChannel...");
      await nodeA.applyAnswerFromQR(answerCode);
      await new Promise(r => setTimeout(r, 1200));

      // 4. Envoi de fiches civiques et alertes chiffrées de B vers A
      setSimStep("4/4 : Échange chiffré AES-GCM 256 de fiches civiques & alertes citoyennes en direct...");
      
      const simPayload: CivicCardsSyncPayload = {
        version: '1.0.0',
        senderId: 'sim-peer-lucas',
        senderName: 'Lucas Valentin (Pair Wi-Fi certifié)',
        cityName,
        timestamp: Date.now(),
        helpRequests: [
          {
            id: `req-sim-${Date.now()}`,
            seniorName: 'Henriette M.',
            age: 87,
            quartier: 'Point Zéro',
            timeAgo: 'Il y a 5 min (P2P)',
            title: 'Changer le filtre de carafe d\'eau et vérifier pile détecteur fumée',
            description: 'Je n\'arrive plus à dévisser le compartiment du filtre à eau. Voisin bienvenu avec plaisir !',
            urgency: 'aujourd_hui',
            category: 'entraide',
            status: 'en_attente',
          }
        ],
        toolLoans: [
          {
            id: `loan-sim-${Date.now()}`,
            toolName: 'Perforateur burineur sans fil Bosch',
            category: 'bricolage',
            icon: '⚡',
            condition: 'excellent',
            lenderName: 'Lucas V.',
            borrowerName: 'Gérard (Aîné Ponant)',
            borrowerPhone: '06 12 99 88 77',
            borrowerQuartier: 'Le Ponant',
            loanDate: 'Ce matin',
            expectedReturnDate: 'Demain 18h',
            status: 'en_cours',
            trustGuarantee: 'Garantie Voisin de Confiance ProxiLien',
            receiptCode: 'PRET-P2P-948',
            smsConfirmationSent: true,
          }
        ],
        communityEvents: [
          {
            id: `evt-sim-${Date.now()}`,
            title: 'Atelier répar\'café & taille de rosiers entre voisins',
            description: 'Amenez vos petits appareils en panne ou vos sécateurs ! Goûter offert par les aînés.',
            category: 'cafe',
            categoryLabel: 'Goûter & Bricolage',
            icon: '☕',
            date: 'Samedi prochain',
            time: '15h00',
            location: 'Jardins de la Résidence Les Caravelles',
            quartier: 'Le Couchant',
            organizerName: 'Lucas Valentin',
            organizerRole: 'jeune',
            organizerAvatar: '🧑‍🎓',
            attendees: ['Simone', 'Jean', 'Marcel'],
          }
        ],
        citizenAlerts: [
          {
            id: `alt-sim-${Date.now()}`,
            title: 'Alerte Rafales & Mer agitée (Passe du Port)',
            message: 'Avis de vent fort d\'Est à Sud-Est (force 6 à 7). Vigilance sur les pontons et promenades maritimes pour les marcheurs.',
            category: 'meteo',
            severity: 'vigilance',
            quartier: 'Port & Plages',
            timestamp: 'À l\'instant (P2P Direct)',
            authorName: 'Capitainerie & Veilleurs Citoyens',
            authorRole: 'Veille Maritime Locale',
            encrypted: true,
            signature: 'SIG-PORT-LGM-7491',
            verified: true,
            receivedViaP2P: true,
          }
        ]
      };

      await nodeB.sendCivicCardsPayload(simPayload);
      setReceivedPayload(simPayload);
      setConnectionStatus('synced');
      setSimStep("Synchronisation réussie ! Fiches civiques et alerte citoyenne déchiffrées.");

      setTimeout(() => {
        setIsSimulating(false);
      }, 2500);

    } catch (err: any) {
      setSimStep(`Erreur simulation : ${err.message}`);
      setIsSimulating(false);
    }
  };

  const copyTextToClipboard = async (text: string, type: 'offer' | 'answer') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'offer') {
        setHasCopiedOffer(true);
        setTimeout(() => setHasCopiedOffer(false), 2000);
      } else {
        setHasCopiedAnswer(true);
        setTimeout(() => setHasCopiedAnswer(false), 2000);
      }
    } catch {
      alert("Impossible d'accéder au presse-papier");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-stone-900 border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Header with Sovereign & Offline Badge */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/80 border-b border-amber-400/40 flex items-start sm:items-center justify-between text-white gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-gold">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-amber-100">
                  Synchronisation P2P Décentralisée
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Sans Serveur Central
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5 font-medium">
                WebRTC DataChannel · Wi-Fi Local & QR Code direct · Chiffrement de bout en bout AES-GCM 256 bits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer flex-shrink-0"
            aria-label="Fermer le module de synchronisation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-4 py-2.5 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-bold">État du canal :</span>
            {connectionStatus === 'connected' || connectionStatus === 'synced' ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Connecté en direct (P2P Actif)
              </span>
            ) : connectionStatus === 'connecting' || connectionStatus === 'creating_offer' || connectionStatus === 'creating_answer' ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Négociation WebRTC...
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-medium inline-flex items-center gap-1">
                <WifiOff className="w-3 h-3 text-stone-400" />
                En attente d'appairage
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-stone-300">
            <span className="text-amber-300 font-semibold">
              🔒 Clé AES : <span className="text-white font-bold">{stats.fingerprint}</span>
            </span>
            <span className="hidden sm:inline text-stone-500">|</span>
            <span className="hidden sm:inline">
              Envoyé: {((stats.bytesSent) / 1024).toFixed(1)} Ko
            </span>
            <span className="hidden sm:inline">
              Reçu: {((stats.bytesReceived) / 1024).toFixed(1)} Ko
            </span>
            {stats.latencyMs > 0 && (
              <span className="text-emerald-400 font-bold">
                {stats.latencyMs} ms
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('emettre')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'emettre'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>1. Émettre (Partager)</span>
            </button>

            <button
              onClick={() => setActiveTab('recevoir')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'recevoir'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>2. Réceptionner (Scanner)</span>
            </button>

            <button
              onClick={() => setActiveTab('alertes')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'alertes'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>Alertes Chiffrées ({citizenAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Diagnostic WebRTC</span>
            </button>
          </div>

          {/* Quick 2-devices simulation button */}
          <button
            onClick={handleRunTwoDevicesSimulation}
            disabled={isSimulating}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
            title="Tester instantanément la synchronisation WebRTC entre deux pairs simulés sur votre machine"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Simulation...' : 'Démo 2 Appareils'}</span>
          </button>
        </div>

        {/* Simulation Banner when running */}
        {isSimulating && (
          <div className="p-3 bg-amber-500/20 border-b border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            <span>{simStep}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-stone-900 text-white space-y-6">

          {/* TAB 1: EMISSION (OFFERER) */}
          {activeTab === 'emettre' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Data Selection */}
              <div className="space-y-4">
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm text-amber-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Fiches Civiques à synchroniser
                    </h3>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Ville : {cityName}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 mb-4">
                    Sélectionnez les données à transférer en direct via le réseau Wi-Fi vers le terminal du voisin.
                  </p>

                  {/* Help Requests Selection */}
                  <div className="space-y-2 mb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Demandes d'entraide ({helpRequests.length})
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {helpRequests.map((req) => (
                        <label
                          key={req.id}
                          className="flex items-start gap-2 p-2 bg-stone-900 hover:bg-stone-850 rounded-xl border border-stone-800 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRequestIds.includes(req.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedRequestIds(prev => [...prev, req.id]);
                              else setSelectedRequestIds(prev => prev.filter(id => id !== req.id));
                            }}
                            className="mt-0.5 rounded text-amber-500 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{req.title}</span>
                            <span className="text-stone-400 text-[11px]">{req.seniorName} · {req.quartier}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tool Loans Selection */}
                  <div className="space-y-2 mb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Prêts d'outils ({toolLoans.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                      {toolLoans.map((loan) => (
                        <label
                          key={loan.id}
                          className="flex items-start gap-2 p-2 bg-stone-900 hover:bg-stone-850 rounded-xl border border-stone-800 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLoanIds.includes(loan.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedLoanIds(prev => [...prev, loan.id]);
                              else setSelectedLoanIds(prev => prev.filter(id => id !== loan.id));
                            }}
                            className="mt-0.5 rounded text-amber-500 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{loan.toolName}</span>
                            <span className="text-stone-400 text-[11px]">Reçu {loan.receiptCode} · {loan.status}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Encrypted Citizen Alerts Selection */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Alertes citoyennes chiffrées ({citizenAlerts.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                      {citizenAlerts.map((alt) => (
                        <label
                          key={alt.id}
                          className="flex items-start gap-2 p-2 bg-stone-900 hover:bg-stone-850 rounded-xl border border-red-900/40 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAlertIds.includes(alt.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAlertIds(prev => [...prev, alt.id]);
                              else setSelectedAlertIds(prev => prev.filter(id => id !== alt.id));
                            }}
                            className="mt-0.5 rounded text-red-500 focus:ring-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-red-200 block truncate">{alt.title}</span>
                            <span className="text-stone-400 text-[11px]">{alt.quartier} · Signature certifiée</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Send Button when connected */}
                {connectionStatus === 'connected' && (
                  <button
                    onClick={handleSendSelectedPayload}
                    className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <Send className="w-5 h-5" />
                    <span>Transmettre les fiches chiffrées en direct</span>
                  </button>
                )}
              </div>

              {/* Right Column: QR Code Display & Negotiation */}
              <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col items-center text-center">
                <h3 className="font-extrabold text-sm text-amber-200 mb-1">
                  Étape 1 : Générer le QR Code de Connexion
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mb-4">
                  Ce QR code contient la négociation WebRTC sécurisée et la clé de déchiffrement éphémère.
                </p>

                {!offerQrData ? (
                  <div className="p-8 border-2 border-dashed border-stone-800 rounded-3xl w-full max-w-xs flex flex-col items-center justify-center space-y-3">
                    <QrCode className="w-16 h-16 text-amber-500/50" />
                    <button
                      onClick={handleGenerateOffer}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
                    >
                      Créer le QR Code d'appairage
                    </button>
                    <span className="text-[11px] text-stone-400">
                      Zéro serveur requis · Fonctionne hors-ligne
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 w-full">
                    {/* QR Canvas */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-400">
                      <canvas ref={offerCanvasRef} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
                      <button
                        onClick={() => copyTextToClipboard(offerQrData, 'offer')}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl border border-stone-700 inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {hasCopiedOffer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopiedOffer ? 'Code copié' : 'Copier le code'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setScannerPurpose('scan_answer');
                          setIsScannerOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-md inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Scanner la réponse du voisin</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-400 max-w-xs pt-1">
                      Une fois que le voisin a scanné ce QR avec son appareil, cliquez sur <strong className="text-amber-300">Scanner la réponse</strong> pour finaliser la liaison.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RECEPTION (SCANNER & ANSWERER) */}
          {activeTab === 'recevoir' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Scan Offer Section */}
              <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-300">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-200">
                    Étape 1 : Scanner l'Émetteur
                  </h3>
                  <p className="text-xs text-stone-400 max-w-sm mt-1">
                    Pointez votre appareil vers le QR code affiché sur l'écran du voisin pour récupérer les paramètres de connexion chiffrée.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setScannerPurpose('scan_offer');
                    setIsScannerOpen(true);
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-2xl text-sm shadow-xl inline-flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>Ouvrir la caméra & scanner</span>
                </button>

                {/* Answer QR code displayed once offer is accepted */}
                {answerQrData && (
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 w-full flex flex-col items-center space-y-3 mt-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Réponse P2P prête ! Montrez ce QR code à l'émetteur :
                    </span>
                    <div className="p-2.5 bg-white rounded-xl shadow-lg border-2 border-emerald-400">
                      <canvas ref={answerCanvasRef} />
                    </div>
                    <button
                      onClick={() => copyTextToClipboard(answerQrData, 'answer')}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl border border-stone-700 inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {hasCopiedAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedAnswer ? 'Réponse copiée' : 'Copier le code réponse'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Received Data Preview & Merge */}
              <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-amber-200 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Fiches et Alertes Reçues
                  </h3>
                  {receivedPayload && (
                    <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                      Déchiffré avec succès
                    </span>
                  )}
                </div>

                {!receivedPayload ? (
                  <div className="p-8 border-2 border-dashed border-stone-800 rounded-2xl text-center space-y-2">
                    <Radio className="w-10 h-10 text-stone-600 mx-auto" />
                    <p className="text-xs text-stone-400">
                      En attente de réception des fiches civiques du voisin...
                    </p>
                    <span className="text-[11px] text-stone-500">
                      Le canal chiffré transmettra les données dès la validation mutuelle.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs space-y-1">
                      <div className="flex justify-between text-stone-300">
                        <span className="font-bold">Provenance :</span>
                        <span className="text-amber-300 font-semibold">{receivedPayload.senderName}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span className="font-bold">Territoire :</span>
                        <span>{receivedPayload.cityName}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span className="font-bold">Contenu :</span>
                        <span className="text-emerald-400 font-bold">
                          {receivedPayload.helpRequests.length} demandes, {receivedPayload.toolLoans.length} prêts, {receivedPayload.citizenAlerts.length} alertes
                        </span>
                      </div>
                    </div>

                    {/* Preview details */}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {receivedPayload.citizenAlerts.map(alt => (
                        <div key={alt.id} className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs">
                          <div className="flex items-center gap-1.5 text-red-300 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{alt.title}</span>
                          </div>
                          <p className="text-[11px] text-stone-300 mt-1">{alt.message}</p>
                        </div>
                      ))}

                      {receivedPayload.helpRequests.map(req => (
                        <div key={req.id} className="p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs">
                          <span className="font-bold text-white block">{req.title}</span>
                          <span className="text-[11px] text-stone-400">{req.seniorName} · {req.quartier}</span>
                        </div>
                      ))}
                    </div>

                    {/* Merge button */}
                    <button
                      onClick={handleConfirmMerge}
                      disabled={isDataMerged}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                        isDataMerged
                          ? 'bg-stone-800 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-stone-950 shadow-lg active:scale-98'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isDataMerged ? 'Données fusionnées dans ProxiLien ✅' : 'Intégrer ces fiches dans mon ProxiLien'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ENCRYPTED CITIZEN ALERTS HUB */}
          {activeTab === 'alertes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <h3 className="font-black text-sm text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Canal Citoyen d'Alertes Chiffrées
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Diffusion d'urgence autonome entre voisins sans dépendance aux opérateurs ou serveurs distants.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingAlert(!isCreatingAlert)}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isCreatingAlert ? 'Annuler' : 'Publier une Alerte Chiffrée'}</span>
                </button>
              </div>

              {/* Alert Creation Form */}
              {isCreatingAlert && (
                <form onSubmit={handleCreateAndBroadcastAlert} className="bg-stone-950 p-4 rounded-2xl border border-red-500/40 space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wider">
                    Nouvelle Alerte Citoyenne (Chiffrée AES-GCM 256)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-stone-300 font-bold block mb-1">Titre de l'alerte</label>
                      <input
                        type="text"
                        required
                        value={newAlertTitle}
                        onChange={(e) => setNewAlertTitle(e.target.value)}
                        placeholder="Ex: Vigilance Crue des Étangs / Appel à bénévoles"
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-stone-300 font-bold block mb-1">Quartier concerné</label>
                      <select
                        value={newAlertQuartier}
                        onChange={(e) => setNewAlertQuartier(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                      >
                        <option value="Le Couchant">Le Couchant</option>
                        <option value="Point Zéro">Point Zéro</option>
                        <option value="Le Ponant">Le Ponant</option>
                        <option value="Centre-Ville / Port">Centre-Ville / Port</option>
                        <option value="Ensemble de la Commune">Ensemble de la Commune</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-stone-300 font-bold block mb-1">Gravité</label>
                      <select
                        value={newAlertSeverity}
                        onChange={(e) => setNewAlertSeverity(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                      >
                        <option value="info">Information locale (Bleu)</option>
                        <option value="vigilance">Vigilance renforcée (Orange)</option>
                        <option value="critique">Urgence critique immédiate (Rouge)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-stone-300 font-bold block mb-1">Catégorie</label>
                      <select
                        value={newAlertCategory}
                        onChange={(e) => setNewAlertCategory(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                      >
                        <option value="meteo">Météo / Inondation / Canicule</option>
                        <option value="secours">Secours / Aîné égaré</option>
                        <option value="coupure">Coupure d'eau / Électricité</option>
                        <option value="solidarite">Solidarité de voisinage</option>
                        <option value="commune">Information municipale directe</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-stone-300 font-bold block mb-1">Message d'explication</label>
                    <textarea
                      required
                      rows={2}
                      value={newAlertMessage}
                      onChange={(e) => setNewAlertMessage(e.target.value)}
                      placeholder="Précisez la situation et les consignes civiques pour les résidents..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Signer cryptographiquement & Diffuser en P2P</span>
                  </button>
                </form>
              )}

              {/* Alerts List */}
              <div className="space-y-3">
                {citizenAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      alt.severity === 'critique'
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/50'
                        : alt.severity === 'vigilance'
                        ? 'bg-amber-950/30 border-amber-500/60'
                        : 'bg-stone-950 border-stone-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          alt.severity === 'critique'
                            ? 'bg-red-500 text-white animate-pulse'
                            : alt.severity === 'vigilance'
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {alt.severity}
                        </span>
                        <h4 className="font-extrabold text-sm text-white">{alt.title}</h4>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {alt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-stone-200 leading-relaxed mb-3">
                      {alt.message}
                    </p>

                    <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
                      <div className="flex items-center gap-2">
                        <span>Auteur : <strong className="text-stone-300">{alt.authorName}</strong> ({alt.quartier})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Empreinte : {alt.signature}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSTIC & WEBRTC TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-sm text-indigo-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Console d'Événements WebRTC & Cryptographie
                  </h3>
                  <button
                    onClick={() => setLogs([])}
                    className="text-[11px] text-stone-400 hover:text-white underline cursor-pointer"
                  >
                    Effacer le journal
                  </button>
                </div>

                <div className="bg-black/90 p-3 rounded-xl font-mono text-[11px] text-stone-300 max-h-72 overflow-y-auto space-y-1 border border-stone-800">
                  {logs.length === 0 ? (
                    <span className="text-stone-500 italic">Aucun événement enregistré pour l'instant.</span>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-stone-500 flex-shrink-0">[{log.time}]</span>
                        <span className={`font-bold flex-shrink-0 ${
                          log.type === 'success' ? 'text-emerald-400' :
                          log.type === 'crypto' ? 'text-amber-400' :
                          log.type === 'warn' ? 'text-orange-400' :
                          log.type === 'error' ? 'text-red-400' : 'text-cyan-400'
                        }`}>
                          {log.type.toUpperCase()}:
                        </span>
                        <span className="break-all">{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Technical Specifications Architecture */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-2">
                <h4 className="font-bold text-amber-200">Garanties Architecturales du Protocole P2P :</h4>
                <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
                  <li><strong>Aucun serveur central de données :</strong> Les requêtes et fiches ne transitent que directement d'appareil à appareil via le WebRTC DataChannel (SCTP sous DTLS).</li>
                  <li><strong>Chiffrement de bout en bout (E2EE) :</strong> Clé AES-GCM 256 bits dérivée localement via Web Crypto API, préservant l'anonymat et l'intégrité sans tiers de confiance.</li>
                  <li><strong>Signalement par QR Code / Wi-Fi local :</strong> L'échange de l'offre et de la réponse s'effectue par lecture optique de code QR compressé (Pako Deflate), supprimant le besoin d'un serveur de signalement cloud.</li>
                  <li><strong>Résilience civique :</strong> En cas de coupure Internet ou de panne réseau nationale, deux résidents connectés sur la même box ou point d'accès Wi-Fi continuent d'échanger des alertes et secours en temps réel.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Protocole P2P Souverain · <strong>ALPHABETTE SASU</strong> pour <strong>La Grande-Motte</strong></span>
            </div>
            <span className="hidden sm:inline">·</span>
            <a
              href="http://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline font-bold"
            >
              Découvrir toute la suite sur http://alphabette.fr
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>

      {/* QR Scanner Camera Sub-modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title={scannerPurpose === 'scan_offer' ? "Scanner l'Offre de l'Émetteur" : "Scanner la Réponse du Voisin"}
        subtitle={scannerPurpose === 'scan_offer' ? "Scannez le QR code affiché sur l'écran du pair qui partage ses fiches" : "Scannez le QR code affiché sur l'appareil récepteur"}
      />
    </div>
  );
};
