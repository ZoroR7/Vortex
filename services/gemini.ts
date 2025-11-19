import { GoogleGenAI, Modality } from "@google/genai";

// Singleton instance for API key management
class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined = process.env.API_KEY;

  constructor() {
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  public isAvailable(): boolean {
    return !!this.ai;
  }

  /**
   * Generates audio for a specific text chunk using Gemini TTS.
   */
  public async generateSpeech(text: string, voiceName: string): Promise<ArrayBuffer | null> {
    if (!this.ai) return null;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      return this.decodeBase64ToArrayBuffer(base64Audio);
    } catch (error) {
      console.error("Gemini TTS Error:", error);
      throw error;
    }
  }

  /**
   * Uses Gemini to extract clean text from a URL or raw content.
   */
  public async extractTextFromUrl(url: string): Promise<string> {
    if (!this.ai) throw new Error("API Key missing");

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please extract the main readable article or content text from this URL: ${url}. 
                   Ignore navigation, footers, and ads. 
                   Return ONLY the raw text content, no markdown formatting wrapping (like \`\`\`).`,
        config: {
          tools: [{ googleSearch: {} }], // Use search/grounding to access the web
        }
      });

      // Handle grounding chunks if they exist, but mainly we want the text model builds
      const text = response.text;
      return text || "Could not extract text. The URL might be blocked or inaccessible.";
    } catch (error) {
      console.error("Text Extraction Error:", error);
      throw error;
    }
  }

  private decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const geminiService = new GeminiService();
