
import React, { useState, useEffect, useRef } from 'react';
import QuantumInput from './components/QuantumInput';
import NeuroGarden from './components/NeuroGarden';
import SpectraMap from './components/SpectraMap';
import CognitiveLog from './components/CognitiveLog';
import PhilosophyGuide from './components/PhilosophyGuide';
import ShareModal from './components/ShareModal';
import SystemStatus from './components/SystemStatus';
import type { ThoughtNode, Language, AIConfig, AIProvider } from './types';
import { DEFAULT_AI_CONFIG, PROVIDER_MODELS } from './types';
import { Activity, Wind, Dna, Settings, Globe, X, Download, HelpCircle, ChevronDown, Save, CheckCircle2, Circle, Plus, Trash2, Share2, LayoutGrid, List, Github, ExternalLink } from 'lucide-react';

const PROVIDER_PRESETS: Record<AIProvider, Partial<AIConfig>> = {
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com', model: 'gemini-2.5-flash' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  kimi: { baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4' },
  qwen: { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo' },
  claude: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-20240620' },
  custom: { baseUrl: '', model: '' }
};

const PROVIDER_LABELS: Record<AIProvider, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI (GPT)',
  deepseek: 'DeepSeek (深度求索)',
  kimi: 'Moonshot (Kimi)',
  zhipu: 'Zhipu (智谱清言)',
  qwen: 'Qwen (通义千问)',
  claude: 'Anthropic (Claude)',
  custom: 'Custom (自定义)'
};

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<ThoughtNode[]>([]);
  const [lang, setLang] = useState<Language>('zh');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [shareNode, setShareNode] = useState<ThoughtNode | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [submitOnEnter, setSubmitOnEnter] = useState(true);
  const [viewMode, setViewMode] = useState<'topography' | 'archive'>('topography');
  const [userName, setUserName] = useState('VOYAGER');
  
  // Custom models state
  const [customModels, setCustomModels] = useState<Record<string, string[]>>({});
  const [newModelInput, setNewModelInput] = useState('');

  // Ref to hold current thoughts for the interval closure
  const thoughtsRef = useRef(thoughts);

  useEffect(() => {
    thoughtsRef.current = thoughts;
  }, [thoughts]);

  // Load config and thoughts from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('genome_ai_config');
    if (savedConfig) {
      setAiConfig(JSON.parse(savedConfig));
    } else {
      // Try to load API key from environment variables based on provider
      // Mapping: provider -> environment variable key
      const providerEnvMap: Record<AIProvider, string> = {
        gemini: 'VITE_GEMINI_API_KEY',
        openai: 'VITE_OPENAI_API_KEY',
        deepseek: 'VITE_DEEPSEEK_API_KEY',
        kimi: 'VITE_KIMI_API_KEY',
        zhipu: 'VITE_ZHIPU_API_KEY',
        qwen: 'VITE_QWEN_API_KEY',
        claude: 'VITE_CLAUDE_API_KEY',
        custom: 'VITE_API_KEY'
      };

      const envKey = providerEnvMap[DEFAULT_AI_CONFIG.provider];
      const env = import.meta.env;
      const envApiKey = env[envKey as keyof typeof env];

      if (envApiKey) {
        setAiConfig({ ...DEFAULT_AI_CONFIG, apiKey: envApiKey as string });
      }
    }

    const savedThoughts = localStorage.getItem('genome_thoughts');
    if (savedThoughts) {
      try {
        setThoughts(JSON.parse(savedThoughts));
      } catch (e) {
        console.error("Failed to load thoughts", e);
      }
    }

    const savedSubmitSettings = localStorage.getItem('genome_submit_enter');
    if (savedSubmitSettings !== null) {
      setSubmitOnEnter(savedSubmitSettings === 'true');
    }

    const savedCustomModels = localStorage.getItem('genome_custom_models');
    if (savedCustomModels) {
      setCustomModels(JSON.parse(savedCustomModels));
    }

    const savedUserName = localStorage.getItem('genome_user_name');
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  // Save config on change
  const handleConfigChange = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    localStorage.setItem('genome_ai_config', JSON.stringify(newConfig));
  };

  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('genome_user_name', name);
  };

  const toggleSubmitOnEnter = () => {
    setSubmitOnEnter(prev => {
      const newValue = !prev;
      localStorage.setItem('genome_submit_enter', String(newValue));
      return newValue;
    });
  }

  const addCustomModel = () => {
    if (!newModelInput.trim()) return;
    const provider = aiConfig.provider;
    setCustomModels(prev => {
      const updated = {
        ...prev,
        [provider]: [...(prev[provider] || []), newModelInput.trim()]
      };
      localStorage.setItem('genome_custom_models', JSON.stringify(updated));
      return updated;
    });
    handleConfigChange({ ...aiConfig, model: newModelInput.trim() });
    setNewModelInput('');
  };

  const removeCustomModel = (modelToRemove: string) => {
    const provider = aiConfig.provider;
    setCustomModels(prev => {
      const updated = {
        ...prev,
        [provider]: (prev[provider] || []).filter(m => m !== modelToRemove)
      };
      localStorage.setItem('genome_custom_models', JSON.stringify(updated));
      return updated;
    });
    if (aiConfig.model === modelToRemove) {
      handleConfigChange({ ...aiConfig, model: PROVIDER_MODELS[provider]?.[0] || '' });
    }
  };

  // Auto-save Interval (Every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (thoughtsRef.current.length > 0) {
        localStorage.setItem('genome_thoughts', JSON.stringify(thoughtsRef.current));
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCapture = (node: ThoughtNode) => {
    setThoughts(prev => {
      const updated = [...prev, node];
      localStorage.setItem('genome_thoughts', JSON.stringify(updated)); 
      return updated;
    });
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(thoughts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cognitive_genome_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Translations
  const t = {
    title: lang === 'en' ? 'COGNITIVE' : '认知',
    subtitle: lang === 'en' ? 'GENOME' : '基因组',
    demoMode: lang === 'en' ? 'DEMO MODE: MISSING KEY' : '演示模式：缺少密钥',
    settings: lang === 'en' ? 'Settings' : '设置',
    save: lang === 'en' ? 'Save Connection' : '保存连接',
    neuralEcho: lang === 'en' ? 'Neural Echo' : '神经回声',
    depth: lang === 'en' ? 'DEPTH' : '深度',
    mutation: lang === 'en' ? 'MUTATION' : '突变',
    deviationLog: lang === 'en' ? 'Deviation Log' : '偏差日志',
    noDeviation: lang === 'en' ? 'No significant deviations yet.\nTry being more absurd.' : '暂无显著偏差。\n尝试更荒谬一点。',
    footer: lang === 'en' ? 'Language is not a tool • It is a habit' : '语言不是工具 • 而是一种习惯',
    detected: lang === 'en' ? 'detected' : '已检测',
    provider: lang === 'en' ? 'AI Provider' : 'AI 提供商',
    apiKey: lang === 'en' ? 'API Key' : 'API 密钥',
    baseUrl: lang === 'en' ? 'API Address (Base URL)' : 'API 接口地址',
    model: lang === 'en' ? 'Model Selection' : '模型选择',
    addModel: lang === 'en' ? 'Add custom model' : '添加自定义模型',
    export: lang === 'en' ? 'Export Data (JSON)' : '导出数据 (JSON)',
    dataMgmt: lang === 'en' ? 'Data Management' : '数据管理',
    autoSaved: lang === 'en' ? 'Auto-saved' : '自动保存',
    uiPrefs: lang === 'en' ? 'Interface Preferences' : '界面偏好',
    enterToSend: lang === 'en' ? 'Press Enter to Send' : '回车键发送消息',
    enterToSendDesc: lang === 'en' ? 'If disabled, use Ctrl+Enter to send. Enter will create a new line.' : '禁用后，使用 Ctrl+Enter 发送。回车键将换行。',
    viewTopo: lang === 'en' ? 'Topography' : '拓扑',
    viewLog: lang === 'en' ? 'Archive' : '档案'
  };

  const lastThought = thoughts[thoughts.length - 1];
  const currentProviderModels = [...(PROVIDER_MODELS[aiConfig.provider] || []), ...(customModels[aiConfig.provider] || [])];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-violet-500/30 font-sans">
      
      <PhilosophyGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} lang={lang} />
      <SystemStatus 
        isOpen={isStatusOpen} 
        onClose={() => setIsStatusOpen(false)} 
        thoughts={thoughts} 
        lang={lang} 
        userName={userName}
        onUpdateName={handleNameChange}
      />
      <ShareModal 
        node={shareNode} 
        onClose={() => setShareNode(null)} 
        lang={lang} 
        userName={userName}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => setIsStatusOpen(true)}>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 hover:border-violet-500 transition-colors">
            <Dna className="text-violet-400" size={20} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-sm tracking-widest text-slate-200 leading-none group">
              {t.title}<br/>{t.subtitle}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          {lastSaved && (
             <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-slate-600 uppercase">
                <Save size={10} />
                <span>{t.autoSaved} {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          )}

          {(!aiConfig.apiKey && !import.meta.env.VITE_API_KEY) && (
               <div className="hidden md:block bg-yellow-900/20 border border-yellow-700/50 text-yellow-600 px-4 py-2 rounded-full text-xs font-mono">
                  {t.demoMode}
               </div>
          )}
          
          <button onClick={() => setIsGuideOpen(true)} className="p-2 text-slate-500 hover:text-violet-400 transition-colors" title="Manual">
            <HelpCircle size={20} />
          </button>

          <button onClick={toggleLang} className="p-2 text-slate-500 hover:text-slate-200 transition-colors">
            <Globe size={20} />
          </button>
          
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-slate-200 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* ... Existing Settings Content ... */}
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200">
              <X size={20} />
            </button>
            <h2 className="text-lg font-mono text-slate-200 mb-6 flex items-center gap-2">
              <Settings size={18} /> {t.settings}
            </h2>
            
            <div className="space-y-6">
              
              {/* UI Preferences */}
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.uiPrefs}</label>
                <div 
                  className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors border border-transparent hover:border-slate-600"
                  onClick={toggleSubmitOnEnter}
                >
                  <div className={`mt-0.5 shrink-0 ${submitOnEnter ? 'text-violet-400' : 'text-slate-600'}`}>
                    {submitOnEnter ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <div>
                    <div className="text-sm text-slate-200 font-medium mb-0.5">{t.enterToSend}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{t.enterToSendDesc}</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              {/* API Config Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.provider}</label>
                  <div className="relative">
                    <select
                        value={aiConfig.provider}
                        onChange={(e) => {
                          const newProvider = e.target.value as AIProvider;
                          const newPreset = PROVIDER_PRESETS[newProvider];

                          // Try to load API key from environment for the new provider
                          const providerEnvMap: Record<AIProvider, string> = {
                            gemini: 'VITE_GEMINI_API_KEY',
                            openai: 'VITE_OPENAI_API_KEY',
                            deepseek: 'VITE_DEEPSEEK_API_KEY',
                            kimi: 'VITE_KIMI_API_KEY',
                            zhipu: 'VITE_ZHIPU_API_KEY',
                            qwen: 'VITE_QWEN_API_KEY',
                            claude: 'VITE_CLAUDE_API_KEY',
                            custom: 'VITE_API_KEY'
                          };

                          const envKey = providerEnvMap[newProvider];
                          const env = import.meta.env;
                          const envApiKey = env[envKey as keyof typeof env];

                          handleConfigChange({
                            ...aiConfig,
                            provider: newProvider,
                            ...newPreset,
                            apiKey: envApiKey || aiConfig.apiKey // Use env key if available, otherwise keep current
                          });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono appearance-none"
                    >
                        {Object.keys(PROVIDER_LABELS).map((p) => (
                            <option key={p} value={p}>{PROVIDER_LABELS[p as AIProvider]}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.baseUrl}</label>
                  <input 
                    type="text" 
                    value={aiConfig.baseUrl || ''} 
                    onChange={(e) => handleConfigChange({ ...aiConfig, baseUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.apiKey}</label>
                  <input 
                    type="password" 
                    value={aiConfig.apiKey || ''} 
                    onChange={(e) => handleConfigChange({ ...aiConfig, apiKey: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                    placeholder="sk-..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.model}</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                      {currentProviderModels.map((m) => {
                          const isCustom = customModels[aiConfig.provider]?.includes(m);
                          return (
                            <div 
                                key={m}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border cursor-pointer transition-all ${
                                    aiConfig.model === m 
                                    ? 'bg-violet-500/20 border-violet-500 text-violet-300' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                                onClick={() => handleConfigChange({ ...aiConfig, model: m })}
                            >
                                {m}
                                {isCustom && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeCustomModel(m); }}
                                        className="ml-1 text-slate-500 hover:text-rose-400"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                )}
                            </div>
                          );
                      })}
                  </div>
                  
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={newModelInput}
                        onChange={(e) => setNewModelInput(e.target.value)}
                        placeholder={t.addModel}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                        onKeyDown={(e) => { if(e.key === 'Enter') addCustomModel(); }}
                     />
                     <button 
                        onClick={addCustomModel}
                        disabled={!newModelInput.trim()}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded transition-colors disabled:opacity-50"
                     >
                        <Plus size={14} />
                     </button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">{t.dataMgmt}</label>
                  <button
                    onClick={exportData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
                  >
                    <Download size={16} />
                    {t.export}
                  </button>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div>
                  <label className="block text-xs font-mono text-slate-500 mb-2 uppercase">PROJECT</label>
                  <div className="space-y-2">
                    <a
                      href="https://github.com/xiao-qinfeng/Echo-Hunter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
                    >
                      <Github size={16} />
                      <span>GitHub Repository</span>
                    </a>
                    <a
                      href="https://github.com/xiao-qinfeng"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm text-slate-300 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span>Author Profile</span>
                    </a>
                  </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        
        {/* The Quantum Input - Center Stage */}
        <section className="mb-20">
            <QuantumInput 
              onCapture={handleCapture} 
              lang={lang} 
              aiConfig={aiConfig} 
              submitOnEnter={submitOnEnter}
            />
        </section>

        {/* The Feedback Loop (Only for Topography mode) */}
        {viewMode === 'topography' && lastThought && (
            <section className="mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
                <div className="relative p-6 border-l-2 border-violet-500/50 bg-gradient-to-r from-violet-500/5 to-transparent rounded-r-xl">
                    <button 
                        onClick={() => setShareNode(lastThought)}
                        className="absolute top-4 right-4 p-2 text-slate-600 hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <Share2 size={16} />
                    </button>

                    <p className="text-xs font-mono text-violet-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} /> {t.neuralEcho}
                    </p>
                    <p className="text-lg italic text-slate-300 font-serif leading-relaxed pr-8">
                        "{lastThought.analysis.feedback}"
                    </p>
                    <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
                        <span className="flex items-center gap-1">
                            {t.depth}: <span className="text-slate-300">{lastThought.analysis.depthScore}%</span>
                        </span>
                        <span className="flex items-center gap-1">
                            {t.mutation}: <span className="text-slate-300">{lastThought.analysis.styleUniqueness}%</span>
                        </span>
                    </div>
                </div>
            </section>
        )}

        {/* View Switcher */}
        <section className="flex justify-center mb-8">
            <div className="flex bg-slate-900/80 rounded-full border border-slate-700 p-1">
                <button
                    onClick={() => setViewMode('topography')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest transition-all ${
                        viewMode === 'topography' 
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <LayoutGrid size={14} /> {t.viewTopo}
                </button>
                <button
                    onClick={() => setViewMode('archive')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest transition-all ${
                        viewMode === 'archive' 
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <List size={14} /> {t.viewLog}
                </button>
            </div>
        </section>

        {/* Dynamic Content Area */}
        <section className="min-h-[500px]">
            {viewMode === 'topography' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="lg:col-span-2">
                        <NeuroGarden nodes={thoughts} lang={lang} onShare={(node) => setShareNode(node)} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <SpectraMap nodes={thoughts} lang={lang} />
                        
                        {/* Error Aesthetics Module */}
                        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 min-h-[180px] relative overflow-hidden">
                            <div className="absolute top-4 left-6 z-10">
                                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Wind size={14} /> {t.deviationLog}
                                </h3>
                            </div>
                            <div className="mt-8 space-y-3">
                                {thoughts.filter(n => n.analysis.styleUniqueness > 70).slice(-3).map(thought => (
                                    <div key={thought.id} className="text-xs p-3 rounded-lg bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors cursor-help group">
                                        <div className="text-slate-300 mb-1 truncate">"{thought.content}"</div>
                                        <div className="text-violet-400 font-mono text-[10px] uppercase opacity-60 group-hover:opacity-100">
                                            {thought.analysis.distortionType} {t.detected}
                                        </div>
                                    </div>
                                ))}
                                {thoughts.filter(n => n.analysis.styleUniqueness > 70).length === 0 && (
                                    <div className="text-slate-600 text-xs text-center mt-10 italic whitespace-pre-wrap">
                                        {t.noDeviation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <CognitiveLog nodes={thoughts} lang={lang} onShare={(node) => setShareNode(node)} />
                </div>
            )}
        </section>

      </main>

      <footer className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.2em]">
            {t.footer}
        </p>
      </footer>

    </div>
  );
};

export default App;
