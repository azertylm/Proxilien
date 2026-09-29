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

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-4xl rounded-3xl p-4 sm:p-6 shadow-2xl border-2 my-auto max-h-[95vh] flex flex-col justify-between overflow-hidden ${
        isGold
          ? 'bg-stone-900 border-amber-500/80 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit']">
                  Grille Tarifaire Officielle · ALPHABETTE SASU
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Mistral AI Exclusif · RGPD Native
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Écosystème logiciel souverain français · Fondée par <strong>Valentin RICHAUD</strong>
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-3 space-y-4 pr-1 text-xs sm:text-sm flex-1">
          {/* 1. SECTION SPÉCIFIQUE LA GRANDE-MOTTE AVEC GÉOLOCALISATION OBLIGATOIRE */}
          <div className={`p-4 rounded-2xl border-2 transition ${
            geoStatus.verified && geoStatus.isLGM
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-400/30'
              : 'bg-amber-500/10 border-amber-500/60'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  geoStatus.verified && geoStatus.isLGM ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base">
                      Habitants de La Grande-Motte : 1ère Année 100 % GRATUITE
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      Offre Municipale Pilote
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Test grandeur nature 100 % gratuit pour tous les résidents, aînés, commerces et associations de La Grande-Motte.
                    <br />
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">
                      Condition stricte : Géolocalisation obligatoire
                    </strong> pour valider l'appartenance au territoire communal (rayon de 6,5 km).
                  </p>

                  {/* Statut actuel de géolocalisation */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    {geoStatus.verified && geoStatus.isLGM ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/40">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pass Citoyen Grand-Mottois Validé · Quartier : {geoStatus.quartier || 'Centre-Ville'}</span>
                      </div>
                    ) : geoStatus.verified && !geoStatus.isLGM ? (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/40">
                        <Info className="w-4 h-4" />
                        <span>Position détectée hors La Grande-Motte ({geoStatus.distanceKm} km). Formules ci-dessous applicables.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <Compass className="w-4 h-4 text-amber-500" />
                        <span>Géolocalisation en attente de vérification.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'action géolocalisation */}
              <div className="flex flex-wrap sm:flex-col items-center gap-1.5 w-full sm:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={handleVerifyGPS}
                  disabled={isLocating}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Vérification GPS...' : 'Vérifier ma position GPS'}</span>
                </button>

                {/* Sélecteur de simulation pour testeur/évaluateur */}
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSimulateLGM('Le Couchant')}
                    className="flex-1 text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                    title="Simuler présence à La Grande-Motte (Le Couchant)"
                  >
                    Simuler LGM
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateOutside}
                    className="flex-1 text-[10px] bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                    title="Simuler hors de La Grande-Motte"
                  >
                    Simuler Hors LGM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PÉRIODE D'ESSAI BANNER (7 JOURS OFFERTS) */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                <strong>Période d'essai standard :</strong> Tout nouvel inscrit bénéficie de <strong>7 jours offerts</strong> avec la clé Mistral propriétaire Alphabette.
              </span>
            </div>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
              {trialInfo.isExpired ? 'Période d\'essai terminée' : `${trialInfo.daysRemaining} jour(s) d'essai restant(s)`}
            </span>
          </div>

          {/* 3. GRILLE TARIFAIRE OFFICIELLE : 2 COLONNES (APPLICATION INDIVIDUELLE vs LE BOUQUET ALPHABETTE) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colonne 1 : Application Individuelle ProxiLien */}
            <div className={`p-4 rounded-2xl border-2 flex flex-col justify-between ${
              isIndividualPlanSelected
                ? 'border-orange-500/80 bg-orange-50/20 dark:bg-orange-950/20'
                : isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Application Individuelle
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    ProxiLien Seul
                  </span>
                </div>
                <h3 className="font-black text-base font-['Outfit'] mb-1">
                  ProxiLien (Entraide & Lien Citoyen)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pour les usagers hors La Grande-Motte ou après l'année pilote gratuite.
                </p>

                {/* Choix Formule BYOK vs Formule Confort */}
                <div className="space-y-2">
                  {/* Formule BYOK 39 € / an */}
                  <div
                    onClick={() => setSelectedPlan('byok_app')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedPlan === 'byok_app'
                        ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-400'
                        : isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-extrabold text-xs">Formule BYOK (Clé client)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Accès illimité à ProxiLien, vous gérez votre propre clé API Mistral.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-['Outfit']">
                        39 €
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">/ an</span>
                    </div>
                  </div>

                  {/* Formule Confort 59 € / an */}
                  <div
                    onClick={() => setSelectedPlan('comfort_app')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedPlan === 'comfort_app'
                        ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-400'
                        : isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-extrabold text-xs">Formule Confort (Clé Alphabette incluse)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Accès complet clé en main, consommation d'IA managée par nos soins (après 7 jours d'essai).
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-['Outfit']">
                        59 €
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">/ an</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RAPPEL EXPLICITE DE CROSS-SELLING */}
              {isIndividualPlanSelected && (
                <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border border-amber-500/40 text-[11px] flex items-start gap-2 animate-in fade-in">
                  <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-700 dark:text-amber-300">Opportunité Économique :</strong>{' '}
                    Pour seulement <strong>99 € (BYOK)</strong> ou <strong>199 € (Intégral)</strong> par an, 
                    débloquez <strong>Le Bouquet Alphabette</strong> et accédez à l'intégralité des 5 applications au lieu d'une seule !
                  </div>
                </div>
              )}
            </div>

            {/* Colonne 2 : Le Bouquet Alphabette (Toutes les applications) */}
            <div className={`p-4 rounded-2xl border-2 relative flex flex-col justify-between ${
              selectedPlan === 'bouquet_byok' || selectedPlan === 'bouquet_integral'
                ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-400'
                : isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Meilleure Valeur · 5 Applications
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    Le Bouquet Alphabette
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    Suite Complète
                  </span>
                </div>
                <h3 className="font-black text-base font-['Outfit'] mb-1">
                  Accès à TOUTES les applications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  ProxiLien, LidarSol, OSolar, Infos Perso Grand Format & L'Œil de l'Atelier 3D.
                </p>

                {/* Choix Bouquet BYOK vs Bouquet Intégral */}
                <div className="space-y-2">
                  {/* Pass Bouquet BYOK 99 € / an */}
                  <div
                    onClick={() => setSelectedPlan('bouquet_byok')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedPlan === 'bouquet_byok'
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-400'
                        : isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-extrabold text-xs">Pass Bouquet BYOK</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Accès illimité à l'intégralité de la suite logicielle avec sa propre clé API.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-['Outfit']">
                        99 €
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">/ an</span>
                    </div>
                  </div>

                  {/* Pass Bouquet Intégral 199 € / an */}
                  <div
                    onClick={() => setSelectedPlan('bouquet_integral')}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      selectedPlan === 'bouquet_integral'
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-400'
                        : isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-extrabold text-xs">Pass Bouquet Intégral</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Accès illimité à toute la suite avec les clés d'API Mistral gérées et incluses.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-['Outfit']">
                        199 €
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">/ an</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Moins de 16,60 € / mois pour toute la suite</span>
                <span className="font-bold text-indigo-500">Identifiant Unique</span>
              </div>
            </div>
          </div>

          {/* 4. CATALOGUE DES APPLICATIONS & MAILLAGE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                  Catalogue de la Suite ALPHABETTE SASU
                </h4>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {catalogApps.map((app, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    app.active
                      ? (isDark ? 'bg-slate-800 border-orange-500/50' : 'bg-orange-50/50 border-orange-200')
                      : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200')
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold truncate">{app.name}</span>
                    <span className="text-[11px] text-slate-500 truncate hidden sm:inline">· {app.role}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    app.active
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {app.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Activation Button & LIEN OBLIGATOIRE DU HUB */}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>Souveraineté européenne · Mistral AI France · Serveurs OVH (alphabette.fr)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {subscribedPlan ? (
                <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Formule Activée avec Succès !</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubscribedPlan(selectedPlan)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-200" />
                  <span>
                    {selectedPlan === 'lgm_pilot_free'
                      ? 'Activer le Pass 1ère Année 100% Gratuit (La Grande-Motte)'
                      : selectedPlan === 'byok_app'
                      ? 'Souscrire Formule BYOK (39 € / an)'
                      : selectedPlan === 'comfort_app'
                      ? 'Souscrire Formule Confort (59 € / an)'
                      : selectedPlan === 'bouquet_byok'
                      ? 'Souscrire Pass Bouquet BYOK (99 € / an)'
                      : 'Souscrire Pass Bouquet Intégral (199 € / an)'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition cursor-pointer text-xs text-slate-700 dark:text-slate-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
