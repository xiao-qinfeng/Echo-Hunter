
import React, { useState, useEffect } from 'react';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language, AIConfig } from '../types';
import { analyzeThought } from '../services/geminiService';
import { Loader2, Fingerprint, Keyboard, Sparkles, Send } from 'lucide-react';

interface QuantumInputProps {
  onCapture: (node: ThoughtNode) => void;
  lang: Language;
  aiConfig: AIConfig;
  submitOnEnter: boolean;
}

const QuantumInput: React.FC<QuantumInputProps> = ({ onCapture, lang, aiConfig, submitOnEnter }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [probeIndex, setProbeIndex] = useState(0);
  const [detectedMode, setDetectedMode] = useState<CognitiveMode | null>(null);

  const t = {
    active: lang === 'en' ? 'GENOME: LISTENING' : '基因组：监听中',
    capture: lang === 'en' ? 'QUANTUM CAPTURE' : '量子捕获',
    chars: lang === 'en' ? 'CHARS' : '字符',
    hintCtrlEnter: lang === 'en' ? 'Ctrl+Enter to send' : 'Ctrl+Enter 发送',
    hintEnter: lang === 'en' ? 'Enter to send' : '回车键发送',
    analyzing: lang === 'en' ? 'CALIBRATING...' : '校准中...',
    placeholder: lang === 'en' ? 'Type your thought here...' : '在此输入你的思绪...'
  };

  // Mind Probes: Subliminal prompts to guide writing style without explicit selection
  const probes = lang === 'en' ? [
    "What detail anchors this moment?",
    "Where is the contradiction?",
    "What raw data are your senses receiving?",
    "What is the texture of this feeling?",
    "Find the anomaly in the ordinary."
  ] : [
    "此刻的锚点细节是什么？",
    "矛盾之处在哪里？",
    "你的感官接收到了什么原始数据？",
    "这种感觉的纹理是怎样的？",
    "寻找日常中的异常。"
  ];

  // Token estimation for progress indicator
  const estimateTokens = (text: string): number => {
    // Rough estimation: 1 token ≈ 0.75 words or 4 characters
    return Math.ceil(text.length / 4) + 300; // +300 for system prompt
  };

  useEffect(() => {
    // Cycle through probes every 5 seconds
    const interval = setInterval(() => {
      setProbeIndex((prev) => (prev + 1) % probes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [probes.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (submitOnEnter) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    } else {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setDetectedMode(null); // Reset

    // Track start time for performance monitoring
    const startTime = Date.now();
    const estimatedTokens = estimateTokens(input);

    try {
      // AI determines the mode now
      const analysis = await analyzeThought(input, aiConfig, lang);
      const duration = Math.round((Date.now() - startTime) / 100) / 10; // seconds with 1 decimal place

      console.log(`[AI Performance] Analysis completed in ${duration}s for ${estimatedTokens} estimated tokens`);

      // Set detected mode to trigger animation
      setDetectedMode(analysis.cognitiveType);

      const newNode: ThoughtNode = {
        id: crypto.randomUUID(),
        content: input,
        timestamp: Date.now(),
        mode: analysis.cognitiveType,
        analysis: analysis
      };

      onCapture(newNode);
      setInput('');
      setIsExpanded(false);

      // Clear the flash after a bit
      setTimeout(() => setDetectedMode(null), 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dynamic Styles based on detected mode
  const getBorderColor = () => {
    if (isAnalyzing && !detectedMode) return "border-violet-400/50";
    switch(detectedMode) {
      case CognitiveMode.OBSERVATION: return "border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]";
      case CognitiveMode.PARADOX: return "border-violet-500 shadow-[0_0_30px_rgba(167,139,250,0.3)]";
      case CognitiveMode.SENSORY: return "border-rose-500 shadow-[0_0_30px_rgba(251,113,133,0.3)]";
      default: return "border-slate-700 focus-within:border-slate-500";
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ease-out ${isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-90'}`}>
      
      {/* Mind Probe - Breathing Text */}
      <div className="h-8 mb-4 flex items-center justify-center overflow-hidden">
        {!isAnalyzing && (
             <div key={probeIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-700 text-xs font-mono text-slate-500 tracking-widest flex items-center gap-2 opacity-70">
                <Sparkles size={10} className="text-violet-400" />
                {probes[probeIndex]}
             </div>
        )}
        {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs font-mono text-violet-400 tracking-widest animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span>{t.analyzing}</span>
            </div>
        )}
      </div>

      {/* The Unified Input Field */}
      <div 
        className={`relative group bg-slate-900/80 backdrop-blur-xl border-2 rounded-2xl p-1 transition-all duration-500 shadow-2xl ${getBorderColor()}`}
      >
        
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (!isExpanded && e.target.value.length > 0) setIsExpanded(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsExpanded(true)}
          placeholder={t.placeholder}
          className={`w-full bg-transparent text-slate-200 p-6 text-lg font-light focus:outline-none resize-none placeholder:text-slate-700 transition-all duration-300 ${isExpanded ? 'h-40' : 'h-20'}`}
        />

        {/* Action Bar */}
        <div className="flex justify-between items-center px-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Fingerprint size={12} />
            <span>{t.active}</span>
            <span className="mx-1 opacity-20">|</span>
            <span className="opacity-70 flex items-center gap-1">
               {submitOnEnter ? <Keyboard size={10}/> : <span className="font-bold text-[10px]">CTRL+</span>}
               {submitOnEnter ? t.hintEnter : t.hintCtrlEnter}
            </span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isAnalyzing}
            className={`p-3 rounded-full transition-all duration-300 ${input.trim() ? `bg-slate-700 hover:bg-violet-600 text-white` : 'text-slate-700 bg-slate-800 cursor-not-allowed'}`}
          >
            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
      
      {/* Subliminal Stats */}
      <div className={`mt-4 text-center transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-xs text-slate-600 font-mono tracking-widest">
          {t.capture} • {input.length} {t.chars}
        </p>
      </div>
    </div>
  );
};

export default QuantumInput;
