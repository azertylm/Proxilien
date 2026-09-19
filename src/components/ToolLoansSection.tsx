import React, { useState } from 'react';
import { ToolLoan, CityInfo, ThemeConfig } from '../types';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Phone, 
  Volume2, 
  BellRing, 
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { speakText } from '../utils/speech';

interface ToolLoansSectionProps {
  loans: ToolLoan[];
  currentCity: CityInfo;
  themeConfig: ThemeConfig;
  onOpenNewLoanModal: () => void;
  onOpenReceipt: (loan: ToolLoan) => void;
  onMarkAsReturned: (loanId: string) => void;
  onSendReminder: (loanId: string) => void;
}

export const ToolLoansSection: React.FC<ToolLoansSectionProps> = ({
  loans,
  currentCity,
  themeConfig,
  onOpenNewLoanModal,
  onOpenReceipt,
  onMarkAsReturned,
  onSendReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'actifs' | 'historique'>('actifs');

  const activeLoans = loans.filter(l => l.status === 'en_cours' || l.status === 'retard');
  const returnedLoans = loans.filter(l => l.status === 'rendu');

  const isGold = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  const handleReadSummary = () => {
    if (activeLoans.length === 0) {
      speakText("Vous n'avez aucun outil prêté en ce moment. Vous pouvez prêter un outil en toute tranquillité en appuyant sur le gros bouton jaune.");
    } else {
      const summary = `Vous avez ${activeLoans.length} outil en cours de prêt : ${activeLoans.map(l => `${l.toolName} prêté à ${l.borrowerName}, retour prévu ${l.expectedReturnDate}`).join('. ')}. Tout est tracé avec un reçu de confiance.`;
      speakText(summary);
    }
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-7 border-2 transition-all w-full max-w-full overflow-hidden ${
      themeConfig.themeId === 'gold-white'
        ? 'bg-white border-amber-300 shadow-gold'
        : themeConfig.themeId === 'gold-dark'
        ? 'bg-stone-900 border-amber-500/80 text-white shadow-gold-lg'
        : themeConfig.themeId === 'dark'
        ? 'bg-slate-900 border-slate-700 text-white'
        : themeConfig.themeId === 'high-contrast'
        ? 'bg-black border-4 border-yellow-400 text-yellow-300'
        : 'bg-white border-slate-200 shadow-xs'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase px-3 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Traçabilité & Tranquillité d'esprit
            </span>
            <span className="text-xs text-stone-500 font-bold hidden sm:inline">
              {currentCity.name}
            </span>
          </div>

          <h2 className={`text-xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 ${
            isGold ? 'text-gold-gradient' : 'text-stone-900'
          }`}>
            <span>🤝 Prêt d'outils en Confiance</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
            Prêtez votre matériel (bricolage, jardin, cuisine) à un jeune voisin avec un reçu numérique, rappel automatique et suivi officiel.
          </p>
        </div>

        {/* Buttons: New Loan + Audio */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleReadSummary}
            className="p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
            title="Écouter l'état des prêts"
          >
            <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="hidden sm:inline">Écouter</span>
          </button>

          <button
            onClick={onOpenNewLoanModal}
            className="py-3 px-4 sm:px-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-2xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
            <span>Prêter un outil (3 clics)</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter: En cours vs Historique */}
      <div className="flex items-center gap-2 my-4">
        <button
          onClick={() => setActiveTab('actifs')}
          className={`py-2 px-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'actifs'
              ? 'bg-amber-500 text-stone-950 shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>En cours chez un jeune ({activeLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historique')}
          className={`py-2 px-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'historique'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Matériels bien restitués ({returnedLoans.length})</span>
        </button>
      </div>

      {/* ACTIVE LOANS LIST */}
      {activeTab === 'actifs' && (
        activeLoans.length === 0 ? (
          <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl">🧰</span>
            <h4 className="font-black text-base text-stone-800">Aucun outil prêté actuellement</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Une perceuse, une échelle ou un sécateur qui dort dans votre garage ? Prêtez-le à un jeune du quartier en toute sérénité.
            </p>
            <button
              onClick={onOpenNewLoanModal}
              className="mt-2 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer un nouveau prêt</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <div 
                key={loan.id}
                className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden"
              >
                {/* Top ribbon on card */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl p-1.5 bg-amber-100 rounded-xl flex-shrink-0">
                      {loan.icon || '🪚'}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-stone-400 block truncate">
                        Reçu {loan.receiptCode}
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-stone-900 truncate">
                        {loan.toolName}
                      </h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black flex-shrink-0">
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                    En cours
                  </span>
                </div>

                {/* Borrower details */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-bold">Emprunté par :</span>
                    <span className="font-black text-indigo-950 flex items-center gap-1">
                      <span>{loan.borrowerAvatar || '🧑'}</span>
                      <span>{loan.borrowerName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-bold">Quartier :</span>
                    <span className="font-bold text-stone-800">{loan.borrowerQuartier}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-amber-200/50">
                    <span className="text-amber-900 font-bold">Date de retour prévue :</span>
                    <span className="font-black text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                      {loan.expectedReturnDate} {loan.expectedReturnTime ? `(${loan.expectedReturnTime})` : ''}
                    </span>
                  </div>
                </div>

                {loan.notes && (
                  <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-200 line-clamp-1">
                    « {loan.notes} »
                  </p>
                )}

                {/* Actions on this card */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenReceipt(loan)}
                    className="flex-1 py-2 px-3 bg-white hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Voir le reçu officiel</span>
                  </button>

                  <button
                    onClick={() => onMarkAsReturned(loan.id)}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                    title="Indiquer que le jeune vous a rapporté l'outil"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Outil rendu</span>
                  </button>

                  <button
                    onClick={() => onSendReminder(loan.id)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl cursor-pointer transition"
                    title="Envoyer un rappel poli par SMS"
                    aria-label="Envoyer un rappel"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* RETURNED LOANS (HISTORY / TRACE) */}
      {activeTab === 'historique' && (
        <div className="space-y-2">
          {returnedLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => onOpenReceipt(loan)}
              className="bg-white hover:bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 cursor-pointer transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-1 bg-emerald-50 rounded-xl flex-shrink-0">
                  {loan.icon || '🪜'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-stone-900 truncate">
                      {loan.toolName}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-400">
                      {loan.receiptCode}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    Emprunté par <span className="font-bold text-stone-700">{loan.borrowerName}</span> ({loan.borrowerQuartier}) · Restitué le {loan.actualReturnDate || loan.expectedReturnDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Rendu
                </span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guarantee Footer Notice */}
      <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-500">
        <span className="flex items-center gap-1.5 font-bold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          Chaque prêt génère une preuve SMS + attestation numérique vérifiable par le CCAS.
        </span>
        <button
          onClick={onOpenNewLoanModal}
          className="text-amber-700 hover:underline font-black cursor-pointer"
        >
          + Prêter un autre équipement
        </button>
      </div>
    </div>
  );
};
