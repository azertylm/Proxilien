import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  X, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  ShieldAlert, 
  UserCheck, 
  Volume2
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { speakText, stopSpeaking } from '../utils/speech';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, cityName }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isTriggered, setIsTriggered] = useState<boolean>(false);
  const [alertSentTime, setAlertSentTime] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isTriggered) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleConfirmSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isTriggered]);

  if (!isOpen) return null;

  const handleConfirmSOS = () => {
    setIsTriggered(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setAlertSentTime(timeStr);
    speakText("Urgence déclenchée. Restez calme. Vos trois voisins veilleurs de La Grande-Motte et les services de secours sont prévenus.");
  };

  const handleCancel = () => {
    stopSpeaking();
    setIsTriggered(false);
    setCountdown(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog" 
        aria-modal="true"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-500 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-red-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                URGENCE & ASSISTANCE (SOS)
              </h2>
              <p className="text-xs sm:text-sm text-red-100 font-semibold">
                {cityName} · Alerte Veilleurs & Secours
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer la fenêtre d'urgence"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {!isTriggered ? (
            /* Countdown Phase to avoid accidental triggers */
            <div className="text-center py-4 space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-8 border-red-200 border-t-red-600 animate-spin" />
                <div className="absolute font-black text-4xl sm:text-5xl text-red-600 font-['Outfit']">
                  {countdown}
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Envoi de l'alerte dans {countdown} secondes...
                </h3>
                <p className="text-slate-600 font-medium text-sm sm:text-base mt-1 max-w-md mx-auto">
                  Votre position GPS à <span className="font-bold text-slate-900">{cityName}</span> et votre appel seront automatiquement transmis à 3 voisins de garde et à votre famille.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="btn-sos-confirm-now"
                  onClick={handleConfirmSOS}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-red-600/30 text-base transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>Envoyer IMMÉDIATEMENT</span>
                </button>
                <button
                  id="btn-sos-cancel-countdown"
                  onClick={handleCancel}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-6 py-3.5 rounded-2xl text-base transition cursor-pointer"
                >
                  Annuler (Fausse manipulation)
                </button>
              </div>
            </div>
          ) : (
            /* Confirmed SOS View */
            <div className="space-y-4">
              {/* Green Confirmed Banner */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-black text-emerald-900 text-base">
                    Alerte transmise à {alertSentTime} !
                  </p>
                  <p className="text-emerald-800 font-medium mt-0.5">
                    3 voisins veilleurs à proximité dans votre quartier de {cityName} ont reçu votre notification avec votre adresse.
                  </p>
                </div>
              </div>

              {/* Location Badge */}
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Position transmise :</span>
                    <span>Quartier Le Couchant, Résidence Pyramide Soleil, 34280 {cityName}</span>
                  </div>
                </div>
                <button
                  onClick={() => speakText("Position transmise : Quartier Le Couchant à La Grande-Motte.")}
                  className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  title="Écouter l'adresse"
                >
                  <Volume2 className="w-4 h-4 text-orange-600" />
                </button>
              </div>

              {/* Direct Emergency Call Numbers (Huge touch targets) */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Appeler directement les secours :
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href="tel:15"
                    className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-2xl shadow-md transition font-black text-base"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚑</span>
                      <div>
                        <div className="text-xs text-red-100 uppercase tracking-wider">Médical</div>
                        <div>SAMU (15)</div>
                      </div>
                    </div>
                    <Phone className="w-5 h-5" />
                  </a>

                  <a
                    href="tel:18"
                    className="flex items-center justify-between bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-2xl shadow-md transition font-black text-base"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚒</span>
                      <div>
                        <div className="text-xs text-orange-100 uppercase tracking-wider">Chutes & Feu</div>
                        <div>Pompiers (18)</div>
                      </div>
                    </div>
                    <Phone className="w-5 h-5" />
                  </a>

                  <a
                    href="tel:112"
                    className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl shadow-md transition font-black text-base"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <div className="text-xs text-indigo-100 uppercase tracking-wider">Europe & Mobile</div>
                        <div>Urgences 112</div>
                      </div>
                    </div>
                    <Phone className="w-5 h-5" />
                  </a>

                  <a
                    href="tel:0467290303"
                    className="flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl shadow-md transition font-black text-base"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏛️</span>
                      <div>
                        <div className="text-xs text-emerald-100 uppercase tracking-wider">Mairie / CCAS</div>
                        <div>CCAS La Grande-Motte</div>
                      </div>
                    </div>
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Neighbors On-Call List */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  Voisins Veilleurs de garde notifiés :
                </h4>
                <div className="space-y-2">
                  {EMERGENCY_CONTACTS.filter(c => c.phone.startsWith('06')).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{contact.avatar}</span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{contact.name}</p>
                          <p className="text-xs text-slate-500">{contact.role} · <span className="text-emerald-600 font-bold">{contact.distance}</span></p>
                        </div>
                      </div>
                      <a
                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Appeler</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Medical Card reminder */}
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700">Fiche de secours associée à votre compte :</p>
                <p>Personne de confiance : Sophie (Fille) · Médecin traitant : Dr. Fabre (La Grande-Motte) · Allergies signalées : Aucune.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm cursor-pointer"
          >
            Fermer cette fenêtre
          </button>
          <span className="text-xs text-slate-500 hidden sm:inline">
            En cas de danger immédiat, composez toujours le 15 ou le 18.
          </span>
        </div>
      </div>
    </div>
  );
};
