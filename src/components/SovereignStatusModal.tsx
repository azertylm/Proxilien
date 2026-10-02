import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  RefreshCw, 
  Globe, 
  Lock, 
  X,
  Sparkles,
  KeyRound,
  ExternalLink,
  MapPin,
  Laptop
} from 'lucide-react';
import { ThemeConfig, MistralAccessTier, MistralModelId } from '../types';
import { 
  askAI, 
  getAIStatus, 
  AIStatusResponse, 
  AIResponse, 
  getTrialInfo, 
  getMistralConfig, 
  saveMistralConfig 
} from '../services/aiService';
import { getStoredLGMGeoStatus, verifyRealLGMGeolocation, simulateLGMGeolocation } from '../services/geolocationService';

interface SovereignStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  onOpenPricing?: () => void;
}

export const SovereignStatusModal: React.FC<SovereignStatusModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  onOpenPricing,
}) => {
  const [statusData, setStatusData] = useState<AIStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MistralAccessTier | 'lgm_geo'>('trial');
  const [byokKey, setByokKey] = useState<string>('');
  const [byokModel, setByokModel] = useState<string>('mistral-small-latest');
  const [byokBaseUrl, setByokBaseUrl] = useState<string>('https://api.mistral.ai/v1');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [testPrompt, setTestPrompt] = useState<string>("En quoi la souveraineté Mistral AI et la conformité RGPD protègent-elles les aînés de La Grande-Motte ?");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AIResponse | null>(null);

  const trialInfo = getTrialInfo();
  const geoStatus = getStoredLGMGeoStatus();

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGoldWhite = themeConfig.themeId === 'gold-white';
  const isGoldDark = themeConfig.themeId === 'gold-dark';

  useEffect(() => {
    if (isOpen) {
      getAIStatus().then((data) => {
        if (data) setStatusData(data);
      });
      const config = getMistralConfig();
      setByokKey(config.apiKey || '');
      setByokModel(config.model || 'mistral-small-latest');
      setByokBaseUrl(config.baseUrl || 'https://api.mistral.ai/v1');
      setActiveTab(config.tier);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveByok = () => {
    saveMistralConfig({
      tier: 'byok',
      apiKey: byokKey,
      model: byokModel,
      baseUrl: byokBaseUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectTier = (tier: MistralAccessTier) => {
    setActiveTab(tier);
    saveMistralConfig({ tier });
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await askAI(testPrompt, {
        tier: activeTab === 'lgm_geo' ? 'trial' : activeTab,
        apiKey: activeTab === 'byok' ? byokKey : undefined,
        baseUrl: activeTab === 'local_mac' ? 'http://localhost:11434/v1' : byokBaseUrl,
        model: byokModel,
        systemInstruction: "Tu es l'assistant citoyen souverain ProxiLien édité par ALPHABETTE SASU. Réponds de façon concise, rassurante et professionnelle.",
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-3xl rounded-3xl p-4 sm:p-6 shadow-2xl border-2 my-auto max-h-[88vh] flex flex-col justify-between overflow-hidden text-sm ${
        isGoldDark
          ? 'bg-stone-950 border-amber-500 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white shadow-2xl'
          : isGoldWhite
          ? 'bg-white border-amber-300 text-slate-900 shadow-gold'
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit']">
                  Souveraineté RGPD & Moteur Mistral AI
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  100% Mistral AI Exclusif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Édité par <strong>ALPHABETTE SASU</strong> (fondée par Valentin RICHAUD) · Données hébergées en France (OVH)
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
        <div className="overflow-y-auto py-3 space-y-4 pr-1 text-xs sm:text-sm flex-1">
          {/* Bannière RGPD et Souveraineté Européenne */}
          <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className="flex items-start gap-2.5">
              <Globe className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-xs sm:text-sm">
                  Conformité RGPD Native & Zéro Entraînement Public
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Mistral AI est une entreprise française dont les infrastructures sont exclusivement situées en Union Européenne. Les requêtes et données de nos utilisateurs ne sont <strong>jamais réutilisées pour l'entraînement</strong> des modèles.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex-shrink-0">
              Serveurs EU / France
            </span>
          </div>

          {/* Onglets 3 Paliers d'Accès Technique */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Mode d'Accès IA Configuré
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Standardisation : <code className="font-mono text-orange-500">AI_BASE_URL, AI_API_KEY, MISTRAL_MODEL</code>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleSelectTier('trial')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'trial'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Essai 7 Jours</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTier('byok')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'byok'
                    ? 'bg-orange-600 text-white font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Mode BYOK</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTier('managed')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'managed'
                    ? 'bg-indigo-600 text-white font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mode Managé</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTier('local_mac')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'local_mac'
                    ? 'bg-purple-600 text-white font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Local Mac</span>
              </button>
            </div>
          </div>

          {/* Contenu spécifique de l'onglet sélectionné */}
          {activeTab === 'trial' && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                  1. Période d'essai gratuite (7 jours offerts)
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {trialInfo.isExpired ? 'Expiré' : `${trialInfo.daysRemaining} jour(s) restant(s)`}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Tout nouvel inscrit bénéficie d'un accès complet et immédiat à l'application ProxiLien, alimenté par la clé API Mistral propriétaire fournie et financée par ALPHABETTE SASU.
              </p>
              {trialInfo.isExpired && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs flex items-center justify-between">
                  <span>Votre période d'essai est terminée. Choisissez la formule BYOK ou Confort.</span>
                  {onOpenPricing && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPricing();
                      }}
                      className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 cursor-pointer"
                    >
                      Voir les Tarifs
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'byok' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400 block mb-1">
                  2. Mode BYOK (Bring Your Own Key) · 39 € / an
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Renseignez votre propre clé API Mistral pour consommer votre quota personnel chez Mistral AI en toute transparence.
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Votre Clé API Mistral (AI_API_KEY) :
                  </label>
                  <input
                    type="password"
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    placeholder="Ex: abcd1234efgh5678ijkl9012mnop..."
                    className="w-full px-3 py-2 rounded-xl text-xs border font-mono bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Modèle Mistral (MISTRAL_MODEL) :
                    </label>
                    <select
                      value={byokModel}
                      onChange={(e) => setByokModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    >
                      <option value="mistral-small-latest">mistral-small-latest (Recommandé)</option>
                      <option value="open-mistral-7b">open-mistral-7b (Haute disponibilité)</option>
                      <option value="open-mistral-nemo">open-mistral-nemo (Résilient)</option>
                      <option value="mistral-large-latest">mistral-large-latest (Raisonnement maximal)</option>
                      <option value="codestral-latest">codestral-latest (Technique)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Point d'accès API (AI_BASE_URL) :
                    </label>
                    <input
                      type="text"
                      value={byokBaseUrl}
                      onChange={(e) => setByokBaseUrl(e.target.value)}
                      placeholder="https://api.mistral.ai/v1"
                      className="w-full px-3 py-2 rounded-xl text-xs border font-mono bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSaveByok}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer la configuration BYOK</span>
                  </button>
                  {savedSuccess && (
                    <span className="text-emerald-500 font-bold text-xs animate-pulse">
                      Paramètres sauvegardés localement !
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'managed' && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 block mb-1">
                3. Mode Managé (Clé Alphabette incluse) · 59 € / an (ou Bouquet 199 €)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Vous n'avez pas besoin de créer de compte développeur ni de gérer des facturations d'API. Alphabette prend en charge la clé, l'infrastructure européenne et la maintenance continue.
              </p>
            </div>
          )}

          {activeTab === 'local_mac' && (
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400 block mb-1">
                4. Environnement Local Mac (Ollama / Metal)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                Exécution locale sous macOS via puce Apple Silicon (M1/M2/M3/M4) avec accélération Metal et Ollama. Coût d'inférence nul, données 100% isolées en local.
              </p>
              <div className="font-mono text-xs bg-slate-200 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                ollama run mistral-nemo --port 11434
              </div>
            </div>
          )}

          {/* Test en Direct */}
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Tester la connexion Mistral AI
              </span>
              <span className="text-[11px] text-slate-400">
                Mode actuel : <strong className="text-orange-500">{activeTab}</strong>
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                placeholder="Posez une question citoyenne..."
              />
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Appel...' : 'Tester'}</span>
              </button>
            </div>

            {testResult && (
              <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {testResult.model}
                  </span>
                  <span>{testResult.latencyMs} ms · Souverain RGPD</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {testResult.text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer & LIEN OBLIGATOIRE DU HUB */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-col gap-2.5 flex-shrink-0">
          {/* LIEN PIED DE PAGE OBLIGATOIRE VERS LE HUB */}
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <a
              href="http://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-amber-400 hover:underline inline-flex items-center justify-center gap-1.5"
            >
              <span>Découvrir toutes les applications de la suite sur http://alphabette.fr</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              ALPHABETTE SASU · Plateforme Souveraine Européenne
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
