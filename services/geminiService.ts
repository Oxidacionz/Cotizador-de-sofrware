import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProjectInput, QuoteResponse, UploadedFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: { type: Type.STRING },
    executiveSummary: { type: Type.STRING, description: "Un resumen profesional para el cliente explicando el alcance." },
    totalEstimatedCost: { type: Type.NUMBER, description: "Costo total calculado del proyecto completo." },
    mvpCost: { type: Type.NUMBER, description: "Costo reducido para un Producto Mínimo Viable." },
    infrastructureCriticalCost: { type: Type.NUMBER, description: "Costos de servidores, licencias y servicios cloud necesarios para arrancar." },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Desarrollo Backend, Frontend, UX/UI, DevOps, Gestión" },
          cost: { type: Type.NUMBER },
          description: { type: Type.STRING }
        },
        required: ["category", "cost", "description"]
      }
    },
    marketComparison: {
      type: Type.OBJECT,
      properties: {
        lowEstimate: { type: Type.NUMBER, description: "Precio de mercado bajo para algo similar." },
        highEstimate: { type: Type.NUMBER, description: "Precio de mercado alto (agencias top)." },
        averageDays: { type: Type.NUMBER, description: "Días promedio de desarrollo en el mercado." },
        marketTrend: { type: Type.STRING, description: "Breve texto sobre cómo se cotiza este tipo de software actualmente." }
      },
      required: ["lowEstimate", "highEstimate", "averageDays", "marketTrend"]
    },
    technicalRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    clientEmailDraft: { type: Type.STRING, description: "Un borrador de correo formal para enviar la cotización al cliente." }
  },
  required: [
    "projectTitle", 
    "executiveSummary", 
    "totalEstimatedCost", 
    "mvpCost", 
    "infrastructureCriticalCost", 
    "breakdown", 
    "marketComparison", 
    "technicalRecommendations", 
    "clientEmailDraft"
  ]
};

export const generateQuote = async (input: ProjectInput, files: UploadedFile[]): Promise<QuoteResponse> => {
  const model = "gemini-2.5-flash"; 

  // Prepare input text
  let promptText = `
    Actúa como un Arquitecto de Soluciones Senior y Experto en Estimación de Software de Smart Bytes.
    Genera una cotización detallada para el siguiente proyecto:
    
    Nombre: ${input.projectName}
    Tipo: ${input.projectType}
    Descripción: ${input.description}
    
    Recursos y Tiempos:
    - Tamaño del equipo: ${input.teamSize} personas
    - Costo por hora promedio (Blended rate): $${input.hourlyRate} USD
    - Horas laborales por día: ${input.hoursPerDay}
    - Semanas Estimadas: ${input.estimatedWeeks}
    
    Costos Fijos / Infraestructura:
    - Presupuesto servidor/cloud estimado: $${input.serverCost} USD / mes
    
    Instrucciones Especiales:
    1. Analiza las imágenes proporcionadas (diagramas, capturas) y el contenido de los archivos JSON de flujo.
  `;

  if (input.targetCost && Number(input.targetCost) > 0) {
    promptText += `
    ATENCIÓN - PRECIO FIJO DEFINIDO: 
    El usuario ha establecido un COSTO MANUAL / OBJETIVO de: $${input.targetCost}.
    Usa este valor EXACTO como el 'totalEstimatedCost'. 
    Ajusta el desglose de categorías (backend, frontend, etc.) para que la suma coincida con este total de $${input.targetCost}, 
    respetando la proporción de esfuerzo técnico inferido pero forzando la matemática para llegar a este número.
    `;
  } else {
    promptText += `
    Cálculo de Costo:
    Calcula el costo total basado puramente en (Personas * Horas * Días * Semanas * Rate).
    Añade un margen de seguridad (10-20%) si detectas alta complejidad en los diagramas.
    `;
  }

  promptText += `
    
    Requerimientos adicionales de salida:
    - Calcula el MVP (Producto Mínimo Viable) reduciendo características no esenciales.
    - Proporciona una comparativa de mercado (Benchmarking).
    - Desglosa los costos en categorías claras.
    
    Responde estrictamente en formato JSON según el esquema.
  `;

  // Prepare parts
  const parts: any[] = [{ text: promptText }];
  
  // Add files
  files.forEach(file => {
    // Remove data URL prefix
    const base64Data = file.data.split(',')[1];
    
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      // Image Handling
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: file.type || 'image/png',
            data: base64Data
          }
        });
      }
    } else if (file.type.includes('json') || file.name.endsWith('.json')) {
      // JSON / Text Handling for Flow diagrams
      try {
        // Decode base64 to string
        const jsonContent = atob(base64Data);
        parts.push({
          text: `\n--- CONTENIDO DEL ARCHIVO DE FLUJO (${file.name}) ---\n${jsonContent}\n--- FIN DEL ARCHIVO ---\n`
        });
      } catch (e) {
        console.warn("Failed to decode JSON file", file.name);
      }
    }
  });

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No response generated");
    
    return JSON.parse(text) as QuoteResponse;

  } catch (error) {
    console.error("Error generating quote:", error);
    throw error;
  }
};