import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Award, 
  Heart, 
  Sparkles, 
  Share2, 
  Phone, 
  AlertCircle,
  FileCheck,
  Navigation,
  MessageSquare,
  UserCheck,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { CityInfo, HelpRequest, ToolLoan, ThemeConfig, HelpRequestStatus } from '../types';
import { INITIAL_HELP_REQUESTS, NEIGHBORS_DATA } from '../data/mockData';
import { HelperArrivalModal } from './HelperArrivalModal';

interface YouthDashboardViewProps {
  currentCity: CityInfo;
  activeRequests: HelpRequest[];
  toolLoans?: ToolLoan[];
  themeConfig?: ThemeConfig;
  onTakeHelpRequest?: (reqId: string) => void;
  onTakeHelpRequestWithArrival?: (
    reqId: string, 
    arrivalData: { estimatedTime: string; transport: string; arrivalNote: string; helperPhone: string }
  ) => void;
  onUpdateStatus?: (reqId: string, newStatus: HelpRequestStatus) => void;
  onAddDelay?: (reqId: string) => void;
  onConfirmResolved?: (reqId: string) => void;
  onGoToVillage: () => void;
  onOpenReceipt?: (loan: ToolLoan) => void;
  onMarkAsReturned?: (loanId: string) => void;
  onOpenAIAssistant?: () => void;
  onOpenSovereignStatus?: () => void;
}

