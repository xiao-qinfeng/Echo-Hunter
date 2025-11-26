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
    // Check if already installed (or in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Show prompt after a short delay (don't be too aggressive)
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    // Listen for beforeinstallprompt event (for browsers that support it)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show manual instructions if beforeinstallprompt is not supported
      setShowManualInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error prompting install:', error);
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
