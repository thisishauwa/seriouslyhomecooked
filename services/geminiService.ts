
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendedMeal } from "../types";

// Fix: Strictly follow the guideline for initializing with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMealRecommendation = async (preferences: string): Promise<RecommendedMeal[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest three sophisticated homecooked meal kit ideas based on these preferences: "${preferences}". 
      Each suggestion should sound premium and appetizing.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'The name of the gourmet meal.',
              },
              reason: {
                type: Type.STRING,
                description: 'Why this matches the user preferences.',
              },
              pairing: {
                type: Type.STRING,
                description: 'A suggested wine or beverage pairing.',
              },
            },
            required: ["name", "reason", "pairing"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    throw error;
  }
};
