import React, { useState } from 'react';
import { CommunityEvent, CityInfo } from '../types';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Check, 
  Coffee, 
  Heart,
  Smile
} from 'lucide-react';

interface OrganizeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityInfo;
  onEventCreated: (event: CommunityEvent) => void;
}

export const OrganizeEventModal: React.FC<OrganizeEventModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onEventCreated,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'gouter' | 'jeux' | 'balade' | 'cafe' | 'apero' | 'nature' | 'animaux'>('gouter');
  const [categoryLabel, setCategoryLabel] = useState('Goûter & Papote');
  const [icon, setIcon] = useState('🍰');
  const [date, setDate] = useState('Aujourd\'hui');
  const [time, setTime] = useState('16h00');
  const [location, setLocation] = useState('');
  const [quartier, setQuartier] = useState(currentCity.quartiers[0] || 'Centre-Ville & Port');
  const [description, setDescription] = useState('');
  const [whatToBring, setWhatToBring] = useState('Votre bonne humeur et vos sourires !');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  if (!isOpen) return null;

  const quickTemplates = [
    {
      title: '☕ Café & Viennoiseries au Port',
      icon: '☕',
      category: 'cafe' as const,
      categoryLabel: 'Café & Papote',
      defaultLoc: 'Bancs ombragés face à la Capitainerie',
      defaultTime: '10h00',
      desc: 'Retrouvons-nous pour prendre un bon café chaud ou un thé, papoter et admirer les bateaux.',
      what: 'Vos tasses ou un petit croissant',
    },
    {
      title: '🍰 Goûter fait maison & Récits',
      icon: '🍰',
      category: 'gouter' as const,
      categoryLabel: 'Goûter partagé',
      defaultLoc: 'Place du 1er Octobre (sous les pins)',
      defaultTime: '15h30',
      desc: 'Je prépare un bon gâteau et j\'invite les voisins à partager un moment doux et gourmand.',
      what: 'Une boisson fraîche ou un gâteau fait maison',
    },
    {
      title: '🃏 Belote, Rummikub ou Scrabble',
      icon: '🃏',
      category: 'jeux' as const,
      categoryLabel: 'Jeux de société',
      defaultLoc: 'Kiosque ombragé du Couchant',
      defaultTime: '14h30',
      desc: 'Partie amicale de belote, de tarot ou de scrabble. Tous les niveaux sont bienvenus !',
      what: 'Jeu fourni, apportez vos lunettes',
    },
    {
      title: '🚶 Balade tranquille face à la mer',
      icon: '🌊',
      category: 'balade' as const,
      categoryLabel: 'Balade accompagnée',
      defaultLoc: 'Pyramide du Point Zéro (front de mer)',
      defaultTime: '17h30',
      desc: 'Marche sans dénivelé le long de la promenade piétonne pour respirer l\'air marin ensemble.',
      what: 'Une bouteille d\'eau et des baskets confortables',
    },
    {
      title: '🥖 Apéro convivial sans alcool au coucher de soleil',
      icon: '🌅',
      category: 'apero' as const,
      categoryLabel: 'Apéro des voisins',
      defaultLoc: 'Bancs de la Plage du Couchant',
      defaultTime: '18h30',
      desc: 'Un moment simple au crépuscule pour trinquer entre voisins avec des jus frais et des olives.',
      what: 'Quelques chips, olives ou jus de fruits',
    },
    {
      title: '🥬 Jardinage & Échange de boutures',
      icon: '🌱',
      category: 'nature' as const,
      categoryLabel: 'Jardin & Nature',
      defaultLoc: 'Jardins partagés du Ponant',
      defaultTime: '10h00',
      desc: 'Échangeons nos conseils pour les plantes méditerranéennes et cueillons quelques herbes fraîches.',
      what: 'Un petit sécateur ou des sachets pour boutures',
    },
  ];

  const handleSelectTemplate = (tmpl: typeof quickTemplates[0], index: number) => {
    setSelectedTemplate(index);
    setTitle(tmpl.title);
    setIcon(tmpl.icon);
    setCategory(tmpl.category);
    setCategoryLabel(tmpl.categoryLabel);
    setLocation(tmpl.defaultLoc);
    setTime(tmpl.defaultTime);
    setDescription(tmpl.desc);
    setWhatToBring(tmpl.what);
  };

  const handleToggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La dictée vocale n'est pas prise en charge sur ce navigateur. Vous pouvez taper directement le texte.");
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingVoice(false);
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecordingVoice(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: CommunityEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Rencontre conviviale entre voisins organisée sur ProxiLien.',
      category,
      categoryLabel,
      icon: icon || '🤝',
      date: date.trim() || 'Cette semaine',
      time: time.trim() || '15h00',
      location: location.trim() || `Au cœur de ${currentCity.name}`,
      quartier,
      organizerName: 'Vous (Organisateur)',
      organizerRole: 'senior',
      organizerAvatar: '👋',
      attendees: ['Vous (Organisateur)'],
      maxAttendees: 8,
      whatToBring: whatToBring.trim(),
      badge: 'Nouveau moment',
    };

    onEventCreated(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-300 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner text-2xl">
              🎉
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                Organiser un Moment entre Voisins
              </h2>
              <p className="text-xs sm:text-sm text-orange-100 font-medium">
                À {currentCity.name} · Simple, gratuit et chaleureux
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Fermer l'organisateur"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Idea Templates */}
          <div>
            <label className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Idées prêtes en 1 clic (cliquez sur celle qui vous plaît) :</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(t, idx)}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedTemplate === idx
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400/40'
                      : 'border-slate-200 hover:border-orange-300 bg-slate-50/50'
                  }`}
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <div className="font-extrabold text-xs text-slate-900 line-clamp-2">
                    {t.title}
                  </div>
                  <span className="text-[10px] text-orange-700 font-bold mt-1">
                    {t.categoryLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Icon */}
          <div>
            <label className="text-sm font-extrabold text-slate-900 block mb-1">
              Nom de la rencontre :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                title="Émoticône"
                className="w-14 p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-center text-xl font-bold"
              />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Café papote, Belote amicale, Balade au soleil..."
                className="flex-1 p-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Date, Time & Quartier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                <span>Jour :</span>
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500"
              >
                <option value="Aujourd'hui">Aujourd'hui</option>
                <option value="Demain">Demain</option>
                <option value="Samedi">Samedi prochain</option>
                <option value="Dimanche">Dimanche prochain</option>
                <option value="Mercredi prochain">Mercredi prochain</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Heure :</span>
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ex : 15h30"
                className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Quartier :</span>
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500"
              >
                {currentCity.quartiers.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location details */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              Lieu précis de rendez-vous :
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex : Sur le banc devant la capitainerie, au pied de ma résidence, etc."
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500"
            />
          </div>

          {/* Description with voice dictation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-extrabold text-slate-700">
                Quelques mots pour vos voisins :
              </label>
              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  isRecordingVoice
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecordingVoice ? 'Écoute en cours...' : 'Dicter à la voix'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez en quelques mots simples le programme de cette rencontre..."
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-orange-500"
            />
          </div>

          {/* What to bring */}
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">
              Ce que chacun peut apporter (facultatif) :
            </label>
            <input
              type="text"
              value={whatToBring}
              onChange={(e) => setWhatToBring(e.target.value)}
              placeholder="Ex : Votre tasse, un jeu de cartes, un petit biscuit ou juste votre bonne humeur"
              className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-orange-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold py-3.5 rounded-2xl text-base shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Publier l'invitation aux voisins 🚀</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-3.5 rounded-2xl text-sm cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
