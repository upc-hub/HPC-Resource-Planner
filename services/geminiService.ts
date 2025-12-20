
import { GoogleGenAI, Type } from "@google/genai";
import { AiEstimateResponse, CenterSpec } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const estimateResources = async (
  projectDescription: string,
  center: CenterSpec
): Promise<AiEstimateResponse | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Aggregate limits for prompt context
  const cpuInfo = center.cpuOptions.map(o => `${o.name}: Max ${o.limit}`).join(', ');
  const gpuInfo = center.gpuOptions.length > 0 ? center.gpuOptions.map(o => `${o.name}: Max ${o.limit}`).join(', ') : 'None';

  const prompt = `
    You are a High Performance Computing (HPC) expert consultant.
    A researcher needs to estimate the required computing resources for their project at ${center.name}.

    Target Center: ${center.name}
    Description: ${center.description}
    
    AVAILABLE RESOURCE QUEUES & LIMITS:
    - CPU Queues: ${cpuInfo || 'None'}
    - GPU Queues: ${gpuInfo}

    Researcher's Project Description:
    "${projectDescription}"

    Based on the project needs:
    1. Estimate the Total Node-hours needed (Sum across queues if necessary, but stay within limits).
    2. Estimate the Total GPU-hours needed.
    3. Provide reasoning.
    
    Output JSON.
  `;

  try {
    // Using gemini-3-flash-preview for basic text estimation task
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodeHours: { type: Type.NUMBER, description: "Estimated Total CPU node hours" },
            gpuHours: { type: Type.NUMBER, description: "Estimated Total GPU hours" },
            reasoning: { type: Type.STRING, description: "Explanation of the estimate" },
            confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "Confidence level of estimate" }
          },
          required: ['nodeHours', 'gpuHours', 'reasoning', 'confidence']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    
    return JSON.parse(resultText) as AiEstimateResponse;

  } catch (error) {
    console.error("Gemini estimation failed:", error);
    return null;
  }
};
