import { GoogleGenAI } from "@google/genai";
import { Mission } from "../types";

// In a real MERN stack, this key would be on the server.
// Here we assume it's available via process.env or the user input for the demo.
// Ideally, we would proxy this call through our own Express backend.

export const analyzeMission = async (mission: Mission, apiKey: string): Promise<string> => {
  if (!apiKey) return "TACTICAL COMPUTER OFFLINE: MISSING API KEY";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      ACT AS: Santa's Chief Tactical AI (Code Name: KRAMPUS-01).
      MISSION CONTEXT: Operation Green Sleigh.
      TARGET: ${mission.sector}
      THREAT LEVEL: ${mission.pollutionLevel}
      HAZARD: ${mission.wasteType}
      
      TASK: Provide a concise, 3-sentence tactical cleaning directive for the Eco-Elves.
      TONE: High-tech, military-grade efficiency, but festive. Use terms like "Deploy", "Neutralize", "Holiday Spirit", "Bio-degradable Protocol".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis complete. Proceed with caution.";
  } catch (error) {
    console.error("AI Error:", error);
    return "ERROR: UNABLE TO ESTABLISH UPLINK WITH TACTICAL MAINFRAME.";
  }
};