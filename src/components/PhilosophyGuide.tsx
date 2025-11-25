import React from 'react';
import { X, Zap, GitGraph, Fingerprint, Layers } from 'lucide-react';
import type { Language } from '../types';

interface PhilosophyGuideProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const PhilosophyGuide: React.FC<PhilosophyGuideProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const content = {
    title: lang === 'en' ? 'SYSTEM MANUAL: MIND_OS v1.0' : '系统手册：心智_OS v1.0',
    subtitle: lang === 'en' ? 'Operating instructions for your cognitive prosthesis' : '认知义肢操作指南',
    sections: [
      {
        icon: Zap,
        title: lang === 'en' ? 'Quantum Capture' : '量子捕获',
        desc: lang === 'en' 
          ? "Thoughts decay within 3 seconds. The input field is designed to bypass your 'internal editor'. Don't write perfect sentences. Capture the raw cognitive motion: the anchor, the paradox, or the sensory data." 
          : "思维在3秒内衰变。输入框旨在绕过你的'内部审查员'。不要写完美的句子。捕获原始的认知动作：锚点、悖论或感官数据。"
      },
      {
        icon: GitGraph,
        title: lang === 'en' ? 'The Anti-Forest' : '反向森林',
        desc: lang === 'en'
          ? "Most apps reward you for time spent. We reward you for density. Your 'Neuro-Garden' only grows when the AI detects deep cognitive structure. It's not a to-do list; it's a living map of your psyche."
          : "大多数应用奖励你的时间消耗。我们奖励密度。你的'神经花园'只有在AI检测到深度认知结构时才会生长。它不是待办事项，而是你心智的活地图。"
      },
      {
        icon: Fingerprint,
        title: lang === 'en' ? 'Error Aesthetics' : '错误美学',
        desc: lang === 'en'
          ? "Standard writing tools correct your mistakes. We celebrate them. Unique style is simply a habit of deviating from the norm. We track your 'distortions' to help you cultivate a unique language fingerprint."
          : "标准写作工具纠正你的错误。我们庆祝它们。独特的风格只是偏离常态的习惯。我们追踪你的'扭曲'，帮你培养独特的语言指纹。"
      },
      {
        icon: Layers,
        title: lang === 'en' ? 'The Modes' : '三种模式',
        desc: lang === 'en'
          ? "OBSERVATION (Anchor): Ground yourself in objective reality.\nPARADOX (Fold): Find where truth contradicts itself.\nSENSORY (Decode): bypass logic, access raw feeling."
          : "观察 (锚点)：将自己锚定在客观现实中。\n悖论 (折叠)：寻找真理自相矛盾之处。\n感官 (解码)：绕过逻辑，访问原始感觉。"
      }
    ],
    close: lang === 'en' ? 'ACKNOWLEDGE' : '确认知晓'
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-violet-500/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-mono text-violet-300 tracking-wider uppercase">{content.title}</h2>
                <p className="text-xs text-slate-500 font-mono mt-2">{content.subtitle}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content Scroll */}
        <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
            {content.sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                    <div key={idx} className="flex gap-6 group">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-colors">
                            <Icon size={20} className="text-slate-400 group-hover:text-violet-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-200 mb-2 font-mono uppercase">{section.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">
                                {section.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-center">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/5 hover:bg-violet-600 hover:text-white text-slate-400 rounded-full font-mono text-xs tracking-[0.2em] transition-all border border-white/10"
            >
                [{content.close}]
            </button>
        </div>
      </div>
    </div>
  );
};

export default PhilosophyGuide;