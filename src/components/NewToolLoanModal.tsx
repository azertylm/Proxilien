import React, { useState } from 'react';
import { CityInfo, ToolLoan } from '../types';
import { 
  X, 
  Check, 
  Mic, 
  MicOff, 
  Wrench, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Camera, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { speakText } from '../utils/speech';

interface NewToolLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityInfo;
  onLoanCreated: (loan: ToolLoan) => void;
}

// Popular tools quick pick for seniors to avoid tedious typing
const POPULAR_TOOLS = [
  { name: 'Perceuse / Visseuse sans fil', icon: '🪚', category: 'bricolage' as const },
  { name: 'Escabeau sécurisé 4-5 marches', icon: '🪜', category: 'maison' as const },
  { name: 'Tondeuse à gazon', icon: '🌿', category: 'jardin' as const },
  { name: 'Taille-haie télescopique', icon: '✂️', category: 'jardin' as const },
  { name: 'Caisse à outils complète', icon: '🧰', category: 'bricolage' as const },
  { name: 'Nettoyeur haute pression (Kärcher)', icon: '🧹', category: 'maison' as const },
  { name: 'Diable de transport pliable', icon: '📦', category: 'maison' as const },
  { name: 'Machine à coudre', icon: '🧵', category: 'loisirs' as const },
  { name: 'Appareil à raclette / Crêpière', icon: '🍳', category: 'cuisine' as const },
  { name: 'Pompe à vélo avec manomètre', icon: '🚲', category: 'loisirs' as const },
];

// Verified young neighbors in La Grande-Motte to pick in 1 tap
const VERIFIED_NEIGHBORS = [
  { name: 'Lucas V. (22 ans)', phone: '06 12 34 56 78', quartier: 'Le Couchant', avatar: '🧑' },
  { name: 'Sarah B. (24 ans)', phone: '07 89 01 23 45', quartier: 'Point Zéro', avatar: '👩' },
  { name: 'Emma R. (23 ans)', phone: '06 45 67 89 10', quartier: 'Le Port', avatar: '👩‍🎨' },
  { name: 'Maxime D. (26 ans)', phone: '06 55 66 77 88', quartier: 'Ponant', avatar: '🧑‍🌾' },
];

// Return timeline presets
const RETURN_PRESETS = [
  { label: 'Ce soir (19h)', days: 0, time: '19h00' },
  { label: 'Demain soir (18h30)', days: 1, time: '18h30' },
  { label: 'Après-demain', days: 2, time: '18h00' },
  { label: 'Ce week-end (Dimanche)', days: 3, time: '17h00' },
  { label: 'Dans 1 semaine', days: 7, time: '18h00' },
];

