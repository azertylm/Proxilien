import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Layers, 
  X,
  CreditCard,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { ThemeConfig } from '../types';

interface AlphabetteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: ThemeConfig;
}

export const AlphabetteSubscriptionModal: React.FC<AlphabetteSubscriptionModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pilot' | 'municipal' | 'pass_alphabette'>('pilot');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  if (!isOpen) return null;

  const catalogApps = [
    {
      name: "PROXILIEN",
      role: "Plateforme d'entraide de proximité, lien citoyen et solidarité locale",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className={`relative w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border-2 my-auto max-h-[94vh] flex flex-col justify-between overflow-hidden ${
        isGold
          ? 'bg-stone-900 border-amber-500/80 text-stone-100 shadow-gold-lg'
          : isDark
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-['Outfit']">
                  Feuille de Route & Modèle ALPHABETTE SASU
                </h2>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Éditeur Souverain Français
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Communication citoyenne, entraide locale & souveraineté numérique · Fondée par Valentin RICHAUD
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
        <div className="overflow-y-auto py-3 space-y-4 pr-1 text-xs sm:text-sm">
          {/* Engagements & Respect Absolu de la Vie Privée */}
          <div className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-extrabold text-xs">Nos Engagements Éthiques et Souverains</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Respect absolu de la vie privée :</strong> aucun traçage commercial, aucun cookie publicitaire, 
              hébergement et traitement souverains en France (OVH Roubaix/Gravelines). ProxiLien redonne l'autonomie aux communes et renforce le lien social intergénérationnel sans dépendre des réseaux sociaux américains.
            </p>
          </div>

          {/* Phase 1 vs Phase 2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Pilote Gratuit La Grande-Motte */}
            <div 
              onClick={() => setSelectedPlan('pilot')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                selectedPlan === 'pilot'
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-2 ring-emerald-400/30'
                  : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                En Cours · Année 1
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                  Phase Pilote Municipale
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-emerald-600 dark:text-emerald-400">
                    100 % Gratuit
                  </span>
                </div>
                <h4 className="font-bold text-xs mb-1.5">La Grande-Motte</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">
                  Test grandeur nature sans aucun frais pour l'ensemble du territoire :
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Habitants & aînés de la commune</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Associations & collectifs locaux</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Commerces & artisans de proximité</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Urgence SOS 3 voisins & Entraide vocale</span>
                  </li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Actif immédiatement</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'pilot' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'
                }`}>
                  {selectedPlan === 'pilot' && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
              </div>
            </div>

            {/* 2. Licence Municipale Collectivités */}
            <div 
              onClick={() => setSelectedPlan('municipal')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                selectedPlan === 'municipal'
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-400/30'
                  : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                Horizon 3-4 mois
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-500 block mb-1">
                  Déploiement Intercommunal
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl sm:text-2xl font-black font-['Outfit'] text-indigo-600 dark:text-indigo-400">
                    Licence Mairie
                  </span>
                </div>
                <h4 className="font-bold text-xs mb-1.5">Collectivités & Villes</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">
                  Offerte par la commune à tous ses administrés :
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Tableau de bord d'alertes citoyennes</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Valorisation des commerces locaux</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Canal direct sans dépendance GAFAM</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Gratuité totale pour les citoyens</span>
                  </li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-500">Devis collectivité</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'municipal' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-400'
                }`}>
                  {selectedPlan === 'municipal' && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
              </div>
            </div>

            {/* 3. Pass ALPHABETTE (40 € TTC / an) */}
            <div 
              onClick={() => setSelectedPlan('pass_alphabette')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                selectedPlan === 'pass_alphabette'
                  ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
                  : isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                Pass Citoyen
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 block mb-1">
                  Module Individuel Citoyen
                </span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-600 dark:text-amber-400">
                    40 €
                  </span>
                  <span className="text-xs text-slate-500 font-bold">TTC / an</span>
                </div>
                <h4 className="font-bold text-xs mb-1.5">Pass ALPHABETTE</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 leading-snug">
                  Pour usagers hors communes abonnées ou fonctionnalités avancées :
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Accès complet ProxiLien partout en France</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Accès à <strong>LIDARSOL</strong> & <strong>OSOLAR</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span><strong>Infos Perso Grand Format</strong> & <strong>Atelier 3D</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>Identifiant unique souverain ALPHABETTE</span>
                  </li>
                </ul>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-600 dark:text-amber-400">Moins de 3,35 €/mois</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'pass_alphabette' ? 'border-amber-500 bg-amber-500' : 'border-slate-400'
                }`}>
                  {selectedPlan === 'pass_alphabette' && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
              </div>
            </div>
          </div>

          {/* Unified Catalog List */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Catalogue des Applications Souveraines ALPHABETTE SASU
              </h4>
            </div>
            <div className="space-y-1.5">
              {catalogApps.map((app, idx) => (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    app.active
                      ? (isDark ? 'bg-slate-800 border-orange-500/50' : 'bg-orange-50/50 border-orange-200')
                      : (isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200')
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold">{app.name}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">· {app.role}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

        {/* Footer & Activation Button */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hébergement souverain OVH France · ALPHABETTE SASU (alphabette.fr)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Option Enregistrée avec Succès !</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSubscribed(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-200" />
                <span>
                  {selectedPlan === 'pilot'
                    ? 'Profiter du Pilote Gratuit (La Grande-Motte)'
                    : selectedPlan === 'municipal'
                    ? 'Demander un devis Licence Municipale'
                    : 'Souscrire au Pass ALPHABETTE (40 € TTC/an)'}
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
  );
};
