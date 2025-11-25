import { GoogleGenAI, Type } from "@google/genai";
import { PromptItem, TaskConfig } from "../types";

// Ensure API Key exists
const API_KEY = process.env.API_KEY || '';

// Singleton instance management
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!API_KEY) {
    console.error("API Key is missing");
  }
  // Always create new instance to pick up key changes if necessary, 
  // though for this app structure single instance is usually fine.
  // We strictly follow the rule to check for key selection for Veo.
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Prompt Engineering Agent (PEA)
 * Generates variations of prompts based on user input.
 */
export const generatePromptVariations = async (
  userRequest: string,
  count: number = 5
): Promise<string[]> => {
  const ai = getAI();
  
  const systemInstruction = `You are an expert Video Prompt Engineer. 
  Your goal is to take a raw user idea and convert it into ${count} distinct, high-quality, descriptive prompts suitable for a video generation model like Veo.
  Ensure variety in camera angles, lighting, and mood while adhering to the core concept.
  Return ONLY a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userRequest,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};

/**
 * Check if user has selected a key for Veo (Paid feature)
 */
export const checkAndRequestApiKey = async (): Promise<boolean> => {
    // @ts-ignore - aistudio is injected by the environment
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            return true; // Assume success after modal
        }
        return true;
    }
    return !!API_KEY; // Fallback for local dev if env var is set
};

/**
 * Generate a single video using Veo
 */
export const generatePilotVideo = async (
  prompt: string,
  config: TaskConfig
): Promise<string | null> => {
  const ai = getAI();

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', // Defaulting to fast for pilot
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Polling Veo operation...", operation.metadata);
    }

    // Extract URI
    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    // In production, we need to proxy this or fetch with key. 
    // The prompt guidance says: response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    // However, we can't easily fetch blob in browser due to CORS usually on these raw links unless proxied.
    // For this demo, we return the URI with the key appended for the <video src="...">
    
    if (uri) {
      return `${uri}&key=${API_KEY}`;
    }
    
    return null;

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};
