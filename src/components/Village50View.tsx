import React, { useState, useMemo } from 'react';
import { Initiative, InitiativeCategory, UserMode } from '../types';
import { INITIATIVES_50 } from '../data/initiatives';
import { 
  Search, 
  Volume2, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  Mic, 
  Filter, 
  X,
  Share2
} from 'lucide-react';
import { speakText, createSpeechRecognition } from '../utils/speech';

interface Village50ViewProps {
  userMode: UserMode;
  cityName: string;
  initialCategory?: string;
  onInitiativeAction: (initiative: Initiative, actionText: string) => void;
}

export const Village50View: React.FC<Village50ViewProps> = ({
  userMode,
  cityName,
  initialCategory,
  onInitiativeAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeInitiativeModal, setActiveInitiativeModal] = useState<Initiative | null>(null);
  const [joinedInitiatives, setJoinedInitiatives] = useState<Set<string>>(new Set());
  const [isListeningSearch, setIsListeningSearch] = useState<boolean>(false);

  const CATEGORIES = [
    { id: 'all', label: 'Toutes les 50 idées', icon: '🌐' },
    { id: 'entraide', label: 'Entraide & Services', icon: '🤝' },
    { id: 'mobilite', label: 'Mobilité & Balades', icon: '🌊' },
    { id: 'nature', label: 'Écologie & Jardins', icon: '🌱' },
    { id: 'troc', label: 'Troc & Prêts', icon: '🔄' },
    { id: 'cuisine', label: 'Cuisine & Partage', icon: '🍲' },
    { id: 'culture', label: 'Mémoire & Culture', icon: '🏛️' },
    { id: 'famille', label: 'Famille & Animaux', icon: '👨‍👩‍👧' },
    { id: 'sante', label: 'Santé & Bien-être', icon: '💚' },
  ];

  const QUARTIERS = [
    'Tous les quartiers',
    'Le Couchant',
    'Centre-Ville & Port',
    'Le Ponant',
    'Point Zéro',
    'Haute Plage',
    'Motte du Couchant',
    'Grand Travers',
  ];

  // Voice Search Handler
  const handleVoiceSearch = () => {
    setIsListeningSearch(true);
    const recognition = createSpeechRecognition(
      (transcript) => {
        setSearchQuery(transcript);
        setIsListeningSearch(false);
      },
      () => setIsListeningSearch(false),
      () => setIsListeningSearch(false)
    );
    if (recognition) {
      try { recognition.start(); } catch (e) { setIsListeningSearch(false); }
    } else {
      setIsListeningSearch(false);
    }
  };

  // Filter initiatives
  const filteredInitiatives = useMemo(() => {
    return INITIATIVES_50.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuartier = selectedQuartier === 'Tous les quartiers' || selectedQuartier === 'all' || item.quartier.includes(selectedQuartier);
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.quartier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuartier && matchQuery;
    });
  }, [selectedCategory, selectedQuartier, searchQuery]);

  const handleToggleJoin = (initiative: Initiative) => {
    const isJoined = joinedInitiatives.has(initiative.id);
    const newSet = new Set(joinedInitiatives);
    if (isJoined) {
      newSet.delete(initiative.id);
      onInitiativeAction(initiative, "Participation annulée.");
    } else {
      newSet.add(initiative.id);
      const msg = userMode === 'senior' 
        ? `Demande envoyée pour "${initiative.title}". Vos voisins sont prévenus !`
        : `Bravo ! Vous avez rejoint "${initiative.title}" (+${initiative.xpReward} XP citoyen).`;
      onInitiativeAction(initiative, msg);
    }
    setJoinedInitiatives(newSet);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-16 overflow-hidden">
      {/* Header of Village */}
      <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-sm border border-slate-200 w-full max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>50 Initiatives Réelles · {cityName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              La Place du Village de <span className="text-orange-600">{cityName}</span> 🏘️
            </h1>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
              Des liens concrets entre les aînés et les jeunes : choisissez une initiative ou proposez la vôtre.
            </p>
          </div>

          <button
            onClick={() => speakText(`Vous êtes sur la Place du Village de La Grande-Motte. Vous pouvez parcourir 50 initiatives d'entraide entre aînés et jeunes.`)}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm shadow-xs self-start md:self-auto"
          >
            <Volume2 className="w-4 h-4 text-orange-600" />
            <span>Écouter la présentation</span>
          </button>
        </div>

        {/* Search Bar with Microphone */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parmi les 50 initiatives (ex: courses, balade, confiture, chien)..."
              className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 text-sm sm:text-base font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white transition cursor-pointer ${
                isListeningSearch ? 'bg-red-600 animate-pulse' : 'bg-orange-600 hover:bg-orange-700'
              }`}
              title="Rechercher à la voix"
              aria-label="Recherche vocale"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Quartier Selector */}
          <div className="sm:w-64">
            <select
              value={selectedQuartier}
              onChange={(e) => setSelectedQuartier(e.target.value)}
              className="w-full py-3.5 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 text-sm font-bold focus:bg-white focus:border-orange-500 focus:outline-none transition cursor-pointer"
            >
              {QUARTIERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Count Info */}
      <div className="flex items-center justify-between px-2 text-sm font-bold text-slate-600">
        <p>
          {filteredInitiatives.length} initiative{filteredInitiatives.length > 1 ? 's' : ''} disponible{filteredInitiatives.length > 1 ? 's' : ''} à {cityName}
        </p>
        {(selectedCategory !== 'all' || selectedQuartier !== 'Tous les quartiers' || searchQuery) && (
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedQuartier('all'); setSearchQuery(''); }}
            className="text-orange-600 hover:underline text-xs flex items-center gap-1 cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* 50 Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredInitiatives.map((item) => {
          const isJoined = joinedInitiatives.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-200 hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Category, Icon & Audio Button */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl p-2 bg-orange-50 rounded-2xl border border-orange-100 group-hover:scale-110 transition flex-shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2.5 py-0.5 rounded-full block w-fit">
                        {item.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.quartier}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(`${item.title}. ${item.shortDesc}. Pour l'aîné : ${item.seniorBenefit}`);
                    }}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition cursor-pointer"
                    title="Écouter à voix haute"
                    aria-label={`Écouter ${item.title}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => setActiveInitiativeModal(item)}
                  className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-orange-600 transition cursor-pointer"
                >
                  {item.title}
                </h3>

                {/* Short description */}
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                  {item.shortDesc}
                </p>

                {/* Benefits Callout */}
                <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-orange-700 flex-shrink-0">👵 Aîné :</span>
                    <span className="text-slate-700 font-medium">{item.seniorBenefit}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-700 flex-shrink-0">🧑 Jeune :</span>
                    <span className="text-slate-700 font-medium">{item.youthBenefit}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveInitiativeModal(item)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Détails ➔
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                    +{item.xpReward} pts
                  </span>

                  <button
                    onClick={() => handleToggleJoin(item)}
                    className={`font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isJoined
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : userMode === 'senior'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Rejoint ✓</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{userMode === 'senior' ? 'Je participe' : 'Aider'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Initiative Detail Modal */}
      {activeInitiativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl p-2 bg-orange-100 rounded-2xl">
                  {activeInitiativeModal.icon}
                </span>
                <div>
                  <span className="text-xs font-extrabold text-orange-700 uppercase tracking-wider">
                    {activeInitiativeModal.categoryLabel}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                    {activeInitiativeModal.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveInitiativeModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-100 p-3 rounded-2xl text-xs flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1 font-bold">
                <MapPin className="w-4 h-4 text-red-500" />
                {activeInitiativeModal.quartier}, {cityName}
              </span>
              <span className="font-extrabold text-indigo-700">
                {activeInitiativeModal.participantsCount} participants
              </span>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              {activeInitiativeModal.fullDesc}
            </p>

            <div className="space-y-2 bg-orange-50/70 p-4 rounded-2xl border border-orange-200 text-xs">
              <p>
                <strong className="text-orange-900">Bénéfice pour l'Aîné :</strong>{' '}
                <span className="text-orange-950">{activeInitiativeModal.seniorBenefit}</span>
              </p>
              <p>
                <strong className="text-indigo-900">Bénéfice pour le Jeune :</strong>{' '}
                <span className="text-indigo-950">{activeInitiativeModal.youthBenefit}</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  speakText(`${activeInitiativeModal.title}. ${activeInitiativeModal.fullDesc}`);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-orange-600" />
                <span>Écouter</span>
              </button>

              <button
                onClick={() => {
                  handleToggleJoin(activeInitiativeModal);
                  setActiveInitiativeModal(null);
                }}
                className={`flex-2 font-black py-3 px-4 rounded-xl text-sm text-white shadow-md flex items-center justify-center gap-2 ${
                  joinedInitiatives.has(activeInitiativeModal.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                }`}
              >
                {joinedInitiatives.has(activeInitiativeModal.id)
                  ? 'Déjà rejoint ✓'
                  : userMode === 'senior'
                  ? 'Participer à cette initiative'
                  : 'Proposer mon aide bénévole'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
