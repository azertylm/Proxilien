import { useState, useEffect, useCallback } from 'react';

export interface FullscreenState {
  isFullscreen: boolean;
  isNativeFullscreen: boolean;
  isImmersiveFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
}

export function useFullscreen(): FullscreenState {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isImmersiveFullscreen, setIsImmersiveFullscreen] = useState<boolean>(false);

  // Check native fullscreen status
  const checkNativeFullscreen = useCallback(() => {
    const doc = document as any;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = checkNativeFullscreen();
      setIsNativeFullscreen(isNative);
      if (!isNative) {
        // If native fullscreen was exited via Esc, also exit immersive state
        setIsImmersiveFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [checkNativeFullscreen]);

  // Handle keyboard shortcut (F key or Escape for immersive)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        // Toggle on 'f' key press (popular video/app convention)
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isImmersiveFullscreen && !isNativeFullscreen) {
        // Allow escape to exit simulated immersive full screen
        setIsImmersiveFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImmersiveFullscreen, isNativeFullscreen]);

  const enterFullscreen = useCallback(async () => {
    const docEl = document.documentElement as any;
    try {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      } else {
        // Fallback to immersive in-app full screen
        setIsImmersiveFullscreen(true);
      }
    } catch (err) {
      // If native requestFullscreen is blocked by iframe permissions policy,
      // fall back gracefully to immersive in-app full screen
      console.info('Native fullscreen unavailable, activating immersive in-app fullscreen:', err);
      setIsImmersiveFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    const doc = document as any;
    try {
      if (checkNativeFullscreen()) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error exiting native fullscreen:', err);
    } finally {
      setIsImmersiveFullscreen(false);
      setIsNativeFullscreen(false);
    }
  }, [checkNativeFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    if (isNativeFullscreen || isImmersiveFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isNativeFullscreen, isImmersiveFullscreen, enterFullscreen, exitFullscreen]);

  const isFullscreen = isNativeFullscreen || isImmersiveFullscreen;

  return {
    isFullscreen,
    isNativeFullscreen,
    isImmersiveFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
}
