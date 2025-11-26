
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CognitiveMode } from '../types';
import type { ThoughtNode, Language } from '../types';
import { X, Calendar, Activity, Fingerprint, Share2 } from 'lucide-react';

interface NeuroGardenProps {
  nodes: ThoughtNode[];
  lang: Language;
  onShare?: (node: ThoughtNode) => void;
}

const NeuroGarden: React.FC<NeuroGardenProps> = ({ nodes, lang, onShare }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ThoughtNode | null>(null);

  const t = {
    title: lang === 'en' ? 'Neural Topography' : '神经拓扑',
    subtitle: lang === 'en' ? 'Growth driven by cognitive density' : '由认知密度驱动的生长',
    emptyTitle: lang === 'en' ? 'Garden Dormant' : '花园休眠中',
    emptyDesc: lang === 'en' ? 'Feed the system with your first cognitive fragment to initiate growth.' : '输入你的第一个认知碎片以启动生长。',
    close: lang === 'en' ? 'Close' : '关闭',
    analysis: lang === 'en' ? 'Cognitive Analysis' : '认知分析',
    feedback: lang === 'en' ? 'System Echo' : '系统回声'
  };

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = 500;

    // 修复：确保容器有有效尺寸
    if (width <= 0 || height <= 0) {
      console.warn('NeuroGarden: 容器尺寸无效', { width, height });
      return;
    }

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    // If no nodes, we just render the container (the empty state overlay handles the message)
    if (nodes.length === 0) return;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    // Simulation forces
    const simulation = d3.forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.analysis.depthScore / 2 + 15).iterations(2))
      .force("y", d3.forceY(height/2).strength(0.05));

    // Links (conceptual connections based on time/mode)
    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
        links.push({ source: nodes[i].id, target: nodes[i+1].id });
    }

    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.2)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    // Nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any)
      .on("click", (event, d) => {
          event.stopPropagation();
          setSelectedNode(d);
      });

    // Node Circles (Size = Depth, Color = Mode)
    nodeGroup.append("circle")
      .attr("r", (d: any) => Math.max(8, d.analysis.depthScore / 4))
      .attr("fill", (d: any) => {
        switch(d.mode) {
            case CognitiveMode.OBSERVATION: return "#22d3ee"; // Cyan
            case CognitiveMode.PARADOX: return "#a78bfa"; // Violet
            case CognitiveMode.SENSORY: return "#fb7185"; // Rose
            default: return "#94a3b8";
        }
      })
      .attr("fill-opacity", 0.2)
      .attr("stroke", (d: any) => {
        switch(d.mode) {
            case CognitiveMode.OBSERVATION: return "#22d3ee";
            case CognitiveMode.PARADOX: return "#a78bfa";
            case CognitiveMode.SENSORY: return "#fb7185";
            default: return "#94a3b8";
        }
      })
      .attr("stroke-width", (d: any) => d.analysis.styleUniqueness > 80 ? 3 : 1) // Thicker stroke for unique thoughts
      .style("filter", "drop-shadow(0px 0px 8px rgba(255,255,255,0.1))")
      .style("transition", "fill-opacity 0.3s");

    // "Nucleus" of the thought
    nodeGroup.append("circle")
        .attr("r", 2)
        .attr("fill", "#fff");

    // Labels for significant thoughts
    nodeGroup.append("text")
      .text((d: any) => d.content.substring(0, 15) + (d.content.length > 15 ? "..." : ""))
      .attr("x", (d: any) => Math.max(8, d.analysis.depthScore / 4) + 6)
      .attr("y", 4)
      .attr("font-family", "Space Mono")
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8")
      .style("pointer-events", "none")
      .style("opacity", (d: any) => d.analysis.depthScore > 60 ? 1 : 0.5);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes]);

  return (
    <div ref={wrapperRef} className="w-full h-[500px] bg-slate-900/50 rounded-3xl border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">{t.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{t.subtitle}</p>
        </div>
        
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
        
        {/* Empty State Overlay */}
        {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-0 pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-slate-800 bg-slate-900/50 flex items-center justify-center mb-4 text-slate-600">
                    <Activity size={24} />
                </div>
                <h4 className="text-slate-400 font-mono text-sm uppercase tracking-wider mb-2">{t.emptyTitle}</h4>
                <p className="text-slate-600 text-xs max-w-xs">{t.emptyDesc}</p>
            </div>
        )}

        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* Node Detail Modal */}
        {selectedNode && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedNode(null)}>
                <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                    
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                             <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase tracking-wider ${
                                selectedNode.mode === CognitiveMode.OBSERVATION ? 'text-cyan-400 border-cyan-900 bg-cyan-900/20' :
                                selectedNode.mode === CognitiveMode.PARADOX ? 'text-violet-400 border-violet-900 bg-violet-900/20' :
                                'text-rose-400 border-rose-900 bg-rose-900/20'
                            }`}>
                                {selectedNode.mode}
                            </span>
                            
                            {onShare && (
                                <button 
                                    onClick={() => onShare(selectedNode)}
                                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    <Share2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="mt-4 text-slate-200 font-serif italic text-lg leading-relaxed">
                            "{selectedNode.content}"
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-slate-600 text-[10px] font-mono">
                            <Calendar size={10} />
                            {new Date(selectedNode.timestamp).toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-800 pt-4">
                         <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">{t.feedback}</p>
                            <p className="text-xs text-slate-400 italic">"{selectedNode.analysis.feedback}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1"><Activity size={10}/> Depth</p>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/50" style={{ width: `${selectedNode.analysis.depthScore}%` }}></div>
                                </div>
                             </div>
                             <div>
                                <p className="text-[10px] font-mono text-slate-500 uppercase mb-1 flex items-center gap-1"><Fingerprint size={10}/> Unique</p>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500" style={{ width: `${selectedNode.analysis.styleUniqueness}%` }}></div>
                                </div>
                             </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Filter</p>
                            <p className="text-xs text-violet-300 font-mono">{selectedNode.analysis.distortionType}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default NeuroGarden;
