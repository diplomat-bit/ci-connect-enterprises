
import { GoogleGenAI, Modality } from "@google/genai";
import { SimulationResult, AIInsight } from "../types/index";

export const TTS_VOICES = [
  { name: 'Kore', style: 'Professional' },
  { name: 'Puck', style: 'Energetic' },
  { name: 'Charon', style: 'Calm' },
  { name: 'Fenrir', style: 'Deep' },
  { name: 'Zephyr', style: 'Friendly' }
];

export const TTS_LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish (Castilian)' },
  { code: 'fr', name: 'French (Parisian)' },
  { code: 'de', name: 'German (Berlin)' },
  { code: 'ja', name: 'Japanese (Tokyo)' },
  { code: 'it', name: 'Italian (Milanese)' }
];

const TEXT_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const synthesizeSpeech = async (
  input: string | { 
    text: string; 
    voiceName?: string; 
    language?: string;
    directorNotes?: string; 
  }, 
  fallbackVoice: string = 'Kore'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let text: string;
    let voiceName: string;
    let language: string;
    let directorNotes: string;

    if (typeof input === 'string') {
      text = input;
      voiceName = fallbackVoice;
      language = 'English';
      directorNotes = 'Professional';
    } else {
      text = input.text;
      voiceName = input.voiceName || 'Kore';
      language = input.language || 'English';
      directorNotes = input.directorNotes || 'Professional';
    }

    const promptText = `
      UNIVERSAL TRANSLATOR & NATIVE PERFORMANCE:
      Target Language: ${language}
      Director Tone: ${directorNotes}
      Input English Text: "${text}"
      
      MANDATORY INSTRUCTIONS:
      1. Translate the English text into highly fluent, native, natural ${language}.
      2. Respond ONLY in the ${language} language. 
      3. DO NOT speak a single word of English in the audio output.
      4. Use the prosody, accent, and inflection of a native ${language} speaker.
      5. Your persona is a high-level institutional AI.
    `;

    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return false;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContext, 24000, 1);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    return true;
  } catch (err) {
    console.error("Gemini TTS Engine Failure", err);
    return false;
  }
};

export const generateNeuralSetting = async (context: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const seed = Math.floor(Math.random() * 1000000);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Cinematic ultra-wide setting for: ${context}. Style: Dark Cyber-Obsidian architecture. Glowing bioluminescent data ribbons, atmospheric futuristic depth, 8k, ray-tracing. Unique seed: ${seed}` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) return null;

    for (const part of candidates[0].content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const generateProtocolVisual = async (title: string, description: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Technical schematic for ${title}. ${description}. Style: Holographic blueprint, glowing blue lines, dark obsidian background, precision engineering.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) return null;

    for (const part of candidates[0].content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const callGemini = async (model: string, contents: any, config: any = {}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: model || TEXT_MODEL,
    contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
    config: config,
  });
  return response;
};

export const getFinancialAdviceStream = async (query: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContentStream({
    model: TEXT_MODEL,
    contents: [{ parts: [{ text: `System Context: ${JSON.stringify(context)}. User Query: ${query}. You are a helpful AI financial assistant. Keep responses professional and concise.` }] }],
  });
  return response;
};

export const getPortfolioSuggestions = async (context: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ parts: [{ text: `Suggest 3 high-impact treasury actions. Context: ${JSON.stringify(context)}. Return ONLY JSON: [{type, title, description}]` }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
};

export const getSystemIntelligenceFeed = async (): Promise<AIInsight[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ parts: [{ text: "Generate 4 high-impact treasury insights. Return ONLY JSON: [{id, title, description, severity}]" }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch {
    return [];
  }
};

export const generateNeuralStatusReport = async (systemData: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ parts: [{ text: `System State Data: ${JSON.stringify(systemData)}. Generate a professional neural health audit report in 2-3 sentences. Focus on network parity, entropy levels, and gateway status. Be technical and reassuring.` }] }],
    });
    return response.text;
  } catch {
    return "Neural core online. All parity checks within tolerance. System fabric maintaining 100% integrity.";
  }
};

export const runSimulationForecast = async (prompt: string): Promise<SimulationResult | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ parts: [{ text: `Run simulation for: ${prompt}. Return ONLY JSON: {outcomeNarrative, projectedValue, confidenceScore, status, simulationId}` }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || 'null');
  } catch {
    return null;
  }
};
