import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Layers, 
  X,
  CreditCard,
  CheckCircle2,
  MapPin,
  Compass,
  ArrowRight,
  ExternalLink,
  Zap,
  Info,
  KeyRound
} from 'lucide-react';
import { ThemeConfig, AlphabettePlanId } from '../types';
import { 
  getStoredLGMGeoStatus, 
  verifyRealLGMGeolocation, 
  simulateLGMGeolocation, 
  resetLGMGeoStatus, 
  LGMGeoResult 
} from '../services/geolocationService';
import { getTrialInfo } from '../services/aiService';

interface AlphabetteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
  onOpenSovereignStatus?: () => void;
}

export const AlphabetteSubscriptionModal: React.FC<AlphabetteSubscriptionModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
  onOpenSovereignStatus,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<AlphabettePlanId>('lgm_pilot_free');
  const [subscribedPlan, setSubscribedPlan] = useState<AlphabettePlanId | null>(null);
  const [geoStatus, setGeoStatus] = useState<LGMGeoResult>(getStoredLGMGeoStatus());
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [trialInfo, setTrialInfo] = useState(getTrialInfo());
  const [activeTab, setActiveTab] = useState<'tarifs' | 'lgm_pass' | 'catalogue' | 'mairies'>('tarifs');
  const [inhabitantsCount, setInhabitantsCount] = useState<number>(5000);

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGoldWhite = themeConfig.themeId === 'gold-white';
  const isGoldDark = themeConfig.themeId === 'gold-dark';

  useEffect(() => {
    if (isOpen) {
      const status = getStoredLGMGeoStatus();
      setGeoStatus(status);
      setTrialInfo(getTrialInfo());
      if (status.verified && status.isLGM) {
        setSelectedPlan('lgm_pilot_free');
      } else {
        setSelectedPlan('comfort_app');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyGPS = async () => {
    setIsLocating(true);
    try {
      const res = await verifyRealLGMGeolocation();
      setGeoStatus(res);
      if (res.isLGM) {
        setSelectedPlan('lgm_pilot_free');
      }
    } finally {
      setIsLocating(false);
    }
  };

  const handleSimulateLGM = (quartier: string) => {
    const res = simulateLGMGeolocation(quartier, false);
    setGeoStatus(res);
    setSelectedPlan('lgm_pilot_free');
  };

  const handleSimulateOutside = () => {
    const res = simulateLGMGeolocation('Montpellier', true);
    setGeoStatus(res);
    setSelectedPlan('comfort_app');
  };

  const catalogApps = [
    {
      name: "PROXILIEN",
      role: "Entraide de proximité, lien citoyen et solidarité intergénérationnelle",
      active: true,
      tag: "Cette application"
    },
    {
      name: "LIDARSOL",
      role: "Cadastre solaire & géométrie haute précision 3D LiDAR",
      active: false,
      tag: "Suite ALPHABETTE"
    },
    {
      name: "OSOLAR",
      role: "Simulation et optimisation photovoltaïque citoyenne & territoriale",
      active: false,
      tag: "Suite ALPHABETTE"
    },
    {
      name: "INFOS PERSO GRAND FORMAT",
      role: "Portail d'informations claires et sécurisées pour aînés et citoyens",
      active: false,
      tag: "Suite ALPHABETTE"
    },
    {
      name: "L'ŒIL DE L'ATELIER 3D",
      role: "Suivi, gestion et conception d'impression et fabrication 3D",
      active: false,
      tag: "Suite ALPHABETTE"
    }
  ];

  const isIndividualPlanSelected = selectedPlan === 'byok_app' || selectedPlan === 'comfort_app';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border-2 my-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-y-auto text-sm ${
        isGoldDark
          ? 'bg-stone-950 border-amber-500 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white shadow-2xl'
          : isGoldWhite
          ? 'bg-white border-amber-300 text-slate-900 shadow-gold'
          : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 flex-shrink-0 ${
          isGoldDark
            ? 'bg-stone-900 border-amber-500/50'
            : isDark
            ? 'bg-slate-800/80 border-slate-700'
            : isGoldWhite
            ? 'bg-amber-50/70 border-amber-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-base sm:text-lg font-black font-['Outfit'] ${
                  isGoldWhite ? 'text-amber-950' : (isDark ? 'text-white' : 'text-slate-900')
                }`}>
                  Grille Tarifaire Officielle · ALPHABETTE SASU
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Mistral AI Exclusif · RGPD Native
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Écosystème logiciel souverain français · Fondée par <strong>Valentin RICHAUD</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer flex-shrink-0 ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Ergonomic PC / Tablet / Smartphone switch) */}
        <div className={`px-4 sm:px-5 pt-3 pb-1 border-b flex-shrink-0 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('tarifs')}
              className={`py-2 px-2 sm:px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'tarifs'
                  ? (isGoldWhite
                      ? 'bg-white text-amber-950 shadow-xs ring-1 ring-amber-300'
                      : isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs')
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Formules & Bouquet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lgm_pass')}
              className={`py-2 px-2 sm:px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'lgm_pass'
                  ? (isGoldWhite
                      ? 'bg-white text-amber-950 shadow-xs ring-1 ring-amber-300'
                      : isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs')
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">Pass LGM (Gratuit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mairies')}
              className={`py-2 px-2 sm:px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'mairies'
                  ? (isGoldWhite
                      ? 'bg-white text-amber-950 shadow-xs ring-1 ring-amber-300'
                      : isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs')
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="truncate">Offre Mairies</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalogue')}
              className={`py-2 px-2 sm:px-3 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                activeTab === 'catalogue'
                  ? (isGoldWhite
                      ? 'bg-white text-amber-950 shadow-xs ring-1 ring-amber-300'
                      : isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs')
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
              <span className="truncate">5 Logiciels</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* TAB 1: FORMULES ET TARIFS */}
          {activeTab === 'tarifs' && (
            <div className="space-y-4">
              {/* 7 Jours Essai Info Bar */}
              <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-amber-50/80 border-amber-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>
                    <strong>Période d'essai standard :</strong> Tout nouvel inscrit bénéficie de <strong>7 jours offerts</strong> avec la clé Mistral propriétaire Alphabette.
                  </span>
                </div>
                <span className="font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg flex-shrink-0 self-start sm:self-auto">
                  {trialInfo.isExpired ? 'Période d\'essai terminée' : `${trialInfo.daysRemaining} jour(s) d'essai restant(s)`}
                </span>
              </div>

              {/* 2 Colonnes Tarifs (PC / Tablette) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Colonne 1 : Application Unique ProxiLien (15 € / an) */}
                <div className={`p-4 rounded-2xl border-2 flex flex-col justify-between ${
                  isIndividualPlanSelected
                    ? (isDark ? 'border-orange-500 bg-orange-950/20' : 'border-orange-400 bg-orange-50/30')
                    : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/70 border-slate-200')
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Application Unique
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        ProxiLien
                      </span>
                    </div>
                    <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                      Accès ProxiLien Seul
                    </h3>
                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Idéal pour l'accès unitaire à l'application d'entraide de proximité.
                    </p>

                    <div className="space-y-2">
                      <div
                        onClick={() => setSelectedPlan('byok_app')}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                          selectedPlan === 'byok_app'
                            ? (isDark ? 'border-orange-500 bg-orange-950/40 ring-1 ring-orange-400' : 'border-orange-500 bg-orange-50 ring-1 ring-orange-400')
                            : (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-orange-300')
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Formule Standard (App Seule)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Accès illimité à ProxiLien sur l'écosystème Alphabette.
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-['Outfit']">
                            15 €
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">/ an</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-600/50 text-[11px] flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 dark:text-slate-200">
                      <strong className="text-amber-800 dark:text-amber-300">Offre Bouquet :</strong> Pour seulement 40 €/an, accédez aux 5 logiciels complets.
                    </p>
                  </div>
                </div>

                {/* Colonne 2 : Le Bouquet Complet Alphabette (40 € / an) */}
                <div className={`p-4 rounded-2xl border-2 relative flex flex-col justify-between ${
                  selectedPlan === 'bouquet_byok' || selectedPlan === 'bouquet_integral'
                    ? (isDark ? 'border-indigo-500 bg-indigo-950/20 shadow-md ring-1 ring-indigo-400' : 'border-indigo-500 bg-indigo-50/30 shadow-md ring-1 ring-indigo-400')
                    : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/70 border-slate-200')
                }`}>
                  <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    Recommandé · 5 Logiciels
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Le Bouquet Complet Alphabette
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                        5 Applications
                      </span>
                    </div>
                    <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>
                      Bouquet Complet Alphabette
                    </h3>
                    <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      ProxiLien, LidarSol, OSolar, Infos Perso Grand Format & L'Œil de l'Atelier 3D.
                    </p>

                    <div className="space-y-2">
                      <div
                        onClick={() => setSelectedPlan('bouquet_byok')}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                          selectedPlan === 'bouquet_byok'
                            ? (isDark ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-400' : 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-400')
                            : (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-indigo-300')
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Pass Bouquet Intégral</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Accès illimité à l'intégralité des 5 logiciels du réseau Alphabette.
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                            40 €
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">/ an</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <span>Soit 3,33 € / mois pour toute la suite</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Identifiant Unique</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASS LA GRANDE-MOTTE (100% GRATUIT) */}
          {activeTab === 'lgm_pass' && (
            <div className="space-y-4">
              <div className={`p-4 sm:p-5 rounded-2xl border-2 transition ${
                geoStatus.verified && geoStatus.isLGM
                  ? (isDark ? 'bg-emerald-950/20 border-emerald-500' : 'bg-emerald-50/80 border-emerald-400')
                  : (isDark ? 'bg-amber-950/20 border-amber-500/60' : 'bg-amber-50/80 border-amber-300')
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-2xl flex-shrink-0 ${
                      geoStatus.verified && geoStatus.isLGM ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Habitants de La Grande-Motte : 1ère Année 100 % GRATUITE
                        </span>
                        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                          Offre Municipale Pilote
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Grâce au partenariat d'expérimentation entre <strong>ALPHABETTE SASU</strong> et la commune de <strong>La Grande-Motte</strong>, tous les résidents, aînés, commerces et associations bénéficient d'un an d'accès offert d'une valeur de 59 €.
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                        Condition légale : Géolocalisation obligatoire sur le périmètre communal (rayon de 6,5 km).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Card & Verification */}
                <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">Statut de la position :</span>
                    {geoStatus.verified && geoStatus.isLGM ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm mt-0.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Pass Citoyen Validé · Quartier : {geoStatus.quartier || 'Centre-Ville'}</span>
                      </div>
                    ) : geoStatus.verified && !geoStatus.isLGM ? (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm mt-0.5">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>Position détectée hors La Grande-Motte ({geoStatus.distanceKm} km).</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-sm mt-0.5">
                        <Compass className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Géolocalisation en attente de vérification.</span>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleVerifyGPS}
                      disabled={isLocating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isLocating ? 'Vérification GPS...' : 'Valider ma position GPS'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulateLGM('Le Couchant')}
                      className={`text-xs px-3 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        isDark ? 'bg-slate-800 text-amber-300 border-amber-600/50 hover:bg-slate-700' : 'bg-slate-100 text-amber-900 border-amber-300 hover:bg-slate-200'
                      }`}
                      title="Simuler présence à La Grande-Motte"
                    >
                      Simuler LGM
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateOutside}
                      className={`text-xs px-3 py-2 rounded-xl font-bold border transition cursor-pointer ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Simuler hors de La Grande-Motte"
                    >
                      Simuler Hors LGM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OFFRE MAIRIES & COLLECTIVITÉS */}
          {activeTab === 'mairies' && (
            <div className="space-y-4">
              <div className={`p-4 sm:p-5 rounded-2xl border-2 transition ${
                isDark ? 'bg-blue-950/20 border-blue-500/60' : 'bg-blue-50/80 border-blue-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Partenariat Mairies & Collectivités Territoriales
                      </h3>
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                        Offre Officielle ALPHABETTE
                      </span>
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Déployez ProxiLien et l'écosystème Alphabette sur votre commune avec géolocalisation officielle sécurisée pour tous vos administrés.
                    </p>
                  </div>
                </div>

                {/* Calculator & Pricing */}
                <div className={`mt-4 p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nombre d'habitants de votre commune :
                      </label>
                      <input
                        type="number"
                        min="500"
                        max="500000"
                        step="500"
                        value={inhabitantsCount}
                        onChange={(e) => setInhabitantsCount(Math.max(100, parseInt(e.target.value) || 0))}
                        className={`mt-1 px-3 py-1.5 rounded-lg border text-sm font-black w-36 ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-['Outfit']">
                        {(inhabitantsCount * 0.07).toFixed(2)} € <span className="text-xs font-bold text-slate-500">/ an (pour 2028)</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Soit 0,07 € par habitant et par an
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 flex-shrink-0" />
                      <span>Offre Spéciale Transition 2027-2028 :</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200">
                      Pour tout engagement et paiement de l'année <strong>2028</strong>, la <strong>première année civile 2027 est 100 % offerte</strong> (accès immédiat et géolocalisation active jusqu'au 31 décembre 2027).
                    </p>
                  </div>

                  {/* Contact & Email & Select Plan */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Contact : <a href="mailto:contact@alphabette.fr" className="font-black text-blue-600 dark:text-blue-400 underline">contact@alphabette.fr</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('municipal_licence')}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                          selectedPlan === 'municipal_licence'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : (isDark ? 'bg-slate-800 text-blue-300 border-blue-600/50 hover:bg-slate-700' : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50')
                        }`}
                      >
                        {selectedPlan === 'municipal_licence' ? '✓ Offre Mairie Sélectionnée' : 'Sélectionner cette offre'}
                      </button>
                      <a
                        href={`mailto:contact@alphabette.fr?subject=Demande%20de%20partenariat%20commune%20-%20ProxiLien&body=Bonjour,%250A%250ANotre%2520commune%2520compte%2520environ%2520${inhabitantsCount}%2520habitants.%2520Nous%2520souhaitons%2520mettre%2520en%2520place%2520le%2520partenariat%2520municipal%2520ProxiLien.%250A%250AMerci%2520de%2520nous%2520recontacter.`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>contact@alphabette.fr</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATALOGUE DES 5 APPLICATIONS */}
          {activeTab === 'catalogue' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className={`font-black text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Les 5 Logiciels de la Suite ALPHABETTE
                  </span>
                </div>
                <a
                  href="http://alphabette.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-orange-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>http://alphabette.fr</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {catalogApps.map((app, idx) => (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      app.active
                        ? (isDark ? 'bg-orange-950/20 border-orange-500/60' : 'bg-orange-50/60 border-orange-300')
                        : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm tracking-wide ${
                          app.active
                            ? 'text-orange-600 dark:text-orange-400'
                            : (isDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {app.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          app.active
                            ? 'bg-orange-500 text-white'
                            : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {app.tag}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 leading-snug ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {app.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Actions */}
        <div className={`p-4 sm:p-5 border-t flex flex-col gap-3 flex-shrink-0 ${
          isGoldDark
            ? 'bg-stone-900/90 border-amber-500/50'
            : isDark
            ? 'bg-slate-800/80 border-slate-700'
            : isGoldWhite
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Hub website direct link */}
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Globe className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Souveraineté européenne · Mistral AI · Serveurs OVH</span>
            </div>

            <a
              href="http://alphabette.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Accéder au portail alphabette.fr</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            {subscribedPlan ? (
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Formule Activée avec Succès !</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSubscribedPlan(selectedPlan)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4 text-amber-200" />
                <span>
                  {selectedPlan === 'lgm_pilot_free'
                    ? 'Activer le Pass 1ère Année 100% Gratuit (La Grande-Motte)'
                    : selectedPlan === 'byok_app' || selectedPlan === 'comfort_app'
                    ? 'Souscrire Application Unique ProxiLien (15 € / an)'
                    : selectedPlan === 'bouquet_byok' || selectedPlan === 'bouquet_integral'
                    ? 'Souscrire Bouquet Complet Alphabette (40 € / an)'
                    : `Souscrire Licence Mairie (${(inhabitantsCount * 0.07).toFixed(2)} € / an - 2027 Offert)`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-bold transition cursor-pointer text-xs text-center ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
