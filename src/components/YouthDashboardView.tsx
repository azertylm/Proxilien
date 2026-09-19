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
  FileCheck
} from 'lucide-react';
import { CityInfo, HelpRequest, ToolLoan } from '../types';
import { INITIAL_HELP_REQUESTS, NEIGHBORS_DATA } from '../data/mockData';

interface YouthDashboardViewProps {
  currentCity: CityInfo;
  activeRequests: HelpRequest[];
  toolLoans?: ToolLoan[];
  onTakeHelpRequest: (reqId: string) => void;
  onGoToVillage: () => void;
  onOpenReceipt?: (loan: ToolLoan) => void;
  onMarkAsReturned?: (loanId: string) => void;
}

export const YouthDashboardView: React.FC<YouthDashboardViewProps> = ({
  currentCity,
  activeRequests,
  toolLoans = [],
  onTakeHelpRequest,
  onGoToVillage,
  onOpenReceipt,
  onMarkAsReturned,
}) => {
  const [userPoints, setUserPoints] = useState<number>(340);
  const [acceptedRequests, setAcceptedRequests] = useState<Set<string>>(new Set());
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  const handleAcceptMission = (req: HelpRequest) => {
    onTakeHelpRequest(req.id);
    const newSet = new Set(acceptedRequests);
    newSet.add(req.id);
    setAcceptedRequests(newSet);
    setUserPoints(prev => prev + 50);
  };

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
                className="mt-1.5 text-xs text-white font-extrabold hover:underline flex items-center gap-1 text-amber-300"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Mon Attestation d'Engagement</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Borrowed Tools Section for Youth */}
      {toolLoans.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧰</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                  Matériels & Outils prêtés par vos aînés
                </h2>
                <p className="text-xs text-slate-600">
                  Prêt en confiance ProxiLien avec reçu numérique et rappel bienveillant.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toolLoans.map((loan) => (
              <div 
                key={loan.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-1.5 bg-amber-50 rounded-xl">{loan.icon || '🪚'}</span>
                      <div>
                        <span className="text-[10px] font-mono text-amber-700 font-bold">
                          {loan.receiptCode}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                          {loan.toolName}
                        </h3>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      loan.status === 'rendu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {loan.status === 'rendu' ? 'Restitué' : 'À rapporter'}
                    </span>
                  </div>

                  <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prêté par :</span>
                      <span className="font-bold text-slate-800">👴 {loan.lenderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Retour convenu :</span>
                      <span className="font-black text-amber-900">{loan.expectedReturnDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  {onOpenReceipt && (
                    <button
                      onClick={() => onOpenReceipt(loan)}
                      className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold border border-amber-300 transition cursor-pointer"
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

      {/* Urgent Neighbor Needs in La Grande-Motte */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">
                Besoins d'aides prioritaires à {currentCity.name}
              </h2>
              <p className="text-xs text-slate-500">
                Nos aînés attendent un coup de main dans leur quartier.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeRequests.map((req) => {
            const isAccepted = acceptedRequests.has(req.id) || req.status === 'pris_en_charge';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-3xl border-2 transition flex flex-col justify-between ${
                  req.urgency === 'urgent'
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full ${
                      req.urgency === 'urgent'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {req.urgency === 'urgent' ? 'Urgent aujourd\'hui' : 'Besoin du jour'}
                    </span>
                    <span className="text-slate-500">{req.timeAgo}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {req.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{req.seniorName} ({req.age} ans) · {req.quartier}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                    +50 XP Citoyen
                  </span>

                  <button
                    onClick={() => handleAcceptMission(req)}
                    disabled={isAccepted}
                    className={`font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      isAccepted
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pris en charge ✓</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 fill-current" />
                        <span>J'y vais !</span>
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>Points d'Entraide & Lieux Clés de {currentCity.name}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Repères pour les rendez-vous, le marché et les points de distribution solidaire.
            </p>
          </div>
          <button
            onClick={onGoToVillage}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Explorer les 50 initiatives ➔
          </button>
        </div>

        {/* Visual Stylized Map of La Grande-Motte */}
        <div className="bg-gradient-to-b from-sky-100 via-blue-50 to-amber-50 rounded-2xl border-2 border-sky-200 p-4 sm:p-6 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-sky-200 shadow-xs">
              <span className="text-2xl block mb-1">🛒</span>
              <p className="font-extrabold text-xs text-slate-900">Marché du 1er Octobre</p>
              <p className="text-[11px] text-slate-500">Place du Marché (Jeudi & Dimanche)</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-sky-200 shadow-xs">
              <span className="text-2xl block mb-1">🌊</span>
              <p className="font-extrabold text-xs text-slate-900">Plage du Point Zéro</p>
              <p className="text-[11px] text-slate-500">Marche douce & Gym adaptée</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-sky-200 shadow-xs">
              <span className="text-2xl block mb-1">🥬</span>
              <p className="font-extrabold text-xs text-slate-900">Jardin Partagé du Ponant</p>
              <p className="text-[11px] text-slate-500">Étang & Tomates d'antan</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-sky-200 shadow-xs">
              <span className="text-2xl block mb-1">🍲</span>
              <p className="font-extrabold text-xs text-slate-900">Frigo Solidaire du Port</p>
              <p className="text-[11px] text-slate-500">Dépôt & Paniers frais anti-gaspi</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>📍 18 aînés ont besoin d'un jeune accompagnateur cette semaine à La Grande-Motte.</span>
            <span className="font-bold text-orange-600">Rejoindre une ronde</span>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto">
              📜
            </div>
            <div>
              <h3 className="text-2xl font-black font-['Outfit'] text-slate-900">
                Attestation d'Engagement Citoyen
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Programme ProxiLien · Ville Pilote de {currentCity.name}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-left space-y-2">
              <p>
                <strong>Bénévole certifié :</strong> Lucas Valentin (Membre vérifié)
              </p>
              <p>
                <strong>Actions réalisées :</strong> 14 missions d'entraide auprès de personnes âgées (courses, dépannage numérique, promenade accompagnée, veille canicule).
              </p>
              <p>
                <strong>Total heures de bénévolat :</strong> 28 heures créditées
              </p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                Ce certificat officiel peut être joint à votre CV, lettre de motivation ou dossier d'études universitaires.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  alert("Attestation téléchargée au format PDF !");
                  setShowCertificateModal(false);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm shadow-md"
              >
                Télécharger mon PDF
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
