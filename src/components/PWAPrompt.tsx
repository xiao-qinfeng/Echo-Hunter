import React, { useState, useEffect } from 'react';
import { Download, X, HelpCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAPromptProps {
  lang: 'en' | 'zh';
  onDismiss?: () => void;
}

const PWAPrompt: React.FC<PWAPromptProps> = ({ lang, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const t = {
    install: lang === 'en' ? 'Install App' : '安装应用',
    description: lang === 'en'
      ? 'Add Echo Hunter to your home screen for the best experience'
      : '将 Echo Hunter 添加到主屏幕以获得最佳体验',
    installButton: lang === 'en' ? 'Install' : '安装',
    maybeLater: lang === 'en' ? 'Maybe Later' : '稍后再说',
    unsupported: lang === 'en'
      ? 'Your browser does not support automatic installation. Please use your browser\'s "Add to Home Screen" feature.'
      : '您的浏览器不支持自动安装。请使用浏览器的"添加到主屏幕"功能。',
    iosInstruction: lang === 'en'
      ? 'Tap the share button below and select "Add to Home Screen"'
      : '点击下方分享按钮并选择"添加到主屏幕"',
  };

  useEffect(() => {
    // Log PWA debugging info
    console.log('[PWA Debug] Initializing PWA prompt...');
    console.log('[PWA Debug] display-mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    console.log('[PWA Debug] navigator.standalone:', (window.navigator as any).standalone);
    console.log('[PWA Debug] serviceWorker in navigator:', 'serviceWorker' in navigator);
    console.log('[PWA Debug] HTTPS or localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');

    // Check if already installed (or in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      console.log('[PWA Debug] App already installed, hiding prompt');
      setIsInstalled(true);
      return;
    }

    // Check if PWA is supported
    const isSecureContext = window.isSecureContext;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasManifest = document.querySelector('link[rel="manifest"]') !== null;

    console.log('[PWA Debug] isSecureContext:', isSecureContext);
    console.log('[PWA Debug] hasServiceWorker:', hasServiceWorker);
    console.log('[PWA Debug] hasManifest:', hasManifest);

    if (!isSecureContext) {
      console.log('[PWA Debug] Not in secure context, PWA not supported');
      return;
    }

    if (!hasServiceWorker) {
      console.log('[PWA Debug] Service Worker not supported');
    }

    if (!hasManifest) {
      console.log('[PWA Debug] Manifest not found');
    }

    // Check if previously dismissed (don't show for 7 days)
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      console.log('[PWA Debug] Days since dismissed:', daysSinceDismissed);
      if (daysSinceDismissed < 7) {
        console.log('[PWA Debug] Prompt dismissed recently, not showing');
        return;
      }
    }

    // Show prompt after a short delay (don't be too aggressive)
    const timer = setTimeout(() => {
      console.log('[PWA Debug] Showing PWA prompt');
      setShowPrompt(true);
    }, 3000);

    // Listen for beforeinstallprompt event (for browsers that support it)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Debug] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('[PWA Debug] App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        console.log('[PWA Debug] Service Worker registration:', registration);
        if (!registration) {
          console.log('[PWA Debug] Service Worker not registered, attempting to register...');
        }
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    console.log('[PWA Debug] Install button clicked');
    console.log('[PWA Debug] deferredPrompt:', deferredPrompt);

    if (!deferredPrompt) {
      console.log('[PWA Debug] No deferredPrompt, checking browser support...');
      // Show manual instructions if beforeinstallprompt is not supported
      setShowManualInstructions(true);
      return;
    }

    try {
      console.log('[PWA Debug] Calling deferredPrompt.prompt()...');
      await deferredPrompt.prompt();
      console.log('[PWA Debug] Prompt shown successfully');
      const choiceResult = await deferredPrompt.userChoice;
      console.log('[PWA Debug] User choice:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA Debug] User accepted the install prompt');
      } else {
        console.log('[PWA Debug] User dismissed the install prompt');
      }
    } catch (error) {
      console.error('[PWA Debug] Error prompting install:', error);
      setShowManualInstructions(true);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowManualInstructions(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    onDismiss?.();
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  // Detect iOS Safari (which doesn't support beforeinstallprompt)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[250] p-4 md:left-auto md:right-6 md:bottom-6 md:w-auto">
      <div className="mx-auto max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl p-5 animate-in slide-in-from-bottom duration-300 md:max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Download size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200">{t.install}</h3>
              <p className="text-xs text-slate-500">Echo Hunter</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          {t.description}
        </p>

        {(showManualInstructions || isIOS) && (
          <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg mb-4">
            <HelpCircle size={16} className="text-violet-400 mt-0.5" />
            <p className="text-xs text-slate-400">
              {isIOS ? t.iosInstruction : t.unsupported}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-violet-600/30"
            >
              <Download size={18} />
              {t.installButton}
            </button>
          )}
          <button
            onClick={handleDismiss}
            className={`px-4 py-3 text-slate-400 hover:text-slate-200 rounded-xl transition-colors font-medium ${isIOS || showManualInstructions ? 'flex-1' : ''}`}
          >
            {t.maybeLater}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAPrompt;
