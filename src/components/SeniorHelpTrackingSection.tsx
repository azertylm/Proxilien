import React from 'react';
import { 
  Clock, 
  Phone, 
  Volume2, 
  CheckCircle2, 
  Navigation, 
  MessageSquare,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { HelpRequest, TextSize, ThemeConfig } from '../types';
import { speakText } from '../utils/speech';

interface SeniorHelpTrackingSectionProps {
  requests: HelpRequest[];
  textSize: TextSize;
  themeConfig: ThemeConfig;
  onConfirmResolved: (reqId: string) => void;
  onSimulateNeighborArrival?: (reqId: string) => void;
}

export const SeniorHelpTrackingSection: React.FC<SeniorHelpTrackingSectionProps> = ({
  requests,
  textSize,
  themeConfig,
  onConfirmResolved,
  onSimulateNeighborArrival,
}) => {
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  const inProgressRequests = requests.filter(r => r.status === 'pris_en_charge' || r.status === 'en_route' || r.status === 'arrive');
  const pendingRequests = requests.filter(r => r.status === 'en_attente');

  if (inProgressRequests.length === 0 && pendingRequests.length === 0) {
    return null;
  }

  const titleScaleClass =
    textSize === 'giant' ? 'text-2xl sm:text-3xl' :
    textSize === 'xlarge' ? 'text-xl sm:text-2xl' : 
    textSize === 'large' ? 'text-lg sm:text-xl' :
    'text-base sm:text-lg';

  return (
    <div className="space-y-3 w-full">
      {/* 1. Requests with a Neighbor on their way / Arriving */}
      {inProgressRequests.map((req) => {
        const isArrived = req.status === 'arrive';
        const isEnRoute = req.status === 'en_route';

        const audioSpeech = `Bonne nouvelle ! Votre voisin ${req.helperName || 'bénévole'} a pris en charge votre demande : ${req.title}. Heure d'arrivée annoncée : ${req.estimatedArrivalTime || 'bientôt'}. ${req.arrivalNote ? `Il vous a laissé ce mot : ${req.arrivalNote}` : ''}`;

        return (
          <div
            key={req.id}
            id={`senior-tracking-request-${req.id}`}
            className={`rounded-2xl p-4 sm:p-5 border-2 shadow-md transition-all ${
              isArrived
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500'
                : isEnRoute
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-500'
                : isGold
                ? 'bg-amber-50/90 dark:bg-stone-900 border-amber-400 shadow-gold'
                : isDark
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-amber-300'
            }`}
          >
            {/* Header: Status + Title + Audio (Single row, no nested boxes) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-amber-200/60 dark:border-slate-800 w-full">
              <div className="flex items-start sm:items-center gap-2.5 w-full flex-1 min-w-0">
                <span className="text-2xl sm:text-3xl p-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/80 flex-shrink-0 mt-0.5 sm:mt-0">
                  {isArrived ? '🔔' : isEnRoute ? '🚗' : '🌟'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isArrived 
                        ? 'bg-emerald-600 text-white' 
                        : isEnRoute 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}>
                      {isArrived ? 'Voisin Arrivé à votre porte !' : isEnRoute ? 'En route vers chez vous' : 'Pris en charge par un voisin'}
                    </span>
                    {req.isDelayNotified && (
                      <span className="text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full">
                        ⏳ +10 min de retard
                      </span>
                    )}
                  </div>
                  <h2 className={`font-black tracking-tight mt-1 break-words ${titleScaleClass} ${
                    isGold ? 'text-amber-900 dark:text-amber-300' : (isDark ? 'text-white' : 'text-slate-950')
                  }`}>
                    {req.title}
                  </h2>
                </div>
              </div>

              {/* Read Aloud Button */}
              <button
                type="button"
                id={`btn-listen-tracking-${req.id}`}
                onClick={() => speakText(audioSpeech)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition cursor-pointer flex-shrink-0 self-start sm:self-auto"
                title="Écouter l'annonce à voix haute"
              >
                <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Écouter</span>
              </button>
            </div>

            {/* Core Info Area: OPEN LAYOUT WITHOUT NESTED CARDS */}
            <div className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              {/* Arrival Time & Transport (Direct typography, no inner bordered card) */}
              <div className="flex items-start gap-3 w-full md:w-auto flex-1 min-w-0">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  isArrived ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'
                }`}>
                  <Clock className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 block">
                    {isArrived ? 'Statut actuel' : 'Heure d\'arrivée annoncée'}
                  </span>
                  <div className="text-xl sm:text-3xl font-black tracking-tight leading-tight text-slate-950 dark:text-white break-words">
                    {isArrived ? 'À votre porte maintenant !' : req.estimatedArrivalTime || 'Vers 14h30'}
                  </div>
                  {req.arrivalTransport && (
                    <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5 break-words">
                      <Navigation className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                      <span>Déplacement : {req.arrivalTransport}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Helper Details & Call (Open typography, NO card inside card) */}
              <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap w-full md:w-auto">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-3xl p-1 rounded-xl bg-orange-100/70 dark:bg-slate-800 flex-shrink-0">
                    {req.helperAvatar || '🧑‍🎓'}
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                      Votre voisin veilleur
                    </span>
                    <div className="font-black text-sm sm:text-base text-slate-900 dark:text-white break-words">
                      {req.helperName || 'Lucas Valentin'}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{req.helperRole || 'Jeune voisin certifié'}</span>
                    </span>
                  </div>
                </div>

                {req.helperPhone && (
                  <a
                    href={`tel:${req.helperPhone.replace(/\s+/g, '')}`}
                    id={`btn-call-helper-${req.id}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition flex-shrink-0"
                    title={`Appeler ${req.helperName}`}
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>Appeler</span>
                  </a>
                )}
              </div>
            </div>

            {/* Note from Helper (Direct message accent, NO surrounding card box) */}
            {req.arrivalNote && (
              <div className="border-l-3 border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 px-3 py-1.5 rounded-r-lg my-2 flex items-start gap-2 w-full">
                <MessageSquare className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-words flex-1 min-w-0">
                  <span className="font-bold text-orange-700 dark:text-orange-400 mr-1">Mot du voisin :</span>
                  <span className="italic">« {req.arrivalNote} »</span>
                </p>
              </div>
            )}

            {/* Action Bar for Senior */}
            <div className="pt-2 border-t border-amber-200/50 dark:border-slate-800 flex items-center justify-end w-full">
              <button
                type="button"
                id={`btn-confirm-resolved-${req.id}`}
                onClick={() => onConfirmResolved(req.id)}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-98 text-center break-words"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5] flex-shrink-0" />
                <span className="leading-tight">C'est fait, merci ! (Valider le coup de main)</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* 2. Pending Requests waiting for a Neighbor */}
      {pendingRequests.map((req) => (
        <div
          key={req.id}
          id={`senior-pending-request-${req.id}`}
          className={`rounded-2xl p-3.5 sm:p-4 border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-amber-200 text-slate-900 shadow-xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3 w-full flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xl font-black flex-shrink-0 mt-0.5 sm:mt-0">
              ⏳
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs uppercase font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  En attente d'un voisin
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{req.timeAgo}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white break-words line-clamp-2 leading-snug">
                {req.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 break-words leading-relaxed mt-0.5">
                Diffusé aux voisins veilleurs de votre quartier.
              </p>
            </div>
          </div>

          {onSimulateNeighborArrival && (
            <button
              type="button"
              id={`btn-simulate-arrival-${req.id}`}
              onClick={() => onSimulateNeighborArrival(req.id)}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition flex-shrink-0 self-end sm:self-auto w-full sm:w-auto"
              title="Tester le système d'arrivée d'un voisin"
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Simuler l'arrivée</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
