
import React, { useState } from 'react';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language } from '../types';
import { Share2, ChevronDown, ChevronUp, Activity, Fingerprint } from 'lucide-react';

interface CognitiveLogProps {
  nodes: ThoughtNode[];
  lang: Language;
  onShare: (node: ThoughtNode) => void;
}

const CognitiveLog: React.FC<CognitiveLogProps> = ({ nodes, lang, onShare }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const t = {
    empty: lang === 'en' ? 'NO DATA LOGGED' : '暂无数据记录',
    original: lang === 'en' ? 'ORIGINAL INPUT' : '原始输入',
    depth: lang === 'en' ? 'DEPTH' : '深度',
    unique: lang === 'en' ? 'UNIQUE' : '偏差',
    modeObs: lang === 'en' ? 'OBSERVATION' : '白描',
    modePar: lang === 'en' ? 'PARADOX' : '思辨',
    modeSen: lang === 'en' ? 'SENSORY' : '通感'
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const getModeLabel = (mode: CognitiveMode) => {
    switch (mode) {
      case CognitiveMode.OBSERVATION: return t.modeObs;
      case CognitiveMode.PARADOX: return t.modePar;
      case CognitiveMode.SENSORY: return t.modeSen;
      default: return mode;
    }
  };

  const getTheme = (mode: CognitiveMode) => {
    switch (mode) {
      case CognitiveMode.OBSERVATION: return { color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'hover:bg-cyan-950/20', badge: 'bg-cyan-500/10 text-cyan-300' };
      case CognitiveMode.PARADOX: return { color: 'text-violet-400', border: 'border-violet-500/30', bg: 'hover:bg-violet-950/20', badge: 'bg-violet-500/10 text-violet-300' };
      case CognitiveMode.SENSORY: return { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'hover:bg-rose-950/20', badge: 'bg-rose-500/10 text-rose-300' };
    }
  };

  // Sort by newest first
  const sortedNodes = [...nodes].reverse();

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border-t border-slate-800">
        <div className="text-slate-600 font-mono text-xs tracking-widest">{t.empty}</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {sortedNodes.map((node) => {
        const isExpanded = expandedIds.has(node.id);
        const theme = getTheme(node.mode);

        return (
          <div 
            key={node.id} 
            className={`w-full border-b border-slate-800 last:border-0 transition-all duration-300 ${theme.bg}`}
          >
            {/* Header / Summary - Click to toggle */}
            <div 
              onClick={() => toggleExpand(node.id)}
              className="p-4 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {/* Time */}
                <div className="text-[10px] font-mono text-slate-600 min-w-[60px]">
                   {new Date(node.timestamp).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                   <br/>
                   {new Date(node.timestamp).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}
                </div>

                {/* Mode Tag */}
                <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider min-w-[80px] text-center ${theme.badge}`}>
                   {getModeLabel(node.mode)}
                </div>

                {/* The Echo (Primary Content) */}
                <div className="text-sm text-slate-300 italic font-serif truncate pr-4 opacity-90 group-hover:opacity-100 group-hover:text-white transition-opacity">
                   "{node.analysis.feedback}"
                </div>
              </div>

              <div className="text-slate-600 group-hover:text-slate-400">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {/* Expanded Content - Raw Input */}
            {isExpanded && (
               <div className="bg-slate-900/50 px-4 pb-6 pt-2 animate-in slide-in-from-top-1 duration-200">
                  <div className={`border-l-2 pl-4 ml-[76px] ${theme.border}`}>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                          <span>{t.original}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onShare(node); }}
                            className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors p-1"
                          >
                            <Share2 size={12} /> Share
                          </button>
                      </div>
                      
                      <p className="text-slate-200 leading-relaxed font-light mb-4">
                        {node.content}
                      </p>

                      <div className="flex gap-6 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                              <Activity size={10} /> {t.depth}: <span className="text-slate-300">{node.analysis.depthScore}</span>
                          </span>
                          <span className="flex items-center gap-1">
                              <Fingerprint size={10} /> {t.unique}: <span className="text-slate-300">{node.analysis.styleUniqueness}</span>
                          </span>
                           <span className="text-slate-500">
                              / {node.analysis.distortionType}
                          </span>
                      </div>
                  </div>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CognitiveLog;
