
import React from 'react';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language } from '../types';
import { X, Activity, Fingerprint, Brain, Database, Cpu, User, Github, ExternalLink } from 'lucide-react';

interface SystemStatusProps {
  isOpen: boolean;
  onClose: () => void;
  thoughts: ThoughtNode[];
  lang: Language;
  userName: string;
  onUpdateName: (name: string) => void;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isOpen, onClose, thoughts, lang, userName, onUpdateName }) => {
  if (!isOpen) return null;

  const t = {
    title: lang === 'en' ? 'SYSTEM IDENTITY' : '系统身份',
    subtitle: lang === 'en' ? 'Cognitive Genome Sequence' : '认知基因序列',
    pilot: lang === 'en' ? 'PILOT ALIAS' : '驾驶员代号',
    total: lang === 'en' ? 'TOTAL FRAGMENTS' : '思维碎片总数',
    dominant: lang === 'en' ? 'DOMINANT MODE' : '主导认知模式',
    resonance: lang === 'en' ? 'RESONANCE FREQ' : '平均共鸣频率',
    mutation: lang === 'en' ? 'MUTATION RATE' : '平均突变率',
    age: lang === 'en' ? 'SYSTEM RUNTIME' : '系统运行时间',
    empty: lang === 'en' ? 'INSUFFICIENT DATA' : '数据不足',
    modeObs: lang === 'en' ? 'OBSERVATION' : '白描 (Observation)',
    modePar: lang === 'en' ? 'PARADOX' : '思辨 (Paradox)',
    modeSen: lang === 'en' ? 'SENSORY' : '通感 (Sensory)',
    unknown: 'N/A'
  };

  // Calculations
  const totalThoughts = thoughts.length;
  
  const avgDepth = totalThoughts > 0 
    ? Math.round(thoughts.reduce((acc, t) => acc + t.analysis.depthScore, 0) / totalThoughts) 
    : 0;

  const avgUnique = totalThoughts > 0 
    ? Math.round(thoughts.reduce((acc, t) => acc + t.analysis.styleUniqueness, 0) / totalThoughts) 
    : 0;

  const modeCounts = thoughts.reduce((acc, t) => {
    acc[t.mode] = (acc[t.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as CognitiveMode | undefined;

  const getModeLabel = (mode?: CognitiveMode) => {
    if (!mode) return t.unknown;
    switch (mode) {
      case CognitiveMode.OBSERVATION: return t.modeObs;
      case CognitiveMode.PARADOX: return t.modePar;
      case CognitiveMode.SENSORY: return t.modeSen;
      default: return t.unknown;
    }
  };

  const firstThoughtDate = thoughts.length > 0 ? thoughts[0].timestamp : Date.now();
  const daysActive = Math.max(1, Math.ceil((Date.now() - firstThoughtDate) / (1000 * 60 * 60 * 24)));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-cyan-500/30 w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)] relative">
        
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 bg-cyan-950/10 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cyan-900/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                    <Cpu size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-mono text-cyan-400 tracking-wider uppercase font-bold">{t.title}</h2>
                    <p className="text-[10px] text-cyan-600 font-mono uppercase tracking-[0.2em]">{t.subtitle}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-cyan-400 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
            
            {/* Alias Input */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 shadow-inner">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <User size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-wider">{t.pilot}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-cyan-500 font-mono animate-pulse">{'>'}</span>
                    <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => onUpdateName(e.target.value)}
                        className="bg-transparent border-none text-xl font-mono text-white focus:outline-none w-full uppercase placeholder-slate-600"
                        placeholder="ENTER ALIAS"
                    />
                </div>
            </div>

            {/* Main Stat Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Database size={14} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">{t.total}</span>
                    </div>
                    <div className="text-2xl font-mono text-white">{totalThoughts}</div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Activity size={14} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">{t.age}</span>
                    </div>
                    <div className="text-2xl font-mono text-white">{daysActive} <span className="text-xs text-slate-600">DAYS</span></div>
                </div>
            </div>

            {/* Dominant Mode */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={64} className="text-white"/>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">{t.dominant}</div>
                <div className={`text-xl font-mono ${
                    dominantMode === CognitiveMode.OBSERVATION ? 'text-cyan-400' :
                    dominantMode === CognitiveMode.PARADOX ? 'text-violet-400' :
                    dominantMode === CognitiveMode.SENSORY ? 'text-rose-400' : 'text-slate-400'
                }`}>
                    {getModeLabel(dominantMode)}
                </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 pt-2">
                <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-1">
                        <span className="flex items-center gap-1"><Activity size={12}/> {t.resonance}</span>
                        <span>{avgDepth}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000" style={{ width: `${avgDepth}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-1">
                        <span className="flex items-center gap-1"><Fingerprint size={12}/> {t.mutation}</span>
                        <span>{avgUnique}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000" style={{ width: `${avgUnique}%` }}></div>
                    </div>
                </div>
            </div>
            
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 mb-2">
            <div>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            <div>STATUS: ONLINE</div>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href="https://github.com/xiao-qinfeng/Echo-Hunter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700 hover:border-cyan-500 text-slate-500 hover:text-cyan-400 transition-colors"
              title="GitHub Repository"
            >
              <Github size={10} />
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/xiao-qinfeng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded border border-slate-700 hover:border-cyan-500 text-slate-500 hover:text-cyan-400 transition-colors"
              title="Personal Profile"
            >
              <ExternalLink size={10} />
              <span>Profile</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
