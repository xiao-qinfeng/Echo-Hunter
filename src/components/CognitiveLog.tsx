
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
    <div className="w-full space-y-3 animate-in fade-in slide-in-bottom-4 duration-500">
      {sortedNodes.map((node) => {
        const isExpanded = expandedIds.has(node.id);
        const theme = getTheme(node.mode);

        return (
          <div
            key={node.id}
            className={`w-full bg-slate-900/30 border border-slate-800 rounded-lg transition-all duration-300 hover:border-slate-700 ${theme.bg} overflow-hidden`}
          >
            {/* Header / Summary - Click to toggle */}
            <div
              onClick={() => toggleExpand(node.id)}
              className="p-4 cursor-pointer group"
            >
              {/* Mobile: Vertical Stack | Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                {/* Time & Mode Row */}
                <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-none">
                  {/* Time - Mobile: single line */}
                  <div className="text-xs font-mono text-slate-500">
                     {new Date(node.timestamp).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})} {' '}
                     {new Date(node.timestamp).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})}
                  </div>

                  {/* Mode Tag - Smaller on mobile */}
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${theme.badge}`}>
                     {getModeLabel(node.mode)}
                  </div>
                </div>

                {/* Share Button */}
                <div className="sm:ml-auto order-1 sm:order-none mb-2 sm:mb-0 sm:self-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onShare(node); }}
                    className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors p-1 text-xs"
                  >
                    <Share2 size={12} /> Share
                  </button>
                </div>
              </div>

              {/* The Echo (Primary Content) - Full width on mobile */}
              <div className="text-base sm:text-sm text-slate-300 italic font-serif mt-2 opacity-90 group-hover:opacity-100 group-hover:text-white transition-opacity pr-8">
                 "{node.analysis.feedback}"
              </div>

              {/* Expand Indicator - Moved to bottom right for better UX */}
              <div className="flex justify-end mt-3 sm:mt-2">
                <div className="text-slate-500 group-hover:text-slate-400 transition-colors">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>

            {/* Expanded Content - Raw Input */}
            {isExpanded && (
               <div className="bg-slate-900/50 px-4 pb-6 pt-2 animate-in slide-in-from-top-1 duration-200">
                  <div className={`border-l-2 pl-4 sm:ml-0 ${theme.border}`}>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                          {t.original}
                      </div>

                      <p className="text-slate-200 leading-relaxed font-light mb-4 text-sm sm:text-base">
                        {node.content}
                      </p>

                      {/* Mobile: Vertical | Desktop: Horizontal */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-[10px] font-mono text-slate-500">
                          <div className="flex items-center gap-1">
                              <Activity size={10} className="sm:hidden" />
                              <Activity size={12} className="hidden sm:block" />
                              {t.depth}: <span className="text-slate-300">{node.analysis.depthScore}</span>
                          </div>
                          <div className="flex items-center gap-1">
                              <Fingerprint size={10} className="sm:hidden" />
                              <Fingerprint size={12} className="hidden sm:block" />
                              {t.unique}: <span className="text-slate-300">{node.analysis.styleUniqueness}</span>
                          </div>
                          <div className="text-slate-500">
                              / {node.analysis.distortionType}
                          </div>
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
