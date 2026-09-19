import React, { useState } from 'react';
import { ToolLoan } from '../types';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Phone, 
  Calendar, 
  Clock, 
  Volume2, 
  Printer, 
  Sparkles,
  MessageSquare,
  FileText
} from 'lucide-react';
import { speakText } from '../utils/speech';

interface ToolReceiptModalProps {
  loan: ToolLoan | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsReturned?: (loanId: string) => void;
  onSendReminder?: (loanId: string) => void;
}

export const ToolReceiptModal: React.FC<ToolReceiptModalProps> = ({
  loan,
  isOpen,
  onClose,
  onMarkAsReturned,
  onSendReminder,
}) => {
  const [smsSent, setSmsSent] = useState(false);

  if (!isOpen || !loan) return null;

  const handleReadAloud = () => {
    const speech = `Reçu officiel ProxiLien de prêt en confiance numéro ${loan.receiptCode}. Outil : ${loan.toolName}. Prêté par ${loan.lenderName} à ${loan.borrowerName}. Date de retour prévue : le ${loan.expectedReturnDate} à ${loan.expectedReturnTime || '18h'}. Tout est tracé et enregistré.`;
    speakText(speech);
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3500);
  };

  const isReturned = loan.status === 'rendu';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ribbon: Reçu Officiel de Prêt */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Registre ProxiLien
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                Reçu de Prêt en Confiance
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer le reçu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content: Paper Receipt Look */}
        <div className="p-5 sm:p-7 space-y-5 bg-[#FAF8F5]">
          {/* Status Badge */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-stone-300 pb-3">
            <div>
              <span className="text-xs text-stone-500 font-bold block">Numéro d'enregistrement</span>
              <span className="font-mono font-black text-amber-800 text-base sm:text-lg tracking-wider">
                {loan.receiptCode}
              </span>
            </div>

            <div className="text-right">
              {isReturned ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Rendu avec soin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs sm:text-sm font-black">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  En cours de prêt
                </span>
              )}
            </div>
          </div>

          {/* Tool Details Card */}
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2 bg-amber-100 rounded-xl flex-shrink-0">
                {loan.icon || '🧰'}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black uppercase text-amber-700 tracking-wide">
                  Matériel prêté
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  {loan.toolName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-bold">
                    État : {loan.condition === 'neuf' ? 'Neuf' : loan.condition === 'excellent' ? 'Très bon état' : 'Bon état d\'usage'}
                  </span>
                </div>
              </div>
            </div>

            {loan.notes && (
              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 italic">
                « {loan.notes} »
              </p>
            )}
          </div>

          {/* Borrower & Lender details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Prêteur */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">
                Prêté par (Aîné)
              </span>
              <p className="font-black text-stone-900 text-sm sm:text-base mt-0.5">
                👴 {loan.lenderName}
              </p>
              {loan.lenderPhone && (
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 font-semibold">
                  <Phone className="w-3 h-3 text-stone-400" />
                  {loan.lenderPhone}
                </p>
              )}
            </div>

            {/* Emprunteur */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block">
                Emprunté par (Jeune voisin)
              </span>
              <p className="font-black text-indigo-950 text-sm sm:text-base mt-0.5">
                🧑 {loan.borrowerName}
              </p>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1 font-semibold">
                <Phone className="w-3 h-3 text-indigo-500" />
                {loan.borrowerPhone}
              </p>
              <span className="text-[10px] text-stone-400 block">
                Quartier : {loan.borrowerQuartier}
              </span>
            </div>
          </div>

          {/* Dates & Timeline */}
          <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-600 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                Date du prêt :
              </span>
              <span className="font-black text-stone-900">{loan.loanDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-amber-900 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Retour convenu :
              </span>
              <span className="font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                {loan.expectedReturnDate} {loan.expectedReturnTime ? `(${loan.expectedReturnTime})` : ''}
              </span>
            </div>

            {loan.actualReturnDate && (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-amber-200/60">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Restitué le :
                </span>
                <span className="font-black text-emerald-800">{loan.actualReturnDate}</span>
              </div>
            )}
          </div>

          {/* Trust Seal */}
          <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-900 p-3 rounded-2xl border border-emerald-200">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-black">Garantie Voisin de Confiance ProxiLien</p>
              <p className="text-emerald-800">
                L'emprunteur s'engage moralement à restituer l'outil nettoyé et fonctionnel. En cas de pépin, le CCAS et ProxiLien accompagnent les deux voisins.
              </p>
            </div>
          </div>

          {/* Toast message if SMS sent */}
          {smsSent && (
            <div className="bg-slate-900 text-white p-3 rounded-xl text-center text-xs font-bold animate-in fade-in">
              📲 SMS de confirmation envoyé à {loan.borrowerPhone} et au prêteur !
            </div>
          )}

          {/* Actions on this loan */}
          <div className="space-y-2 pt-2">
            {!isReturned && onMarkAsReturned && (
              <button
                onClick={() => {
                  onMarkAsReturned(loan.id);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Outil rendu en bon état (Clôturer le prêt)</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSendSms}
                className="py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Renvoyer SMS</span>
              </button>

              <button
                onClick={handleReadAloud}
                className="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Volume2 className="w-4 h-4 text-orange-600" />
                <span>Lire à voix haute</span>
              </button>
            </div>

            {!isReturned && onSendReminder && (
              <button
                onClick={() => {
                  onSendReminder(loan.id);
                  handleSendSms();
                }}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <span>🔔 Envoyer un petit rappel courtois au jeune par SMS</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-3 text-center border-t border-stone-200">
          <p className="text-[11px] text-stone-500 font-semibold">
            ProxiLien · Ville de La Grande-Motte · Registre local et sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};
