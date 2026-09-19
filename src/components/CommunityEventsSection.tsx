import React, { useState } from 'react';
import { CommunityEvent, CityInfo, ThemeConfig } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Heart,
  Sparkles,
  Share2
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface CommunityEventsSectionProps {
  events: CommunityEvent[];
  currentCity: CityInfo;
  themeConfig: ThemeConfig;
  onOpenOrganizeModal: () => void;
  onJoinEvent: (eventId: string) => void;
}

export const CommunityEventsSection: React.FC<CommunityEventsSectionProps> = ({
  events,
  currentCity,
  themeConfig,
  onOpenOrganizeModal,
  onJoinEvent,
}) => {
  const [speakingEventId, setSpeakingEventId] = useState<string | null>(null);
  const [selectedQuartierFilter, setSelectedQuartierFilter] = useState<string>('all');

  const handleReadEvent = (evt: CommunityEvent) => {
    if (speakingEventId === evt.id) {
      stopSpeaking();
      setSpeakingEventId(null);
    } else {
      setSpeakingEventId(evt.id);
      const speech = `${evt.title}. Rendez-vous ${evt.date} à ${evt.time}, ${evt.location}, quartier ${evt.quartier}. Organisé par ${evt.organizerName}. ${evt.description}. Ce qu'il faut apporter : ${evt.whatToBring || 'rien de particulier'}. ${evt.attendees.length} personnes participent déjà.`;
      speakText(speech, () => setSpeakingEventId(null));
    }
  };

  const filteredEvents = selectedQuartierFilter === 'all'
    ? events
    : events.filter(e => e.quartier === selectedQuartierFilter);

  const isGoldTheme = themeConfig.themeId === 'gold-white' || themeConfig.themeId === 'gold-dark';

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Top Banner with Action */}
      <div className={`p-4 sm:p-8 rounded-3xl border-2 transition-all relative overflow-hidden ${
        themeConfig.themeId === 'gold-white' 
          ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300 shadow-gold' :
        themeConfig.themeId === 'gold-dark' 
          ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/50 border-amber-500 shadow-gold-lg text-white' :
        themeConfig.themeId === 'dark' 
          ? 'bg-slate-900 border-slate-700 text-white' :
        themeConfig.themeId === 'high-contrast' 
          ? 'bg-black border-4 border-yellow-400 text-yellow-300' :
          'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                isGoldTheme 
                  ? 'bg-amber-400/20 text-amber-800 border border-amber-300' 
                  : 'bg-white/20 text-white'
              }`}>
                Lien & Convivialité · {currentCity.name}
              </span>
              <span className="text-xs opacity-90 font-bold">
                {events.length} rencontres prévues
              </span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${
              isGoldTheme ? 'text-gold-gradient' : ''
            }`}>
              Rencontres & Moments entre Voisins ☕🍰
            </h2>
            <p className={`text-base sm:text-lg mt-2 max-w-2xl font-medium ${
              isGoldTheme ? (themeConfig.themeId === 'gold-dark' ? 'text-amber-100' : 'text-slate-700') :
              themeConfig.themeId === 'dark' ? 'text-slate-300' :
              themeConfig.themeId === 'high-contrast' ? 'text-yellow-200' : 'text-orange-50'
            }`}>
              À La Grande-Motte, personne ne reste seul. Partagez un café, une partie de belote, une balade au coucher de soleil ou un goûter fait maison en toute simplicité.
            </p>
          </div>

          <button
            onClick={onOpenOrganizeModal}
            className="flex-shrink-0 bg-white hover:bg-amber-50 text-orange-700 font-extrabold px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-base sm:text-lg cursor-pointer transition transform hover:scale-105 active:scale-95 border-2 border-amber-300"
          >
            <Plus className="w-6 h-6 text-orange-600 stroke-[3]" />
            <span>Organiser une rencontre</span>
          </button>
        </div>
      </div>

      {/* Filter by Quartier */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-extrabold text-slate-700 mr-1">
          Filtrer par quartier :
        </span>
        <button
          onClick={() => setSelectedQuartierFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            selectedQuartierFilter === 'all'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Tous ({events.length})
        </button>
        {currentCity.quartiers.map((q) => {
          const count = events.filter(e => e.quartier === q).length;
          return (
            <button
              key={q}
              onClick={() => setSelectedQuartierFilter(q)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedQuartierFilter === q
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{q}</span>
              {count > 0 && (
                <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.map((evt) => {
          const isAttending = evt.attendees.includes('Vous (Organisateur)') || evt.attendees.includes('Vous');
          const isSpeaking = speakingEventId === evt.id;

          return (
            <div
              key={evt.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isGoldTheme
                  ? (themeConfig.themeId === 'gold-dark' 
                      ? 'bg-stone-900/90 border-amber-500/80 shadow-gold' 
                      : 'bg-white border-amber-300 shadow-gold hover:border-amber-400')
                  : themeConfig.themeId === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : themeConfig.themeId === 'high-contrast'
                  ? 'bg-black border-2 border-yellow-400 text-yellow-300'
                  : 'bg-white border-slate-200 shadow-sm hover:border-orange-300'
              }`}
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-14 h-14 rounded-2xl bg-amber-100/80 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                      {evt.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {evt.categoryLabel}
                        </span>
                        {evt.badge && (
                          <span className="text-xs font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            {evt.badge}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-extrabold mt-1 leading-snug ${
                        isGoldTheme ? 'text-gold-gradient' : 'text-slate-900'
                      }`}>
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  {/* Audio Read Button */}
                  <button
                    onClick={() => handleReadEvent(evt)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex-shrink-0 ${
                      isSpeaking
                        ? 'bg-amber-200 border-amber-400 text-amber-900 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                    title="Écouter l'invitation à voix haute"
                    aria-label="Écouter l'invitation"
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-800" /> : <Volume2 className="w-5 h-5 text-orange-600" />}
                  </button>
                </div>

                {/* Practical Details (Big and clear) */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="truncate">{evt.location} ({evt.quartier})</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-2">
                  {evt.description}
                </p>

                {/* What to bring */}
                {evt.whatToBring && (
                  <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-950 font-medium">
                    🧺 <strong>À apporter :</strong> {evt.whatToBring}
                  </div>
                )}
              </div>

              {/* Card Footer: Attendees & Join Button */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>{evt.attendees.length} participant{evt.attendees.length > 1 ? 's' : ''} :</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                    {evt.attendees.join(', ')}
                  </div>
                </div>

                <button
                  onClick={() => onJoinEvent(evt.id)}
                  disabled={isAttending}
                  className={`w-full sm:w-auto font-black text-sm px-5 py-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 ${
                    isAttending
                      ? 'bg-emerald-600 text-white shadow-xs cursor-default'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-600/20 active:scale-95'
                  }`}
                >
                  {isAttending ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      <span>Vous participez ! ✓</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Je viens ! (Participer)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
