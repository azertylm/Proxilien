import React from 'react';
import { AlertTriangle, Clock, KeyRound, Sparkles, X } from 'lucide-react';

interface AlphabetteQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscriptionModal: () => void;
  requestsUsed: number;
  dailyLimit: number;
}

export const AlphabetteQuotaModal: React.FC<AlphabetteQuotaModalProps> = ({
  isOpen,
  onClose,
  onOpenSubscriptionModal,
  requestsUsed,
  dailyLimit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-stone-950 text-white rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-5 flex items-center justify-between border-b border-red-500/40">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-600 text-white animate-bounce shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black font-['Outfit'] text-white">
                Quota Quotidien Atteint ⏳
              </h2>
              <p className="text-xs text-amber-300 font-semibold">
                Consommation : {requestsUsed} / {dailyLimit} requêtes utilisées aujourd'hui
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-sm leading-relaxed">
            Votre quota quotidien gratuit est atteint. Pour bénéficier d'un accès instantané et sans restriction, activez votre abonnement annuel et renseignez votre propre clé API dans votre espace Alphabette.
          </div>

          <div className="text-xs text-stone-400 space-y-1 font-medium">
            <p>💡 <strong>Rappel :</strong> L'accès est 100% offert et illimité pour les habitants de La Grande-Motte (avec géolocalisation validée).</p>
            <p>🔑 <strong>Mode BYOK :</strong> Vos clés personnelles (Mistral, Google, OpenAI, etc.) garantissent l'illimité sans bridage.</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Revenir demain</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubscriptionModal();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-400 text-stone-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <KeyRound className="w-4 h-4 text-stone-950" />
              <span>S'abonner & Configurer ma clé BYOK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
