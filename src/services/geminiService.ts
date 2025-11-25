
import { GoogleGenAI, Type } from "@google/genai";
import { CognitiveMode } from '../types';
import type { CognitiveAnalysis, AIConfig, Language } from '../types';

export const analyzeThought = async (
  text: string,
  config: AIConfig,
  lang: Language
): Promise<CognitiveAnalysis> => {

  const isChinese = lang === 'zh';

  // Debug: Log the config being used
  console.log("[AI Analysis] Provider:", config.provider, "Model:", config.model);
  console.log("[AI Analysis] Has API Key:", !!config.apiKey);
  console.log("[AI Analysis] Base URL:", config.baseUrl);

  // System Prompt Construction: CLASSIFIER + ANALYZER
  const systemPrompt = isChinese ? `
    你是一个思维分析引擎。用户正在输入思维碎片。
    请分析文本，并执行以下两项任务：
    
    任务 1：分类 (Classification)
    判断这段文本最符合哪种认知模式：
    - OBSERVATION (锚点/白描): 客观的、物理的细节描述。关注“是什么”。
    - PARADOX (折叠/思辨): 寻找事物内部的对立、矛盾、反直觉或逻辑反差。
    - SENSORY (解码/通感): 纯粹的感官数据（颜色、气味、触感），绕过逻辑层。
    
    任务 2：量化与回声 (Quantification & Echo)
    以JSON格式返回分析结果：
    1. 'cognitiveType': "OBSERVATION" | "PARADOX" | "SENSORY" (根据你的分类)
    2. 'depthScore': 0-100. 评分意义的密度。
    3. 'styleUniqueness': 0-100. 偏离陈词滥调的程度。高偏差在这里是好的。
    4. 'distortionType': 识别认知滤镜（如“诗意放大”、“过度概括”）。
    5. 'metaphorDetected': boolean.
    6. 'feedback': 一个神秘的、一句话的“回声”，不要评价好坏，而是像镜子一样反射思维的盲区或独特之处。不超过30个字。
  ` : `
    You are a cognitive analysis engine. The user is inputting thought fragments.
    Analyze the text and perform two tasks:

    Task 1: Classification
    Determine which Cognitive Mode best fits the text:
    - OBSERVATION: Objective reality, physical details. Focus on "what is".
    - PARADOX: Contradictions, irony, counter-intuitive logic, or internal conflict.
    - SENSORY: Raw sensory data (colors, smells, textures), bypassing logic.

    Task 2: Quantification & Echo
    Return JSON:
    1. 'cognitiveType': "OBSERVATION" | "PARADOX" | "SENSORY"
    2. 'depthScore': 0-100. Density of meaning.
    3. 'styleUniqueness': 0-100. Deviation from cliché. High deviation is GOOD.
    4. 'distortionType': Name the cognitive filter (e.g., "Poetic Amplification").
    5. 'metaphorDetected': boolean.
    6. 'feedback': A cryptic, one-sentence "echo". Do not judge. Reflect the blind spot or the uniqueness of the thought. Max 20 words.
  `;

  // Fallback / Demo Simulation
  if (!config.apiKey && !import.meta.env.VITE_API_KEY) {
    // Randomly assign a mode for demo purposes if no key
    const modes = [CognitiveMode.OBSERVATION, CognitiveMode.PARADOX, CognitiveMode.SENSORY];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];

    return {
      depthScore: Math.floor(Math.random() * 40) + 60,
      styleUniqueness: Math.floor(Math.random() * 50) + 50,
      cognitiveType: randomMode,
      distortionType: isChinese ? "模拟共鸣" : "Simulated Resonance",
      metaphorDetected: Math.random() > 0.5,
      feedback: isChinese ? "缺少密钥。正在模拟神经回声..." : "API Key missing. Simulating neural echo...",
    };
  }

  const activeKey = config.apiKey || import.meta.env.VITE_API_KEY || '';

  try {
    // Branch 1: Google Gemini Official SDK
    if (config.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const response = await ai.models.generateContent({
        model: config.model,
        contents: `${systemPrompt}\n\nUser Input: "${text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cognitiveType: { type: Type.STRING, enum: ["OBSERVATION", "PARADOX", "SENSORY"] },
              depthScore: { type: Type.INTEGER },
              styleUniqueness: { type: Type.INTEGER },
              distortionType: { type: Type.STRING },
              metaphorDetected: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING }
            },
            required: ["cognitiveType", "depthScore", "styleUniqueness", "distortionType", "metaphorDetected", "feedback"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return normalizeResult(result);
    } 
    
    // Branch 2: OpenAI Compatible (DeepSeek, Kimi, etc.)
    else {
      // Use baseUrl exactly as configured - no automatic modifications
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: systemPrompt + "\nRespond strictly in valid JSON." },
            { role: "user", content: text }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" } // Many providers support this now
        })
      });

      if (!response.ok) throw new Error(`Provider Error: ${response.statusText}`);

      const data = await response.json();
      console.log("[AI Analysis] Raw API Response:", data);

      const content = data.choices[0]?.message?.content || '{}';
      console.log("[AI Analysis] Parsed Content:", content);

      const result = JSON.parse(content);
      console.log("[AI Analysis] Normalized Result:", result);

      return normalizeResult(result);
    }

  } catch (error) {
    console.error("[AI Analysis] Error:", error);
    return {
      depthScore: 50,
      styleUniqueness: 50,
      cognitiveType: CognitiveMode.OBSERVATION, // Default fallback
      distortionType: isChinese ? "连接干扰" : "Connection Interference",
      metaphorDetected: false,
      feedback: isChinese ? "信号丢失。思维保持原始状态。" : "Signal lost. The thought remains raw."
    };
  }
};

function normalizeResult(json: any): CognitiveAnalysis {
  // Map string to Enum just in case
  let mode = CognitiveMode.OBSERVATION;
  if (json.cognitiveType === 'PARADOX') mode = CognitiveMode.PARADOX;
  if (json.cognitiveType === 'SENSORY') mode = CognitiveMode.SENSORY;

  return {
    depthScore: typeof json.depthScore === 'number' ? json.depthScore : 50,
    styleUniqueness: typeof json.styleUniqueness === 'number' ? json.styleUniqueness : 50,
    cognitiveType: mode,
    distortionType: json.distortionType || 'Unknown',
    metaphorDetected: !!json.metaphorDetected,
    feedback: json.feedback || '...'
  };
}
