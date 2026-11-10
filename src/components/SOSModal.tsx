import React, { useEffect } from 'react';
import { AlertTriangle, Phone, X, ShieldAlert, MessageSquare } from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
}

/**
 * Fenêtre d'urgence.
 *
 * ProxiLien n'a pas de serveur d'alerte : il ne prévient personne tout seul.
 * La fenêtre le dit clairement et met en avant les appels directs (gratuits,
 * possibles depuis tout téléphone, même sans crédit pour le 112), ainsi qu'un
 * SMS prêt à envoyer à un proche, que la personne choisit elle-même.
 */
const NUMEROS = [
  { tel: '15', titre: 'SAMU (15)', sous: 'Urgence médicale, malaise', emoji: '🚑', couleur: 'bg-red-600 hover:bg-red-700', clair: 'text-red-100' },
  { tel: '112', titre: 'Urgences (112)', sous: 'Depuis tout portable', emoji: '🚨', couleur: 'bg-indigo-600 hover:bg-indigo-700', clair: 'text-indigo-100' },
  { tel: '18', titre: 'Pompiers (18)', sous: 'Chute, incendie', emoji: '🚒', couleur: 'bg-orange-600 hover:bg-orange-700', clair: 'text-orange-100' },
  { tel: '17', titre: 'Police (17)', sous: 'Agression, intrusion', emoji: '👮', couleur: 'bg-slate-800 hover:bg-slate-900', clair: 'text-slate-300' },
] as const;

const SMS_PROCHE = "J'ai besoin d'aide, peux-tu m'appeler ou passer me voir ? (message envoyé depuis ProxiLien)";

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, cityName }) => {
  useEffect(() => {
    if (isOpen) {
      speakText("En cas d'urgence, appelez le 15 pour un problème de santé, ou le 112. ProxiLien ne prévient personne automatiquement.");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fermer = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-titre"
        className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-red-500 max-h-[88vh] flex flex-col text-sm"
      >
        {/* En-tête */}
        <div className="bg-red-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="sos-titre" className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                URGENCE : APPELEZ LES SECOURS
              </h2>
              <p className="text-xs sm:text-sm text-red-100 font-semibold">{cityName} · appel gratuit</p>
            </div>
          </div>
          <button
            onClick={fermer}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer la fenêtre d'urgence"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Ce que l'appli fait — et ne fait pas */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-black text-amber-900 text-base">ProxiLien ne prévient personne automatiquement.</p>
              <p className="text-amber-900 font-medium mt-0.5">
                Touchez un des numéros ci-dessous pour appeler vous-même. Si vous ne pouvez pas parler, le 114
                reçoit les SMS d'urgence.
              </p>
            </div>
          </div>

          {/* Appels directs (grandes zones tactiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NUMEROS.map((n) => (
              <a
                key={n.tel}
                href={`tel:${n.tel}`}
                className={`flex items-center justify-between ${n.couleur} text-white p-4 rounded-2xl shadow-md transition font-black text-lg`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>{n.emoji}</span>
                  <div>
                    <div className={`text-xs ${n.clair} uppercase tracking-wider`}>{n.sous}</div>
                    <div>{n.titre}</div>
                  </div>
                </div>
                <Phone className="w-6 h-6" />
              </a>
            ))}
          </div>

          <a
            href="sms:114"
            className="flex items-center justify-between bg-white border-2 border-slate-300 hover:bg-slate-50 p-3.5 rounded-2xl font-bold text-slate-900"
          >
            <span>✉️ SMS d'urgence 114 (sourds, malentendants, ou si vous ne pouvez pas parler)</span>
            <MessageSquare className="w-5 h-5 text-slate-600" />
          </a>

          {/* Prévenir un proche : c'est la personne qui choisit et envoie */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <p className="font-bold text-slate-900">Prévenir un proche</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Ouvre vos messages avec un texte prêt : choisissez le destinataire, puis envoyez.
            </p>
            <a
              href={`sms:?&body=${encodeURIComponent(SMS_PROCHE)}`}
              className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl"
            >
              <MessageSquare className="w-4 h-4" />
              Écrire à un proche
            </a>
          </div>

          <p className="text-xs text-slate-500">
            Mairie de La Grande-Motte (heures de bureau) :{' '}
            <a className="font-bold underline" href="tel:0467290303">04 67 29 03 03</a> · Police municipale :{' '}
            <a className="font-bold underline" href="tel:0467122222">04 67 12 22 22</a>
          </p>
        </div>

        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200">
          <button
            onClick={fermer}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm cursor-pointer"
          >
            Fermer cette fenêtre
          </button>
        </div>
      </div>
    </div>
  );
};
