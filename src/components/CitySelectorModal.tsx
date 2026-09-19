import React, { useState } from 'react';
import { CityInfo } from '../types';
import { 
  MapPin, 
  X, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityInfo[];
  currentCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
  onAddNewCity: (newCity: CityInfo) => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({
  isOpen,
  onClose,
  cities,
  currentCity,
  onSelectCity,
  onAddNewCity,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

  if (!isOpen) return null;

  const handleCreateCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !newPostalCode.trim()) return;

    const newCity: CityInfo = {
      id: newCityName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newCityName.trim(),
      postalCode: newPostalCode.trim(),
      department: newDepartment.trim() || 'France',
      region: 'France',
      badge: 'active',
      description: `Espace ProxiLien déployé pour ${newCityName.trim()}, favorisant les liens aînés-jeunes.`,
      quartiers: ['Centre-Ville', 'Quartier Nord', 'Quartier Sud', 'Résidences'],
      activeSeniors: 12,
      activeYouth: 8,
      totalHelpsGiven: 0,
    };

    onAddNewCity(newCity);
    onSelectCity(newCity);
    setShowAddForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Déploiement National ProxiLien
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 font-medium">
                De La Grande-Motte vers toutes les communes de France
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs sm:text-sm text-amber-900 font-medium">
            💡 <strong className="font-bold">Architecture Duplicable :</strong> ProxiLien a été conçu pour être déployé en 1 clic dans n'importe quelle ville avec ses quartiers, ses référents CCAS et ses initiatives locales.
          </div>

          {!showAddForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Villes Actives & Pilotes :
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une nouvelle ville</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {cities.map((c) => {
                  const isCurrent = c.id === currentCity.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectCity(c);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-orange-500 bg-orange-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-1 bg-white rounded-xl shadow-xs">
                          {c.id === 'la-grande-motte' ? '🏖️' : '🏘️'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-base font-['Outfit']">
                              {c.name} ({c.postalCode})
                            </h4>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              c.badge === 'pilote'
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {c.badge === 'pilote' ? 'Ville Pilote Officielle' : 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{c.description}</p>
                          <div className="text-[11px] text-slate-500 mt-1 font-bold">
                            {c.activeSeniors} aînés inscrits · {c.activeYouth} jeunes bénévoles · {c.totalHelpsGiven} aides
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCurrent ? (
                          <span className="text-xs font-black text-orange-700 bg-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Actuelle</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600 flex items-center gap-1">
                            <span>Basculer</span>
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add City Form */
            <form onSubmit={handleCreateCity} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-black text-slate-900 text-base font-['Outfit']">
                Dupliquer ProxiLien dans une nouvelle commune :
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nom de la commune / ville :
                </label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Ex : Sète, Agde, Nîmes, Paris 15e, Lyon..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Code Postal :
                  </label>
                  <input
                    type="text"
                    required
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="Ex : 34200"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Département / Région :
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ex : Hérault (34)"
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm shadow-md cursor-pointer"
                >
                  Déployer ProxiLien dans cette ville 🚀
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl text-sm cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>La Grande-Motte reste la référence pilote initiale.</span>
          <button
            onClick={onClose}
            className="text-slate-700 font-bold hover:underline"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
