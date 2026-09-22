import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Heart, 
  X, 
  Sparkles, 
  AlertCircle,
  Phone,
  Navigation,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { HelpRequest } from '../types';

interface HelperArrivalModalProps {
  isOpen: boolean;
  request: HelpRequest | null;
  onClose: () => void;
  onConfirmArrival: (
    reqId: string, 
    arrivalData: {
      estimatedTime: string;
      transport: string;
      arrivalNote: string;
      helperPhone: string;
    }
  ) => void;
  isDark?: boolean;
}

export const HelperArrivalModal: React.FC<HelperArrivalModalProps> = ({
  isOpen,
  request,
  onClose,
  onConfirmArrival,
  isDark = false,
}) => {
  // Preset time choices
  const QUICK_TIMES = [
    { label: 'Dans 15 minutes', icon: '⚡', badge: 'Ultra rapide' },
    { label: 'Dans 30 minutes', icon: '⏱️', badge: 'Recommandé' },
    { label: 'Dans 1 heure', icon: '🕒', badge: 'Prochain créneau' },
    { label: 'À 14h00', icon: '☀️', badge: 'Début d\'après-midi' },
    { label: 'À 16h30', icon: '☕', badge: 'Goûter / Fin d\'aprèm' },
    { label: 'Ce soir vers 18h00', icon: '🌇', badge: 'Soirée' },
  ];

  const TRANSPORTS = [
    { id: 'À pied (3-5 min)', label: 'À pied', icon: '🚶' },
    { id: 'À vélo (5-10 min)', label: 'À vélo', icon: '🚲' },
    { id: 'En voiture (10 min)', label: 'En voiture', icon: '🚗' },
  ];

  const NOTE_PRESETS = [
    "J'apporte mes outils et j'arrive avec plaisir !",
    "Je termine mes cours et je passe directement.",
    "Je vous appelle dès que je suis devant votre entrée.",
    "J'ai mon vélo, je serai là à l'heure pile !",
  ];

  const [selectedTime, setSelectedTime] = useState<string>('Dans 20 minutes (14h30)');
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState<boolean>(false);
  const [selectedTransport, setSelectedTransport] = useState<string>('À pied (3-5 min)');
  const [arrivalNote, setArrivalNote] = useState<string>("Bonjour ! Je viens vous donner un coup de main avec grand plaisir.");
  const [helperPhone, setHelperPhone] = useState<string>('06 12 34 56 78');

  if (!isOpen || !request) return null;

  const finalTime = useCustomTime && customTime.trim() ? customTime.trim() : selectedTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmArrival(request.id, {
      estimatedTime: finalTime,
      transport: selectedTransport,
      arrivalNote: arrivalNote.trim(),
      helperPhone: helperPhone.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className={`w-full max-w-xl rounded-3xl border-2 shadow-2xl p-5 sm:p-7 relative transition-all my-8 ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-white' 
            : 'bg-white border-orange-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition cursor-pointer ${
            isDark 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0">
            ⏰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Action Solidaire Voisins
              </span>
              <span className="text-xs text-orange-600 font-extrabold">+50 pts XP</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] mt-0.5">
              À quelle heure arrivez-vous ?
            </h2>
          </div>
        </div>

        {/* Mission Reminder Banner */}
        <div className={`p-4 rounded-2xl border mb-5 flex items-start gap-3 ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700' 
            : 'bg-orange-50/70 border-orange-200'
        }`}>
          <div className="text-2xl flex-shrink-0">👴</div>
          <div className="min-w-0">
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {request.seniorName} ({request.age} ans) · <span className="text-orange-600 dark:text-orange-400 font-extrabold">{request.quartier}</span>
            </h3>
            <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 line-clamp-1">
              « {request.title} »
            </p>
            {request.seniorAddress && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>{request.seniorAddress}</span>
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Step 1: Arrival Time */}
          <div>
            <label className="block text-sm sm:text-base font-black mb-2 flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>1. Choisissez votre heure d'arrivée :</span>
            </label>

            {/* Quick choices grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TIMES.map((qt) => {
                const isSelected = !useCustomTime && selectedTime === qt.label;
                return (
                  <button
                    key={qt.label}
                    type="button"
                    onClick={() => {
                      setSelectedTime(qt.label);
                      setUseCustomTime(false);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/15 text-orange-950 dark:text-orange-200 font-black shadow-xs ring-2 ring-orange-400'
                        : isDark
                        ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg">{qt.icon}</span>
                      <span className="text-[10px] font-bold opacity-75">{qt.badge}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold mt-1">{qt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Time Selector */}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseCustomTime(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  useCustomTime
                    ? 'bg-orange-600 text-white border-orange-600'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Autre heure précise
              </button>
              {useCustomTime && (
                <input
                  type="text"
                  placeholder="Ex : 15h15, ou dans 45 minutes"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDark 
                      ? 'bg-slate-800 border-slate-700 text-white' 
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Step 2: Transport Mode */}
          <div>
            <label className="block text-sm sm:text-base font-black mb-2 flex items-center gap-1.5 text-slate-900 dark:text-white">
              <Navigation className="w-4 h-4 text-indigo-500" />
              <span>2. Comment venez-vous ? (Rassure l'aîné) :</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSPORTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTransport(t.id)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedTransport === t.id
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 font-black shadow-xs ring-2 ring-indigo-400'
                      : isDark
                      ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Friendly Note */}
          <div>
            <label className="block text-sm sm:text-base font-black mb-1.5 flex items-center gap-1.5 text-slate-900 dark:text-white">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>3. Message bienveillant pour l'aîné :</span>
            </label>

            {/* Quick note buttons */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {NOTE_PRESETS.map((np) => (
                <button
                  key={np}
                  type="button"
                  onClick={() => setArrivalNote(np)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    arrivalNote === np
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  « {np.slice(0, 30)}... »
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={arrivalNote}
              onChange={(e) => setArrivalNote(e.target.value)}
              placeholder="Ex: Bonjour Simone, je passe avec mon vélo et mon sac pour porter l'eau !"
              className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Step 4: Contact Number */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>Votre numéro (pour que l'aîné puisse vous joindre si besoin) :</span>
              </label>
              <input
                type="tel"
                value={helperPhone}
                onChange={(e) => setHelperPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Confirmation Preview Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
            <span className="text-2xl">📢</span>
            <div className="text-xs sm:text-sm font-medium">
              <span className="font-black text-amber-900 dark:text-amber-300">
                {request.seniorName} sera notifié immédiatement :
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                « Arrivée annoncée : <strong className="text-orange-600 dark:text-orange-400">{finalTime}</strong> ({selectedTransport}) »
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                isDark 
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black px-6 py-3 rounded-xl text-sm sm:text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 border border-amber-200"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Confirmer mon arrivée à {finalTime} ➔</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
