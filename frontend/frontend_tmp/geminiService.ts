
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// For general low-latency queries
export async function quickQuery(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for basic text tasks
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Lite Query Error:", error);
    return "Unable to get quick response.";
  }
}

// For education news with Search Grounding
export async function getEduNews(role: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest 3 educational technology trends or news relevant to a ${role} in 2024. Return a short list.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return null;
  }
}

// Added to fix the missing export error in DataAnalysis.tsx
// Complex analysis for the DataAnalysis page using gemini-3-pro-preview
export async function getAttendanceInsights(data: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze this institutional attendance and academic data to provide deep insights: ${JSON.stringify(data)}. Identify trends and recommend interventions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Executive summary of the attendance data." },
            observations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Detailed observations regarding student patterns."
            },
            prediction: { type: Type.STRING, description: "Data-driven prediction for future attendance levels." },
            interventions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable steps for faculty and admins."
            }
          },
          required: ["summary", "observations", "prediction", "interventions"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      summary: "Data analysis temporarily unavailable.",
      observations: ["Unable to process records at this time."],
      prediction: "No prediction possible.",
      interventions: ["Contact technical support if this persists."]
    };
  }
}

// Image Editing with Gemini 2.5 Flash Image
export async function editImage(imagePath: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imagePath.split(',')[1], mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
}

// Video Generation with Veo
export async function generateVeoVideo(imagePath: string, prompt: string, ratio: '16:9' | '9:16' = '16:9') {
  try {
    // Check for API key in window if required by specific environment rules
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    // Creating a new instance right before the call to ensure up-to-date API key usage
    const aiVeo = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await aiVeo.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: imagePath.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: ratio
      }
    });

    while (!operation.done) {
      // Polling every 10 seconds as per guidelines to check operation status
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiVeo.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    // Return the download link with the API key appended for authentication
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Veo Generation Error:", error);
    return null;
  }
}
