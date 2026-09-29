import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, Upload, Clipboard, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  subtitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Scanner le QR Code du voisin",
  subtitle = "Pointez votre caméra vers l'écran du second appareil pour établir la liaison P2P directe.",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn("Erreur caméra :", err);
      setHasCamera(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? "Permission refusée. Vous pouvez autoriser la caméra ou coller directement le code de signalement."
          : "Caméra indisponible ou déjà utilisée par une autre application."
      );
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // QR Code détecté !
        stopCamera();
        onScanSuccess(code.data);
        return;
      }
    }

    animFrameId.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            onScanSuccess(code.data);
          } else {
            alert("Aucun QR Code valide détecté sur cette image.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopCamera();
      onScanSuccess(manualCode.trim());
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setManualCode(text);
        stopCamera();
        onScanSuccess(text.trim());
      }
    } catch {
      // Ignorer si presse-papiers non accessible
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b border-stone-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/40 text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-100">{title}</h3>
              <p className="text-xs text-stone-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Scanner Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[280px] max-h-[380px] overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Sight */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="w-56 h-56 border-2 border-amber-400/70 rounded-2xl relative shadow-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl -mb-1 -mr-1" />

                {/* Animated scan bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400/80 animate-[bounce_2s_infinite]" />
              </div>
              <p className="mt-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-200 border border-amber-400/30">
                Alignez le QR code dans le cadre
              </p>
            </div>
          )}

          {/* Camera Error or Fallback */}
          {cameraError && (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h4 className="text-white font-bold text-sm mb-1">Caméra indisponible</h4>
              <p className="text-xs text-stone-300 mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer la caméra
              </button>
            </div>
          )}

          {/* Controls Bar over video */}
          {isScanning && !cameraError && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={toggleCameraFacing}
                className="p-2 bg-stone-900/80 hover:bg-stone-800 text-white rounded-xl border border-stone-700 backdrop-blur-sm transition cursor-pointer"
                title="Changer de caméra (avant/arrière)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Manual Fallback & Upload Section */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span className="font-semibold text-amber-200">Alternative sans caméra :</span>
            <label className="text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              Importer une photo QR
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Collez ici le code de synchronisation (PL1_...)"
              className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 transition cursor-pointer"
              title="Coller depuis le presse-papier"
            >
              <Clipboard className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Valider
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Canal chiffré de bout en bout
            </span>
            <span>100% direct hors cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
