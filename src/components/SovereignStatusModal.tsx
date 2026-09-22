import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Zap, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Globe, 
  Lock, 
  X,
  Sparkles,
  Timer
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { askAI, getAIStatus, AIStatusResponse, AIResponse, ClientAIProvider } from '../services/aiService';

interface SovereignStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
}

export const SovereignStatusModal: React.FC<SovereignStatusModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
}) => {
  const [statusData, setStatusData] = useState<AIStatusResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ClientAIProvider>('gemini');
  const [testPrompt, setTestPrompt] = useState<string>("En quoi le moteur souverain ALPHABETTE garantit-il le respect de la vie privée des aînés de La Grande-Motte ?");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AIResponse | null>(null);

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  useEffect(() => {
    if (isOpen) {
      getAIStatus().then((data) => {
        if (data) setStatusData(data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await askAI(testPrompt, {
        provider: selectedProvider,
        systemInstruction: "Tu es le moteur d'assistance souverain d'ALPHABETTE pour ProxiLien. Réponds de façon concise, rassurante et professionnelle.",
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border-2 my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden ${
        isGold
          ? 'bg-stone-900 border-amber-500/80 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit']">
                  Architecture IA Hybride, Résiliente & Souveraine
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ALPHABETTE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Édité par <strong>ALPHABETTE</strong> (fondée par Valentin RICHAUD) · Hébergement souverain OVH (France)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1 text-xs sm:text-sm">
          {/* Sovereign Hosting Banner */}
          <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-extrabold text-xs">
                  Infrastructure 100% Souveraine & Conforme RGPD
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Front-end & données hébergés sur serveurs souverains OVH (domaines alphabette.fr / alphabette.eu). Zéro cookie publicitaire, zéro profilage commercial.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex-shrink-0">
              OVH Gravelines / Roubaix (FR)
            </span>
          </div>

          {/* The 3 Phases */}
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Stratégie d'Exécution en 3 Phases
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Phase 1 */}
              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Phase 1
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Actif
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs mb-1">Prototypage & Validation</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Google Gemini 3 (AI Studio / SDK Google GenAI). Valide toutes les fonctionnalités et interfaces.
                  </p>
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 block pt-1.5 border-t border-slate-200/50 dark:border-slate-700">
                  gemini-3.8-flash
                </span>
              </div>

              {/* Phase 2 */}
              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Phase 2
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold">Cible Prioritaire</span>
                  </div>
                  <h4 className="font-extrabold text-xs mb-1">Moteur Local Souverain</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Machine dédiée haute performance (Ollama / vLLM). Traitement 100% en local sur site, 0€ inférence.
                  </p>
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 block pt-1.5 border-t border-slate-200/50 dark:border-slate-700">
                  mistral-nemo (Local)
                </span>
              </div>

              {/* Phase 3 */}
              <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Phase 3
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Secours &lt; 3.5s
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs mb-1">Secours Cloud Européen</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bascule transparente vers l'API officielle Mistral AI (France/UE) en cas de panne, coupure ou pic de charge.
                  </p>
                </div>
                <span className="text-[10px] font-mono mt-2 text-slate-400 block pt-1.5 border-t border-slate-200/50 dark:border-slate-700">
                  api.mistral.ai (Paris)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Testing Sandbox */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-orange-500" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">
                  Testeur en Direct du Routeur Hybride
                </h4>
              </div>
              
              {/* Provider Selection */}
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedProvider('hybrid_mistral')}
                  className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedProvider === 'hybrid_mistral'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Hybride Résilient
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('gemini')}
                  className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedProvider === 'gemini'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Gemini (Dev)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('cloud_mistral')}
                  className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedProvider === 'cloud_mistral'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Mistral Cloud
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider('local_only')}
                  className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedProvider === 'local_only'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Local Strict
                </button>
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={2}
                className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-sans resize-none transition outline-hidden ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-orange-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
                }`}
                placeholder="Posez une question pour tester le routeur IA..."
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Mode sélectionné : <strong className="text-orange-500">{selectedProvider}</strong>
              </span>
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || !testPrompt.trim()}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Routage en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lancer le test de résilience</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result Output */}
            {testResult && (
              <div className={`p-3 rounded-xl border space-y-2 animate-in fade-in ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-200/50 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] ${
                      testResult.providerUsed === 'local_mistral'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : testResult.providerUsed === 'cloud_mistral'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      Fournisseur : {testResult.providerUsed}
                    </span>
                    <span className="font-mono text-slate-400">Modèle: {testResult.model}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Timer className="w-3 h-3 text-amber-500" />
                      {testResult.latencyMs} ms
                    </span>
                    {testResult.failover && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        Basculement transparent activé
                      </span>
                    )}
                  </div>
                </div>

                {testResult.failoverReason && (
                  <p className="text-[11px] text-amber-500 font-mono">
                    Raison du basculement : {testResult.failoverReason}
                  </p>
                )}

                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200 pt-1">
                  {testResult.text}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Chiffrement bout-en-bout · Respect strict du secret des échanges citoyen</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition cursor-pointer text-slate-700 dark:text-slate-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
