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
  Share2,
  ArrowLeft,
  Home
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface CommunityEventsSectionProps {
  events: CommunityEvent[];
  currentCity: CityInfo;
  themeConfig: ThemeConfig;
  onOpenOrganizeModal: () => void;
  onJoinEvent: (eventId: string) => void;
  onBackToHome?: () => void;
}

export const CommunityEventsSection: React.FC<CommunityEventsSectionProps> = ({
  events,
  currentCity,
  themeConfig,
  onOpenOrganizeModal,
  onJoinEvent,
  onBackToHome,
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
  const isDark = themeConfig.themeId === 'dark' || themeConfig.themeId === 'gold-dark';
  const isHighContrast = themeConfig.themeId === 'high-contrast';

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

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-5 py-4 rounded-2xl flex items-center gap-2 text-base cursor-pointer transition border border-white/40 active:scale-95 shadow-md"
              >
                <Home className="w-5 h-5 text-amber-200" />
                <span>← Revenir à l'accueil</span>
              </button>
            )}
            <button
              onClick={onOpenOrganizeModal}
              className="bg-white hover:bg-amber-50 text-orange-700 font-extrabold px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-base sm:text-lg cursor-pointer transition transform hover:scale-105 active:scale-95 border-2 border-amber-300"
            >
              <Plus className="w-6 h-6 text-orange-600 stroke-[3]" />
              <span>Organiser une rencontre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter by Quartier */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-base font-extrabold mr-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          Filtrer par quartier :
        </span>
        <button
          onClick={() => setSelectedQuartierFilter('all')}
          className={`px-4 py-2.5 rounded-xl text-base font-black transition cursor-pointer ${
            selectedQuartierFilter === 'all'
              ? 'bg-orange-600 text-white shadow-xs'
              : isDark
              ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
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
              className={`px-4 py-2.5 rounded-xl text-base font-bold transition cursor-pointer flex items-center gap-1.5 ${
                selectedQuartierFilter === q
                  ? 'bg-orange-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{q}</span>
              {count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                  isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
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
                      ? 'bg-stone-900/90 border-amber-500/80 shadow-gold text-white' 
                      : 'bg-white border-amber-300 shadow-gold hover:border-amber-400')
                  : themeConfig.themeId === 'dark'
                  ? 'bg-slate-800/95 border-slate-700 text-white shadow-md'
                  : themeConfig.themeId === 'high-contrast'
                  ? 'bg-black border-2 border-yellow-400 text-yellow-300'
                  : 'bg-white border-slate-200 shadow-sm hover:border-orange-300'
              }`}
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0 ${
                      isDark ? 'bg-slate-700 border border-slate-600' : 'bg-amber-100/80'
                    }`}>
                      {evt.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black uppercase px-3 py-1 rounded-full ${
                          isDark
                            ? 'bg-orange-950/80 text-orange-300 border border-orange-700/60'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {evt.categoryLabel}
                        </span>
                        {evt.badge && (
                          <span className={`text-sm font-black px-2.5 py-1 rounded-full ${
                            isDark
                              ? 'text-amber-300 bg-amber-950/80 border border-amber-700/60'
                              : 'text-amber-700 bg-amber-100/70'
                          }`}>
                            {evt.badge}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl sm:text-2xl font-black mt-1.5 leading-snug ${
                        isGoldTheme 
                          ? 'text-gold-gradient' 
                          : isDark 
                          ? 'text-white' 
                          : isHighContrast 
                          ? 'text-yellow-300' 
                          : 'text-slate-900'
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
                        : isDark
                        ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                    title="Écouter l'invitation à voix haute"
                    aria-label="Écouter l'invitation"
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-800" /> : <Volume2 className="w-5 h-5 text-orange-500" />}
                  </button>
                </div>

                {/* Practical Details (Big and clear) */}
                <div className={`grid grid-cols-2 gap-2 my-3 p-3.5 rounded-2xl border text-base ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className={`flex items-center gap-2 font-bold ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className={`flex items-center gap-2 font-bold ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className={`col-span-2 flex items-center gap-2 font-bold text-sm sm:text-base ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="truncate">{evt.location} ({evt.quartier})</span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-base sm:text-lg leading-relaxed mt-2.5 font-medium ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {evt.description}
                </p>

                {/* What to bring */}
                {evt.whatToBring && (
                  <div className={`mt-3 p-3.5 rounded-2xl text-sm sm:text-base font-medium border ${
                    isDark 
                      ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' 
                      : 'bg-amber-50/70 border border-amber-200 text-amber-950'
                  }`}>
                    🧺 <strong>À apporter :</strong> {evt.whatToBring}
                  </div>
                )}
              </div>

              {/* Card Footer: Attendees & Join Button */}
              <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDark ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <div>
                  <div className={`flex items-center gap-2 text-sm sm:text-base font-extrabold ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{evt.attendees.length} participant{evt.attendees.length > 1 ? 's' : ''} :</span>
                  </div>
                  <div className={`text-sm mt-0.5 truncate max-w-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {evt.attendees.join(', ')}
                  </div>
                </div>

                <button
                  onClick={() => onJoinEvent(evt.id)}
                  disabled={isAttending}
                  className={`w-full sm:w-auto font-black text-base sm:text-lg px-6 py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 ${
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