export const YouthDashboardView: React.FC<YouthDashboardViewProps> = ({
  currentCity,
  activeRequests,
  toolLoans = [],
  themeConfig,
  onTakeHelpRequest,
  onTakeHelpRequestWithArrival,
  onUpdateStatus,
  onAddDelay,
  onConfirmResolved,
  onGoToVillage,
  onOpenReceipt,
  onMarkAsReturned,
  onOpenAIAssistant,
  onOpenSovereignStatus,
}) => {
  const [userPoints, setUserPoints] = useState<number>(340);
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedRequestForArrival, setSelectedRequestForArrival] = useState<HelpRequest | null>(null);

  const isDark = themeConfig?.themeId === 'dark' || themeConfig?.themeId === 'gold-dark';
  const isGold = themeConfig?.themeId === 'gold-white' || themeConfig?.themeId === 'gold-dark';

  const handleOpenArrivalModal = (req: HelpRequest) => {
    setSelectedRequestForArrival(req);
  };

  const handleConfirmArrivalFromModal = (
    reqId: string,
    arrivalData: { estimatedTime: string; transport: string; arrivalNote: string; helperPhone: string }
  ) => {
    if (onTakeHelpRequestWithArrival) {
      onTakeHelpRequestWithArrival(reqId, arrivalData);
    } else if (onTakeHelpRequest) {
      onTakeHelpRequest(reqId);
    }
    const newSet = new Set(acceptedRequests);
    newSet.add(reqId);
    setAcceptedRequests(newSet);
    setUserPoints(prev => prev + 50);
  };

  // Active missions where volunteer is engaged
  const myInterventions = activeRequests.filter(
    r => r.status === 'pris_en_charge' || r.status === 'en_route' || r.status === 'arrive'
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner: Young Volunteer Hero Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase px-2.5 py-0.5 rounded-full">
                Bénévole Certifié · {currentCity.name}
              </span>
              <span className="text-xs text-indigo-200">Niveau 3 : Pilier Solidaire</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit']">
              Espace Jeune & Voisin Bienveillant 🧑‍🤝‍🧑
            </h1>
            <p className="text-indigo-200 font-medium text-sm sm:text-base mt-1 max-w-xl">
              Faites la différence à {currentCity.name}. Chaque coup de main apporte du réconfort à un aîné et valorise votre parcours citoyen.
            </p>
          </div>

          {/* Gamification Badge Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex items-center gap-4 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg">
              🏆
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-amber-300">
                {userPoints} pts
              </div>
              <div className="text-xs text-indigo-200 font-bold">
                14 Aides validées · 28 heures données
              </div>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="mt-1.5 text-xs font-extrabold hover:underline flex items-center gap-1 text-amber-300 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Mon Attestation d'Engagement</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sovereign AI Volunteer Assistant Banner */}
      {onOpenAIAssistant && (
        <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xl shadow-xs flex-shrink-0">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm">
                  Conseiller Citoyen & Missions Solidaires
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Moteur Souverain ALPHABETTE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Besoin d'un conseil pour aborder un aîné, préparer une visite de courtoisie ou rédiger un contrat de prêt d'outils ?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenAIAssistant}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>Ouvrir l'Ami Bienveillant</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Borrowed Tools Section for Youth */}
      {toolLoans.length > 0 && (
        <div className={`border-2 rounded-3xl p-5 sm:p-6 shadow-xs ${
          isDark 
            ? 'bg-amber-950/20 border-amber-500/40 text-white' 
            : 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧰</span>
              <div>
                <h2 className={`text-base sm:text-lg font-black font-['Outfit'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Matériels & Outils prêtés par vos aînés
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Prêt en confiance ProxiLien avec reçu numérique et rappel bienveillant.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toolLoans.map((loan) => (
              <div 
                key={loan.id}
                className={`rounded-2xl p-4 border shadow-xs flex flex-col justify-between gap-3 ${
                  isDark 
                    ? 'bg-slate-800/90 border-slate-700 text-white' 
                    : 'bg-white border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-3xl p-1.5 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-amber-50'}`}>
                        {loan.icon || '🪚'}
                      </span>
                      <div>
                        <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                          {loan.receiptCode}
                        </span>
                        <h3 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {loan.toolName}
                        </h3>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      loan.status === 'rendu' 
                        ? (isDark ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800') 
                        : (isDark ? 'bg-amber-950 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-900')
                    }`}>
                      {loan.status === 'rendu' ? 'Restitué' : 'À rapporter'}
                    </span>
                  </div>

                  <div className={`mt-2.5 p-2.5 rounded-xl text-xs space-y-1 ${
                    isDark ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-50 text-slate-800'
                  }`}>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Prêté par :</span>
                      <span className="font-bold">👴 {loan.lenderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Retour convenu :</span>
                      <span className={`font-black ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>{loan.expectedReturnDate}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex gap-2 pt-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  {onOpenReceipt && (
                    <button
                      onClick={() => onOpenReceipt(loan)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isDark 
                          ? 'bg-slate-700 hover:bg-slate-600 text-amber-300 border-slate-600' 
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                      }`}
                    >
                      📜 Reçu officiel
                    </button>
                  )}
                  {loan.status === 'en_cours' && onMarkAsReturned && (
                    <button
                      onClick={() => onMarkAsReturned(loan.id)}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition"
                    >
                      ✅ Rendu à l'aîné (+40 pts)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Interventions & Arrival Management for Volunteer */}
      {myInterventions.length > 0 && (
        <div className={`rounded-3xl p-5 sm:p-6 shadow-md border-2 ${
          isDark ? 'bg-slate-900 border-indigo-500/50 text-white' : 'bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-amber-50/40 border-indigo-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 rounded-2xl bg-indigo-600 text-white shadow-xs">
                🧭
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-['Outfit']">
                    Mes Interventions en cours & Heure d'Arrivée
                  </h2>
                  <span className="text-xs bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                    {myInterventions.length} active{myInterventions.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prévenez l'aîné de votre heure d'arrivée, de votre trajet et de vos imprévus en direct.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {myInterventions.map((req) => {
              const isEnRoute = req.status === 'en_route';
              const isArrived = req.status === 'arrive';

              return (
                <div 
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition shadow-xs flex flex-col justify-between gap-4 ${
                    isArrived 
                      ? 'bg-emerald-500/10 border-emerald-400' 
                      : isEnRoute 
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-300' 
                      : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-200')
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Senior Info & Task */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isArrived 
                            ? 'bg-emerald-600 text-white' 
                            : isEnRoute 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {isArrived ? 'Arrivé à la porte' : isEnRoute ? 'En route' : 'Arrivée planifiée'}
                        </span>
                        {req.isDelayNotified && (
                          <span className="text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                            ⏳ Retard de 10 min signalé
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-bold">
                          {req.quartier}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black mt-1">
                        {req.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 mt-1">
                        <span>👴 {req.seniorName} ({req.age} ans)</span>
                        {req.seniorAddress && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            {req.seniorAddress}
                          </span>
                        )}
                      </div>

                      {req.arrivalNote && (
                        <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl">
                          « {req.arrivalNote} »
                        </p>
                      )}
                    </div>

                    {/* Prominent Arrival Time Display */}
                    <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3 flex-shrink-0 ${
                      isArrived
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : isEnRoute
                        ? 'bg-amber-500 text-stone-950 border-amber-600'
                        : (isDark ? 'bg-slate-900 border-indigo-400/50' : 'bg-indigo-50 border-indigo-200')
                    }`}>
                      <Clock className="w-7 h-7 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                          {isArrived ? 'Statut' : 'Arrivée annoncée'}
                        </span>
                        <div className="text-lg sm:text-xl font-black font-['Outfit']">
                          {isArrived ? 'À la porte de l\'aîné' : req.estimatedArrivalTime || '14h30'}
                        </div>
                        {req.arrivalTransport && (
                          <span className="text-xs font-bold block opacity-90">
                            {req.arrivalTransport}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progression Stepper */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Step 1: Depart button */}
                      {req.status === 'pris_en_charge' && onUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, 'en_route')}
                          className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>🚗 Je pars maintenant (En route)</span>
                        </button>
                      )}

                      {/* Step 2: Arrived button */}
                      {req.status === 'en_route' && onUpdateStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, 'arrive')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                        >
                          <span>🔔 Je suis arrivé (À sa porte)</span>
                        </button>
                      )}

                      {/* Add Delay button */}
                      {!isArrived && onAddDelay && (
                        <button
                          type="button"
                          onClick={() => onAddDelay(req.id)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center gap-1 cursor-pointer"
                          title="Prévenir l'aîné d'un retard de 10 minutes sans stress"
                        >
                          <span>⏳ +10 min retard</span>
                        </button>
                      )}

                      {/* Edit arrival time */}
                      {!isArrived && (
                        <button
                          type="button"
                          onClick={() => handleOpenArrivalModal(req)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center gap-1 cursor-pointer"
                          title="Modifier l'heure d'arrivée"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Changer l'heure</span>
                        </button>
                      )}

                      {/* Call Senior */}
                      {req.seniorPhone && (
                        <a
                          href={`tel:${req.seniorPhone.replace(/\s+/g, '')}`}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 transition flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-orange-500" />
                          <span>Appeler {req.seniorName}</span>
                        </a>
                      )}
                    </div>

                    {/* Mission Complete Button */}
                    {onConfirmResolved && (
                      <button
                        type="button"
                        onClick={() => onConfirmResolved(req.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mission accomplie (+50 XP)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Urgent Neighbor Needs in La Grande-Motte */}
      <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <div>
              <h2 className={`text-lg sm:text-xl font-black font-['Outfit'] ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Besoins d'aides prioritaires à {currentCity.name}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nos aînés attendent un coup de main dans leur quartier.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeRequests.map((req) => {
            const isAccepted = acceptedRequests.has(req.id) || req.status === 'pris_en_charge' || req.status === 'en_route' || req.status === 'arrive';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-3xl border-2 transition flex flex-col justify-between ${
                  req.urgency === 'urgent'
                    ? (isDark ? 'border-red-500/60 bg-red-950/30 text-white' : 'border-red-300 bg-red-50/50')
                    : (isDark ? 'border-slate-700 bg-slate-800/80 text-white' : 'border-slate-200 bg-slate-50/60')
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full ${
                      req.urgency === 'urgent'
                        ? 'bg-red-600 text-white animate-pulse'
                        : isDark
                        ? 'bg-orange-950/80 text-orange-300 border border-orange-700/60'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {req.urgency === 'urgent' ? 'Urgent aujourd\'hui' : 'Besoin du jour'}
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{req.timeAgo}</span>
                  </div>

                  <h3 className={`font-extrabold text-base leading-snug ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {req.title}
                  </h3>

                  <div className={`flex items-center gap-1.5 text-xs font-bold mt-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span>{req.seniorName} ({req.age} ans) · {req.quartier}</span>
                  </div>

                  <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {req.description}
                  </p>

                  {req.estimatedArrivalTime && isAccepted && (
                    <div className="mt-2.5 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Arrivée : {req.estimatedArrivalTime}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isDark ? 'border-slate-700' : 'border-slate-200/80'
                }`}>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                    isDark 
                      ? 'text-amber-300 bg-amber-950/80 border border-amber-800/60' 
                      : 'text-amber-700 bg-amber-100/80'
                  }`}>
                    +50 XP Citoyen
                  </span>

                  <button
                    onClick={() => handleOpenArrivalModal(req)}
                    disabled={isAccepted}
                    className={`font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      isAccepted
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pris en charge ✓</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Dire mon heure d'arrivée ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map of La Grande-Motte Key Solidarity Spots */}
      <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className={`text-lg sm:text-xl font-black font-['Outfit'] flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <MapPin className="w-5 h-5 text-orange-500" />
              <span>Points d'Entraide & Lieux Clés de {currentCity.name}</span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Repères pour les rendez-vous, le marché et les points de distribution solidaire.
            </p>
          </div>
          <button
            onClick={onGoToVillage}
            className={`text-xs font-bold hover:underline cursor-pointer ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`}
          >
            Explorer les 50 initiatives ➔
          </button>
        </div>

        {/* Visual Stylized Map of La Grande-Motte */}
        <div className={`rounded-2xl border-2 p-4 sm:p-6 relative overflow-hidden min-h-[260px] flex flex-col justify-between ${
          isDark 
            ? 'bg-slate-950/80 border-slate-700' 
            : 'bg-gradient-to-b from-sky-100 via-blue-50 to-amber-50 border-sky-200'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
            <div className={`p-3 rounded-xl border shadow-xs ${
              isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-sky-200'
            }`}>
              <span className="text-2xl block mb-1">🛒</span>
              <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Marché du 1er Octobre</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Place du Marché (Jeudi & Dimanche)</p>
            </div>

            <div className={`p-3 rounded-xl border shadow-xs ${
              isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-sky-200'
            }`}>
              <span className="text-2xl block mb-1">🌊</span>
              <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Plage du Point Zéro</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Marche douce & Gym adaptée</p>
            </div>

            <div className={`p-3 rounded-xl border shadow-xs ${
              isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-sky-200'
            }`}>
              <span className="text-2xl block mb-1">🥬</span>
              <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Jardin Partagé du Ponant</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Étang & Tomates d'antan</p>
            </div>

            <div className={`p-3 rounded-xl border shadow-xs ${
              isDark ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-sky-200'
            }`}>
              <span className="text-2xl block mb-1">🍲</span>
              <p className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Frigo Solidaire du Port</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dépôt & Paniers frais anti-gaspi</p>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-sky-200/80 text-slate-600'
          }`}>
            <span>📍 18 aînés ont besoin d'un jeune accompagnateur cette semaine à {currentCity.name}.</span>
            <span className="font-bold text-orange-500">Rejoindre une ronde</span>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 space-y-4 text-center ${
            isDark 
              ? 'bg-slate-900 border-amber-500/80 text-white' 
              : 'bg-white border-amber-300 text-slate-900'
          }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto ${
              isDark ? 'bg-amber-950/80 text-amber-300' : 'bg-amber-100 text-amber-600'
            }`}>
              📜
            </div>
            <div>
              <h3 className={`text-2xl font-black font-['Outfit'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Attestation d'Engagement Citoyen
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Programme ProxiLien · Ville Pilote de {currentCity.name}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs sm:text-sm text-left space-y-2 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <p>
                <strong className={isDark ? 'text-white' : ''}>Bénévole certifié :</strong> Lucas Valentin (Membre vérifié)
              </p>
              <p>
                <strong className={isDark ? 'text-white' : ''}>Actions réalisées :</strong> 14 missions d'entraide auprès de personnes âgées (courses, dépannage numérique, promenade accompagnée, veille canicule).
              </p>
              <p>
                <strong className={isDark ? 'text-white' : ''}>Total heures de bénévolat :</strong> 28 heures créditées
              </p>
              <p className={`text-[11px] pt-1 border-t ${
                isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                Ce certificat officiel peut être joint à votre CV, lettre de motivation ou dossier d'études universitaires.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md cursor-pointer"
              >
                Télécharger mon PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className={`font-bold py-3 px-5 rounded-xl text-sm cursor-pointer transition ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper Arrival Modal */}
      {selectedRequestForArrival && (
        <HelperArrivalModal
          isOpen={Boolean(selectedRequestForArrival)}
          request={selectedRequestForArrival}
          onClose={() => setSelectedRequestForArrival(null)}
          onConfirmArrival={handleConfirmArrivalFromModal}
          isDark={isDark}
        />
      )}
    </div>
  );
};
