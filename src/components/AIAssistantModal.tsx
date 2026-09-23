import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  Timer, 
  Heart, 
  UserCheck, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { ThemeConfig, CityInfo, UserMode } from '../types';
import { askAI, AIResponse } from '../services/aiService';
import { speakText, stopSpeaking } from '../utils/speech';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  currentCity: CityInfo;
  userMode: UserMode;
  onOpenSovereignStatus?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  meta?: {
    providerUsed: string;
    sovereign: boolean;
    latencyMs: number;
    model: string;
    failover?: boolean;
  };
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  currentCity,
  userMode,
  onOpenSovereignStatus,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Bonjour ! Je suis votre Ami Bienveillant ProxiLien pour la ville de ${currentCity.name}. Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      meta: {
        providerUsed: 'gemini',
        sovereign: false,
        latencyMs: 80,
        model: 'Gemini 3 Flash',
      },
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  if (!isOpen) return null;

  const quickPrompts = userMode === 'senior' ? [
    "👵 Aidez-moi à rédiger une demande pour mes courses au Marché du 1er Octobre.",
    "💡 J'aimerais qu'un jeune voisin m'aide à régler ma tablette numérique.",
    "🚶 Comment rejoindre la marche douce du Point Zéro ?",
    "🪚 Comment emprunter un escabeau ou une scie en toute sécurité ?",
  ] : [
    "🤝 Quelles sont les missions d'entraide prioritaires pour nos aînés cette semaine ?",
    "🥬 Comment participer aux ateliers du Jardin Partagé du Ponant ?",
    "📜 Comment fonctionne mon attestation officielle d'engagement bénévole ?",
    "🧰 Comment prêter un outil à un aîné avec le reçu numérique de confiance ?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const systemInstruction = `Tu es l'assistant de conception, de support et d'administration de ProxiLien, la plateforme de mise en relation de proximité, d'entraide locale et de communication citoyenne éditée par ALPHABETTE SASU (fondée par Valentin RICHAUD). Ville actuelle : ${currentCity.name}.

FEUILLE DE ROUTE & STRATÉGIE DE DÉPLOIEMENT :
1. Phase pilote (Année 1) : Test grandeur nature 100 % gratuit pour l'ensemble des habitants, associations et commerces de la ville de La Grande-Motte.
2. Déploiement intercommunal (horizon 3-4 mois) :
   - Commercialisation de licences municipales aux mairies et collectivités (tableau de bord d'alertes citoyennes, valorisation des commerces locaux, canal d'information directe sans dépendance aux réseaux sociaux américains).
   - Module individuel citoyen : accès direct pour les usagers hors communes abonnées ou fonctionnalités avancées premium intégrées dans le Pass ALPHABETTE (40 € TTC / an avec les autres applications souveraines).

ENGAGEMENTS :
- Respect absolu de la vie privée : aucun traçage commercial, aucun cookie publicitaire, hébergement et traitement souverains en France.
- Ton : chaleureux, civique, clair, valorisant le lien social, la sécurité des aînés, la dynamique intergénérationnelle et l'autonomie des communes.`;

    try {
      const response: AIResponse = await askAI(query, {
        systemInstruction,
        temperature: 0.7,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meta: {
          providerUsed: response.providerUsed,
          sovereign: response.sovereign,
          latencyMs: response.latencyMs,
          model: response.model,
          failover: response.failover,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: "Pardonnez-moi, une légère hésitation réseau est survenue. Le moteur souverain reste à votre écoute.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msgId);
      speakText(text, () => setSpeakingMsgId(null));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-2xl rounded-3xl p-4 sm:p-6 shadow-2xl border-2 my-auto h-[88vh] max-h-[750px] flex flex-col justify-between overflow-hidden ${
        isGold
          ? 'bg-stone-900 border-amber-500/80 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-['Outfit']">
                  L'Ami Bienveillant ProxiLien
                </h2>
                <button
                  type="button"
                  onClick={onOpenSovereignStatus}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:underline cursor-pointer"
                  title="Voir l'architecture IA souveraine"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>IA Souveraine ALPHABETTE</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Conseiller communautaire · {currentCity.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 space-y-1.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-xs'
                    : isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-sans">
                  {msg.text}
                </div>

                {/* Metadata & Actions for Assistant Messages */}
                {msg.sender === 'assistant' && (
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span>{msg.meta?.model || 'Moteur Souverain'}</span>
                      {msg.meta?.latencyMs && (
                        <span className="font-mono">({msg.meta.latencyMs}ms)</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold cursor-pointer"
                    >
                      {speakingMsgId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>Arrêter</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Écouter</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 px-1 mt-0.5">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 max-w-xs animate-pulse">
              <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                L'Ami Bienveillant réfléchit souverainement...
              </span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 border-t border-slate-200/50 dark:border-slate-800 flex-shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Suggestions rapides :</span>
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(p)}
                disabled={isLoading}
                className={`text-[11px] px-2.5 py-1 rounded-xl whitespace-nowrap border transition cursor-pointer flex-shrink-0 font-medium ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-2 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Posez votre question ou demandez un conseil..."
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition outline-hidden ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-orange-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-orange-500'
            }`}
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