export const NewToolLoanModal: React.FC<NewToolLoanModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onLoanCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedTool, setSelectedTool] = useState(POPULAR_TOOLS[0]);
  const [customToolName, setCustomToolName] = useState('');
  const [isCustomTool, setIsCustomTool] = useState(false);
  const [toolCondition, setToolCondition] = useState<'neuf' | 'excellent' | 'bon'>('excellent');

  // Borrower State
  const [selectedNeighbor, setSelectedNeighbor] = useState(VERIFIED_NEIGHBORS[0]);
  const [isCustomBorrower, setIsCustomBorrower] = useState(false);
  const [customBorrowerName, setCustomBorrowerName] = useState('');
  const [customBorrowerPhone, setCustomBorrowerPhone] = useState('');

  // Return date state
  const [selectedReturnPreset, setSelectedReturnPreset] = useState(RETURN_PRESETS[1]);
  const [notes, setNotes] = useState('');

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setNotes('Prêté complet avec la boîte et les accessoires. Retour convenu en fin de journée.');
        speakText('Prêt dicté avec succès.');
      }, 2500);
    }
  };

  const handleSelectPresetTool = (tool: typeof POPULAR_TOOLS[0]) => {
    setSelectedTool(tool);
    setIsCustomTool(false);
  };

  const handleCreateLoan = () => {
    const toolFinalName = isCustomTool ? (customToolName || 'Outil divers') : selectedTool.name;
    const borrowerFinalName = isCustomBorrower ? (customBorrowerName || 'Jeune voisin') : selectedNeighbor.name;
    const borrowerFinalPhone = isCustomBorrower ? (customBorrowerPhone || '06 00 00 00 00') : selectedNeighbor.phone;
    const borrowerFinalQuartier = isCustomBorrower ? 'Quartier local' : selectedNeighbor.quartier;

    // Generate readable receipt number
    const randomCode = `PRET-LGM-${Math.floor(100 + Math.random() * 900)}`;

    const newLoan: ToolLoan = {
      id: `loan-${Date.now()}`,
      toolName: toolFinalName,
      category: selectedTool.category,
      icon: isCustomTool ? '🧰' : selectedTool.icon,
      condition: toolCondition,
      lenderName: 'Jean P. (Vous)',
      lenderPhone: '06 44 22 11 00',
      borrowerName: borrowerFinalName,
      borrowerPhone: borrowerFinalPhone,
      borrowerQuartier: borrowerFinalQuartier,
      borrowerAvatar: isCustomBorrower ? '🧑' : selectedNeighbor.avatar,
      loanDate: "Aujourd'hui",
      expectedReturnDate: selectedReturnPreset.label,
      expectedReturnTime: selectedReturnPreset.time,
      status: 'en_cours',
      notes: notes.trim() || undefined,
      trustGuarantee: 'Certifié ProxiLien Confiance · Voisins Veilleurs',
      receiptCode: randomCode,
      smsConfirmationSent: true,
    };

    onLoanCreated(newLoan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🤝
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Prêt en Confiance · {currentCity.name}
              </span>
              <h2 className="text-lg sm:text-2xl font-black">
                Prêter un outil à un jeune
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Fermer la fenêtre"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3 Steps Progress Bar */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs font-black">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-amber-900' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? 'bg-amber-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span>1. L'Outil</span>
          </div>

          <span className="text-amber-300">➔</span>

          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-amber-900' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? 'bg-amber-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-stone-200'}`}>
              {step > 2 ? '✓' : '2'}
            </span>
            <span>2. Le Voisin</span>
          </div>

          <span className="text-amber-300">➔</span>

          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-amber-900' : 'text-stone-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-amber-600 text-white' : 'bg-stone-200'}`}>
              3
            </span>
            <span>3. La Date</span>
          </div>
        </div>

        {/* Step Contents */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Choisir l'outil */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Quel outil souhaitez-vous prêter ?
                </h3>
                <p className="text-xs text-stone-600">
                  Touchez l'outil ci-dessous ou saisissez-en un autre.
                </p>
              </div>

              {/* Grid of quick tools */}
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_TOOLS.map((t, idx) => {
                  const isSelected = !isCustomTool && selectedTool.name === t.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetTool(t)}
                      className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/90 border-amber-500 shadow-md font-black text-stone-950'
                          : 'bg-white border-stone-200 hover:border-amber-300 text-stone-800'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{t.icon}</span>
                      <span className="text-xs sm:text-sm font-bold leading-tight line-clamp-2">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Or type custom tool */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCustomTool(true)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition ${
                    isCustomTool ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-stone-50 border-stone-300 text-stone-700'
                  }`}
                >
                  ✏️ Autre matériel non listé (cliquez pour taper ou dicter)
                </button>

                {isCustomTool && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={customToolName}
                      onChange={(e) => setCustomToolName(e.target.value)}
                      placeholder="Ex: Ponceuse vibrante, groupe électrogène, table pliante..."
                      className="w-full p-3 border-2 border-amber-400 rounded-xl text-sm font-semibold focus:outline-hidden"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Condition of the tool */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <span className="text-xs font-black text-stone-700 block mb-1.5">
                  État de l'outil avant le prêt :
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['neuf', 'excellent', 'bon'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setToolCondition(c)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                        toolCondition === c
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-white border-stone-300 text-stone-700'
                      }`}
                    >
                      {c === 'neuf' ? '✨ Neuf' : c === 'excellent' ? '👍 Très bon' : '👌 Bon état'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
              >
                <span>Étape suivante : À qui le prêtez-vous ?</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: À quel voisin ? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  À quel jeune voisin confiez-vous l'outil ?
                </h3>
                <p className="text-xs text-stone-600">
                  Sélectionnez un veilleur certifié du quartier ou notez un autre prénom.
                </p>
              </div>

              {/* Quick Neighbor Selector */}
              <div className="space-y-2">
                {VERIFIED_NEIGHBORS.map((n, idx) => {
                  const isSelected = !isCustomBorrower && selectedNeighbor.name === n.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedNeighbor(n);
                        setIsCustomBorrower(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 shadow-md font-black'
                          : 'bg-white border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{n.avatar}</span>
                        <div>
                          <span className="font-black text-sm text-stone-900 block">
                            {n.name}
                          </span>
                          <span className="text-xs text-stone-500">
                            {n.quartier} · {n.phone}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Voisin vérifié
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Or custom borrower */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCustomBorrower(true)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition ${
                    isCustomBorrower ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-stone-50 border-stone-300 text-stone-700'
                  }`}
                >
                  ➕ Autre personne (entrer son prénom et son numéro de téléphone)
                </button>

                {isCustomBorrower && (
                  <div className="mt-2 space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Prénom du jeune :</label>
                      <input
                        type="text"
                        value={customBorrowerName}
                        onChange={(e) => setCustomBorrowerName(e.target.value)}
                        placeholder="Ex: Thomas"
                        className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Numéro de téléphone (pour le SMS) :</label>
                      <input
                        type="tel"
                        value={customBorrowerPhone}
                        onChange={(e) => setCustomBorrowerPhone(e.target.value)}
                        placeholder="Ex: 06 99 88 77 66"
                        className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-sm transition cursor-pointer"
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                >
                  <span>Étape suivante : Date de retour</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Date de retour & Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Quand doit-il vous le rapporter ?
                </h3>
                <p className="text-xs text-stone-600">
                  Une date claire évite les oublis. Un rappel automatique amical sera envoyé.
                </p>
              </div>

              {/* Preset Return Timelines */}
              <div className="space-y-2">
                {RETURN_PRESETS.map((p, idx) => {
                  const isSelected = selectedReturnPreset.label === p.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedReturnPreset(p)}
                      className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 font-black text-stone-950 shadow-xs'
                          : 'bg-white border-stone-200 hover:border-amber-300 text-stone-700'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        {p.label}
                      </span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded border border-stone-200 font-mono">
                        {p.time}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Notes / Dictée vocale */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-700">
                    Précision ou mot amical (optionnel) :
                  </span>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-black cursor-pointer transition ${
                      isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isRecording ? 'Écoute en cours...' : 'Dicter au micro'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Rendre avec les mèches, batterie chargée..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs bg-white"
                />
              </div>

              {/* Security & Reassurance Box */}
              <div className="bg-emerald-50 text-emerald-950 p-3 rounded-2xl border border-emerald-300 flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-emerald-900">
                    Traçabilité & Tranquillité d'esprit assurées
                  </p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Un reçu avec numéro unique est automatiquement créé. Un SMS de confirmation est envoyé au jeune avec la date convenue et vos coordonnées.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-sm transition cursor-pointer"
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={handleCreateLoan}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer transition active:scale-98"
                >
                  <span>📜 Valider le prêt & Générer le reçu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
