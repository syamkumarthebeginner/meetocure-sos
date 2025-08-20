
import { GoogleGenAI, Type } from "@google/genai";
import { type Hospital } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function findNearbyHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
  const prompt = `Find the top 3 hospitals with their full address and a valid phone number near latitude ${latitude} and longitude ${longitude}, strictly within a 2km radius. Ensure the phone number is a direct line for emergencies if possible.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The official name of the hospital.",
              },
              address: {
                type: Type.STRING,
                description: "The complete street address of the hospital.",
              },
              phone: {
                type: Type.STRING,
                description: "The primary contact phone number for the hospital.",
              },
            },
            required: ["name", "address", "phone"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        console.error("Gemini API returned an empty string.");
        return [];
    }
    
    const hospitals: Hospital[] = JSON.parse(jsonString);
    return hospitals;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch hospital data from Gemini API.");
  }
}
