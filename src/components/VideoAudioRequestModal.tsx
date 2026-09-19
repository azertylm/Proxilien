import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Square, 
  Send, 
  X, 
  Mic, 
  Sparkles, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { createSpeechRecognition } from '../utils/speech';

interface VideoAudioRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  onRequestSubmitted: (title: string, description: string, category: string) => void;
}

export const VideoAudioRequestModal: React.FC<VideoAudioRequestModalProps> = ({
  isOpen,
  onClose,
  cityName,
  onRequestSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'voice' | 'presets'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [speechText, setSpeechText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('entraide');
  const [customTitle, setCustomTitle] = useState('');

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Common quick presets for seniors
  const PRESETS = [
    { title: 'Porter les courses du marché', category: 'entraide', icon: '🛒', desc: 'J\'ai acheté des légumes au marché de La Grande-Motte et mon sac est trop lourd.' },
    { title: 'Changer une ampoule au plafond', category: 'entraide', icon: '💡', desc: 'Mon ampoule du salon est grillée et je ne peux pas monter sur l\'escabeau.' },
    { title: 'Régler la télévision / box internet', category: 'entraide', icon: '📺', desc: 'Je n\'ai plus de son sur France Télévisions depuis hier.' },
    { title: 'Compagnie pour une balade au soleil', category: 'mobilite', icon: '🌊', desc: 'Envie d\'une marche de 30 minutes sur la promenade du Couchant au bord de la mer.' },
    { title: 'Aller chercher des médicaments', category: 'entraide', icon: '💊', desc: 'Mon ordonnance est prête à la pharmacie du port mais je suis fatigué ce matin.' },
    { title: 'Sortir mon petit chien', category: 'famille', icon: '🐕', desc: 'Besoin d\'un jeune pour promener mon chien 20 minutes aujourd\'hui.' },
  ];

  // Initialize camera when opening on video tab
  useEffect(() => {
    if (isOpen && activeTab === 'video' && !recordedVideoUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, recordedVideoUrl]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Caméra non supportée par votre navigateur.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn("Camera init error:", err);
      setCameraError("Impossible d'accéder à la caméra. Vous pouvez utiliser la dictée vocale ou les boutons simples ci-dessous !");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];
    try {
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stopCamera();
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error(e);
      setCameraError("Erreur d'enregistrement.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleResetRecording = () => {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordSeconds(0);
    startCamera();
  };

  // Speech Recognition
  const handleStartVoice = () => {
    setIsListening(true);
    const recognition = createSpeechRecognition(
      (transcript) => {
        setSpeechText(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      },
      (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );

    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.warn(e);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
    }
  };

  const handleSubmit = (finalTitle?: string, finalDesc?: string, finalCat?: string) => {
    const title = finalTitle || customTitle || (speechText ? speechText.slice(0, 50) : "Demande d'aide vidéo de voisinage");
    const desc = finalDesc || speechText || "Demande d'aide enregistrée par votre aîné via ProxiLien.";
    const cat = finalCat || selectedCategory;

    onRequestSubmitted(title, desc, cat);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[96vh] sm:max-h-[92vh] my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3.5 py-2.5 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-2xl font-black font-['Outfit'] leading-tight">
                J'ai besoin d'un coup de main
              </h2>
              <p className="text-[11px] sm:text-sm text-orange-100 font-medium line-clamp-1">
                {cityName} · Envoyez votre demande par vidéo, par la voix ou en 1 clic
              </p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 sm:p-2 gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Message Vidéo</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Parler (Microphone)</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 sm:py-2.5 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white text-orange-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Besoins Rapides (1 Clic)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-3">
          {/* TAB 1: VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-3">
              <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border-2 border-slate-800 shadow-inner max-h-[30vh] sm:max-h-[44vh] w-full max-w-xl mx-auto">
                {cameraError ? (
                  <div className="text-center p-4 text-white max-w-sm">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-1.5" />
                    <p className="text-xs sm:text-sm font-medium">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('voice')}
                      className="mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Utiliser la dictée vocale à la place
                    </button>
                  </div>
                ) : recordedVideoUrl ? (
                  <video
                    src={recordedVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[30vh] sm:max-h-[44vh] object-contain"
                  />
                ) : (
                  <>
                    <video
                      ref={videoPreviewRef}
                      playsInline
                      muted
                      className="w-full h-full max-h-[30vh] sm:max-h-[44vh] object-cover scale-x-[-1]"
                    />
                    {isRecording && (
                      <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-extrabold px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-lg animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>REC 00:{recordSeconds.toString().padStart(2, '0')} (max 60s)</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Video Controls - ALWAYS VISIBLE, STICKY & ACCESSIBLE */}
              {!cameraError && (
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-2 pb-1 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-10">
                  {!recordedVideoUrl ? (
                    !isRecording ? (
                      <button
                        id="btn-start-record-video"
                        onClick={handleStartRecording}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base flex-shrink-0"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white animate-pulse" />
                        <span>Enregistrer mon message vidéo</span>
                      </button>
                    ) : (
                      <button
                        id="btn-stop-record-video"
                        onClick={handleStopRecording}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base flex-shrink-0"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>Terminer l'enregistrement (00:{recordSeconds.toString().padStart(2, '0')})</span>
                      </button>
                    )
                  ) : (
                    <div className="flex w-full gap-2.5">
                      <button
                        onClick={handleResetRecording}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm cursor-pointer"
                      >
                        Recommencer
                      </button>
                      <button
                        onClick={() => handleSubmit('Message Vidéo d\'un Aîné', 'Message vidéo enregistré pour les voisins du quartier.', 'entraide')}
                        className="flex-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-2.5 px-4 rounded-xl text-xs sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Envoyer la vidéo aux voisins</span>
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-right font-medium">
                    Expliquez calmement ce dont vous avez besoin. Vos voisins bienveillants vous répondront rapidement.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VOICE */}
          {activeTab === 'voice' && (
            <div className="space-y-4 text-center py-3">
              <div className="max-w-md mx-auto">
                <button
                  id="btn-voice-dictation"
                  onClick={handleStartVoice}
                  className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white shadow-xl transition cursor-pointer ${
                    isListening
                      ? 'bg-red-600 animate-pulse ring-8 ring-red-200'
                      : 'bg-orange-600 hover:bg-orange-700 hover:scale-105'
                  }`}
                  aria-label="Activer le microphone pour dicter"
                >
                  <Mic className="w-10 h-10" />
                </button>
                <p className="font-extrabold text-slate-800 text-base mt-3">
                  {isListening ? "Écoute en cours... Parlez maintenant !" : "Touchez le micro et parlez"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Exemple : "Bonjour, je cherche quelqu'un pour m'aider à porter un sac d'eau au Couchant."
                </p>
              </div>

              {/* Transcribed Text Display */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-left">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Votre demande retranscrite :
                </label>
                <textarea
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  placeholder="Le texte prononcé s'affiche ici. Vous pouvez aussi le modifier au clavier..."
                  rows={3}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {speechText && (
                <button
                  onClick={() => handleSubmit()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 text-base flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Send className="w-5 h-5" />
                  <span>Envoyer ma demande aux voisins de {cityName}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                Sélectionnez votre besoin en un seul clic :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(preset.title, preset.desc, preset.category)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition cursor-pointer text-left group shadow-xs"
                  >
                    <span className="text-3xl p-1 bg-slate-100 rounded-xl group-hover:scale-110 transition flex-shrink-0">
                      {preset.icon}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-orange-600">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {preset.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Toutes les demandes sont vérifiées par les bénévoles de {cityName}.</span>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-slate-600 font-bold hover:underline"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
