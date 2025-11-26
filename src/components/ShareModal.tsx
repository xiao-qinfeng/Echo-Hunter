
import React, { useRef, useState } from 'react';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language } from '../types';
import { X, Download, Share2, Loader2, Fingerprint, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  node: ThoughtNode | null;
  onClose: () => void;
  lang: Language;
  userName: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ node, onClose, lang, userName }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!node) return null;

  const t = {
    title: lang === 'en' ? 'CRYSTALLIZE THOUGHT' : '思维结晶',
    download: lang === 'en' ? 'Download Artifact' : '下载数字切片',
    generating: lang === 'en' ? 'Synthesizing...' : '合成中...',
    // shareTitle removed to reduce noise
    depth: lang === 'en' ? 'DEPTH' : '密度',
    unique: lang === 'en' ? 'UNIQUE' : '偏差',
    echo: lang === 'en' ? 'NEURAL ECHO' : '神经回声',
    appName: 'COGNITIVE GENOME', // Use English for better aesthetic as a watermark
    // Mode Translations for the Card
    modeObs: lang === 'en' ? 'OBSERVATION' : 'OBSERVATION / 白描',
    modePar: lang === 'en' ? 'PARADOX' : 'PARADOX / 思辨',
    modeSen: lang === 'en' ? 'SENSORY' : 'SENSORY / 通感'
  };

  const getModeLabel = (mode: CognitiveMode) => {
    switch (mode) {
      case CognitiveMode.OBSERVATION: return t.modeObs;
      case CognitiveMode.PARADOX: return t.modePar;
      case CognitiveMode.SENSORY: return t.modeSen;
      default: return mode;
    }
  };

  const colors = {
    [CognitiveMode.OBSERVATION]: { 
      bg: 'from-cyan-950/80 to-slate-950', 
      border: 'border-cyan-500/50', 
      text: 'text-cyan-400',
      accent: 'bg-cyan-500'
    },
    [CognitiveMode.PARADOX]: { 
      bg: 'from-violet-950/80 to-slate-950', 
      border: 'border-violet-500/50', 
      text: 'text-violet-400',
      accent: 'bg-violet-500'
    },
    [CognitiveMode.SENSORY]: { 
      bg: 'from-rose-950/80 to-slate-950', 
      border: 'border-rose-500/50', 
      text: 'text-rose-400',
      accent: 'bg-rose-500'
    }
  };

  const theme = colors[node.mode] || colors[CognitiveMode.OBSERVATION];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Small delay to ensure rendering matches
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2, // Retina quality
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `mind_os_artifact_${node.id.slice(0, 8)}.png`;
      link.click();
    } catch (err) {
      console.error("Capture failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col items-center">
        
        {/* Controls */}
        <div className="w-full flex justify-between items-center mb-4 text-slate-400 relative">
            <h3 className="font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                <Share2 size={16} /> {t.title}
            </h3>
            <button
                onClick={onClose}
                className="hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800/50 md:w-8 md:h-8 md:hover:bg-transparent"
                aria-label="Close"
            >
                <X size={24} className="md:size-5" />
            </button>
        </div>

        {/* The Card to Capture */}
        <div className="relative shadow-2xl shadow-black/80 rounded-none overflow-hidden" ref={cardRef}>
            
            {/* Background Texture */}
            <div className={`w-[360px] min-h-[500px] bg-gradient-to-br ${theme.bg} relative p-8 flex flex-col justify-between border-y-8 border-x-2 ${theme.border}`}>
                
                {/* Noise Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
                
                {/* Header */}
                <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                        <div className={`font-mono text-xs font-bold uppercase tracking-[0.2em] ${theme.text}`}>
                            {getModeLabel(node.mode)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                            {new Date(node.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="text-right">
                         {/* Removed text label for cleaner look */}
                         <Fingerprint size={32} className={`ml-auto ${theme.text} opacity-20`} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 py-8 grow flex flex-col justify-center">
                    <p className="font-serif text-2xl md:text-3xl text-slate-100 leading-relaxed italic">
                        "{node.content}"
                    </p>
                </div>

                {/* AI Feedback Section */}
                <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2 opacity-70">
                        <Activity size={12} className={theme.text} />
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${theme.text}`}>
                            {t.echo}
                        </span>
                    </div>
                    <p className="font-mono text-xs text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-3">
                        {node.analysis.feedback}
                    </p>
                </div>

                {/* Stats Footer & Branding */}
                <div className="relative z-10 mt-8 flex justify-between items-end">
                    <div className="flex gap-4">
                        <div>
                            <div className="text-[9px] text-slate-600 font-mono uppercase mb-0.5">{t.depth}</div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-3 ${i < node.analysis.depthScore / 20 ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-[9px] text-slate-600 font-mono uppercase mb-0.5">{t.unique}</div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-1.5 h-3 ${i < node.analysis.styleUniqueness / 20 ? theme.accent : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-1">
                            @{userName}
                        </div>
                        <div className="text-[8px] text-slate-600 font-mono tracking-[0.2em] opacity-40 uppercase">
                            {t.appName}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`mt-6 flex items-center gap-2 px-8 py-3 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-300 shadow-lg ${
                isGenerating 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-white text-slate-900 hover:bg-violet-400 hover:text-white hover:scale-105'
            }`}
        >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGenerating ? t.generating : t.download}
        </button>

      </div>
    </div>
  );
};

export default ShareModal;
