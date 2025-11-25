
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language } from '../types';
import { Scan, X, Quote } from 'lucide-react';

interface SpectraMapProps {
  nodes: ThoughtNode[];
  lang: Language;
}

type DimensionKey = 'density' | 'mutation' | 'sensory' | 'logicFold' | 'grounding' | 'metaphor';

const SpectraMap: React.FC<SpectraMapProps> = ({ nodes, lang }) => {
  const [activeDimension, setActiveDimension] = useState<DimensionKey | null>(null);

  const t = {
    title: lang === 'en' ? 'Cognitive Spectrum' : '认知光谱',
    subtitle: lang === 'en' ? 'Distortion calibration' : '扭曲校准',
    density: lang === 'en' ? 'Density' : '密度',
    mutation: lang === 'en' ? 'Mutation' : '突变',
    sensory: lang === 'en' ? 'Sensory' : '感官',
    logicFold: lang === 'en' ? 'Logic Fold' : '逻辑折叠',
    grounding: lang === 'en' ? 'Grounding' : '锚定',
    metaphor: lang === 'en' ? 'Metaphor' : '隐喻',
    currentPsyche: lang === 'en' ? 'Current Psyche' : '当前心智',
    empty: lang === 'en' ? 'NO SIGNAL DETECTED' : '未检测到信号',
    reviewTitle: lang === 'en' ? 'Dimension Review' : '维度回顾',
    noThoughtsInDim: lang === 'en' ? 'No thoughts detected in this spectrum yet.' : '在此光谱中尚未检测到思维。',
    detected: lang === 'en' ? 'detected' : '已检测'
  };

  const calculateMetric = (key: keyof ThoughtNode['analysis']) => {
    if (nodes.length === 0) return 50;
    const sum = nodes.reduce((acc, node) => acc + (Number(node.analysis[key]) || 0), 0);
    return Math.round(sum / nodes.length);
  };

  const avgDepth = calculateMetric('depthScore');
  const avgUnique = calculateMetric('styleUniqueness');
  
  const emotionScore = nodes.length > 0 ? nodes.filter(n => n.mode === CognitiveMode.SENSORY).length * 10 + 20 : 0;
  const paradoxScore = nodes.length > 0 ? nodes.filter(n => n.mode === CognitiveMode.PARADOX).length * 15 + 10 : 0;
  const anchorScore = nodes.length > 0 ? nodes.filter(n => n.mode === CognitiveMode.OBSERVATION).length * 10 + 30 : 0;
  const metaphorScore = nodes.length > 0 ? Math.min(100, nodes.filter(n => n.analysis.metaphorDetected).length * 20) : 0;

  const data = [
    { id: 'density', subject: t.density, A: avgDepth, fullMark: 100 },
    { id: 'mutation', subject: t.mutation, A: avgUnique, fullMark: 100 }, 
    { id: 'sensory', subject: t.sensory, A: Math.min(100, emotionScore), fullMark: 100 },
    { id: 'logicFold', subject: t.logicFold, A: Math.min(100, paradoxScore), fullMark: 100 }, 
    { id: 'grounding', subject: t.grounding, A: Math.min(100, anchorScore), fullMark: 100 }, 
    { id: 'metaphor', subject: t.metaphor, A: metaphorScore, fullMark: 100 },
  ];

  // Helper to filter thoughts based on the clicked dimension
  const getThoughtsForDimension = (dim: DimensionKey): ThoughtNode[] => {
    switch (dim) {
      case 'density': return [...nodes].sort((a, b) => b.analysis.depthScore - a.analysis.depthScore).slice(0, 10);
      case 'mutation': return [...nodes].sort((a, b) => b.analysis.styleUniqueness - a.analysis.styleUniqueness).slice(0, 10);
      case 'sensory': return nodes.filter(n => n.mode === CognitiveMode.SENSORY);
      case 'logicFold': return nodes.filter(n => n.mode === CognitiveMode.PARADOX);
      case 'grounding': return nodes.filter(n => n.mode === CognitiveMode.OBSERVATION);
      case 'metaphor': return nodes.filter(n => n.analysis.metaphorDetected);
      default: return [];
    }
  };

  const activeThoughts = activeDimension ? getThoughtsForDimension(activeDimension) : [];

  // Custom tick component to make labels clickable
  const CustomTick = ({ payload, x, y }: any) => {
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={10}
        fontFamily="Space Mono"
        onClick={() => setActiveDimension(data[payload.index].id as DimensionKey)}
        className="cursor-pointer hover:fill-violet-400 hover:font-bold transition-all select-none"
      >
        {payload.value}
      </text>
    );
  };

  return (
    <>
      <div className="w-full h-[300px] bg-slate-900/50 rounded-3xl border border-slate-800 p-4 relative group">
        <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">{t.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{t.subtitle}</p>
        </div>
        
        {nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
              <Scan className="text-slate-700 mb-2 opacity-50" size={32} />
              <p className="text-[10px] font-mono text-slate-700 tracking-[0.2em]">{t.empty}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="55%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={<CustomTick />}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                  name={t.currentPsyche}
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
              />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
              />
              </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Review Modal */}
      {activeDimension && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setActiveDimension(null)}>
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveDimension(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={18} />
            </button>
            
            <div className="mb-6 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/30 text-violet-400">
                  <Scan size={16} />
               </div>
               <div>
                 <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">{t.reviewTitle}</h3>
                 <h2 className="text-xl text-white font-bold">{data.find(d => d.id === activeDimension)?.subject}</h2>
               </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar space-y-4 pr-2">
               {activeThoughts.length > 0 ? (
                 activeThoughts.map(node => (
                   <div key={node.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-violet-500/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            node.mode === CognitiveMode.OBSERVATION ? 'text-cyan-400 border-cyan-900/50' :
                            node.mode === CognitiveMode.PARADOX ? 'text-violet-400 border-violet-900/50' :
                            'text-rose-400 border-rose-900/50'
                        }`}>
                            {node.mode}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {new Date(node.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm font-serif italic leading-relaxed mb-3">
                         "{node.content}"
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-2">
                         <Quote size={10} className="text-violet-500" />
                         <span className="truncate text-violet-400/80">{node.analysis.feedback}</span>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 text-slate-600 text-xs italic">
                    {t.noThoughtsInDim}
                 </div>
               )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
               <p className="text-[10px] text-slate-600 font-mono">{activeThoughts.length} {t.detected}</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SpectraMap;
