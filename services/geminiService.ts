import { Type } from "@google/genai";
import { Level, GeneratedAssessment, Methodology, GroundingSource, Planning } from "../types";
import { supabase } from "../supabaseClient";

/**
 * Utility to clean and parse JSON from AI response.
 */
function parseJSONResponse(text: string) {
  try {
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("Nested parsing failed:", innerError);
      }
    }
    throw new Error("La respuesta del modelo no tiene un formato JSON válido.");
  }
}

/**
 * Helper para manejar errores de Supabase Functions uniformemente.
 */
async function handleAIError(error: any) {
  console.error("AI Service Error:", error);

  if (error.context && typeof error.context.json === 'function') {
    try {
      const body = await error.context.json();
      if (body.error) return new Error(body.error);
    } catch (e) {
      // Ignore parsing error
    }
  }

  return new Error(error.message || "Error al conectar con el servicio de IA.");
}

/**
 * Genera detalles de la evaluación basándose en las BCEP y metodologías seleccionadas.
 */
export async function generateAssessmentDetails(
  level: Level,
  nucleo: string,
  objective: string,
  methodology: Methodology
): Promise<Omit<GeneratedAssessment, 'level' | 'nucleo' | 'objective' | 'methodology' | 'createdAt'>> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY }); // REMOVED: Secure call via Edge Function

  let methodologyPrompt = "";
  if (methodology === Methodology.WALDORF) {
    methodologyPrompt = `
      INSPIRACIÓN WALDORF:
      - Enfócate en la rítmica, materiales naturales y el desarrollo de la voluntad.
    `;
  } else if (methodology === Methodology.MONTESSORI) {
    methodologyPrompt = `
      INSPIRACIÓN MONTESSORI:
      - Enfócate en la autonomía, el ambiente preparado y el material concreto.
    `;
  }

  const prompt = `
    Actúa como un experto en Educación Parvularia en Chile.
    Genera una propuesta de evaluación técnica para:
    Nivel: ${level}
    Núcleo: ${nucleo}
    Objetivo de Aprendizaje (OA): ${objective}
    Enfoque: ${methodology}
    
    ${methodologyPrompt}

    La respuesta DEBE ser un JSON con esta estructura exacta:
    {
      "activityName": "Nombre de la experiencia",
      "description": "Descripción lúdica y técnica",
      "indicators": ["indicador 1", "indicador 2", "indicador 3"],
      "materials": ["material 1", "material 2"]
    }
  `;

  try {
    const { data: responseData, error } = await supabase.functions.invoke('generate-content', {
      body: {
        model: "gemini-1.5-flash", // Modelo estable y compatible
        prompt: prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activityName: { type: Type.STRING },
            description: { type: Type.STRING },
            indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["activityName", "description", "indicators", "materials"]
        }
      }
    });

    if (error) throw await handleAIError(error);
    if (!responseData) throw new Error("No se recibio respuesta de la funcion de IA.");
    const responseText = responseData.text;
    if (!responseText) throw new Error("La IA devolvio una respuesta vacia.");

    const data = parseJSONResponse(responseText);

    return {
      activityName: data.activityName || "Nueva Experiencia",
      description: data.description || "Sin descripción disponible.",
      indicators: data.indicators || [],
      materials: data.materials || [],
      groundingSources: []
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('fetch') || error.message?.includes('Network')) {
      throw new Error("Error de red al conectar con Gemini. Revisa tu conexión a internet.");
    }
    throw error;
  }
}

/**
 * Genera la planificación técnica detallada.
 */
export async function generateVariablePlanning(assessment: GeneratedAssessment): Promise<Planning> {
  // const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const prompt = `
    Como experto en Educación Parvularia, crea una PLANIFICACIÓN VARIABLE detallada para Chile siguiendo las BCEP.
    
    Datos Base:
    - Nivel: ${assessment.level}
    - Núcleo: ${assessment.nucleo}
    - Objetivo: ${assessment.objective}
    - Actividad: ${assessment.activityName}
    - Metodología: ${assessment.methodology}

    IMPORTANTE: Genera un bloque de planificación técnica profesional con Inicio, Desarrollo, Cierre y Foco de Observación.
  `;

  try {
    const { data: responseData, error } = await supabase.functions.invoke('generate-content', {
      body: {
        model: "gemini-1.5-flash",
        prompt: prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nivel: { type: Type.STRING },
            equipo: { type: Type.STRING },
            mes: { type: Type.STRING },
            ambitoNucleo: { type: Type.STRING },
            planes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING },
                  focoObservacion: { type: Type.ARRAY, items: { type: Type.STRING } },
                  inicio: { type: Type.STRING },
                  desarrollo: { type: Type.STRING },
                  cierre: { type: Type.STRING }
                },
                required: ["objective", "focoObservacion", "inicio", "desarrollo", "cierre"]
              }
            },
            mediacion: { type: Type.STRING }
          },
          required: ["nivel", "ambitoNucleo", "planes", "mediacion"]
        }
      }
    });

    if (error) throw await handleAIError(error);
    if (!responseData?.text) throw new Error("No se recibio contenido para la planificacion.");
    return parseJSONResponse(responseData.text);
  } catch (error: any) {
    console.error("Gemini API Error (Variable Planning):", error);
    if (error.message?.includes('fetch')) throw new Error("Error de red en planificación.");
    throw error;
  }
}

/**
 * Genera una planificación integrada global a partir de múltiples documentos técnicos.
 */
export async function generateGlobalPlanning(sourceItems: any[]): Promise<Planning> {
  // const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  // Extraemos la información completa de cada ítem fuente
  const details = sourceItems.map((item, index) => {
    const content = item.content || item;
    const title = item.title || content.ambitoNucleo || "Actividad " + (index + 1);
    const nivel = content.nivel || "No especificado";

    // Si es una planificación, extraemos los bloques de planes
    let plansText = "";
    if (content.planes && Array.isArray(content.planes)) {
      plansText = content.planes.map((p: any) =>
        `OA: ${p.objective}\nInicio: ${p.inicio}\nDesarrollo: ${p.desarrollo}\nCierre: ${p.cierre}`
      ).join('\n---\n');
    } else {
      plansText = `Objetivo: ${content.objective || "No especificado"}\nDescripción: ${content.description || "No especificada"}`;
    }

    return `### DOCUMENTO ${index + 1}: ${title}\nNIVEL: ${nivel}\nCONTENIDO DE PLANIFICACIÓN:\n${plansText}`;
  }).join('\n\n====================\n\n');

  const prompt = `
    Actúa como un Coordinador Pedagógico experto en Educación Parvularia en Chile.
    Tu tarea es generar una PLANIFICACIÓN INTEGRADA que consolide los siguientes documentos técnicos sin perder detalle.

    DOCUMENTOS A INTEGRAR:
    ${details}

    REGLAS CRÍTICAS:
    1. DEBES generar EXACTAMENTE un bloque de planificación (en el array "planes") por cada uno de los documentos proporcionados arriba (${sourceItems.length} documentos). No los resumas en uno solo.
    2. Mantén la esencia técnica de Inicio, Desarrollo y Cierre de cada documento original, pero dales una coherencia de secuencia pedagógica (como si fuera una unidad temática).
    3. El campo "ambitoNucleo" debe ser "Plan de Aprendizajes Integrados".
    4. El campo "nivel" debe ser el nivel predominante de los documentos.
    5. El campo "mediacion" debe ser una reflexión profunda sobre cómo se conectan estas experiencias para potenciar el aprendizaje integral.

    ESTRUCTURA DE SALIDA (JSON):
    {
      "nivel": "Nivel correspondiente",
      "ambitoNucleo": "Plan de Aprendizajes Integrados",
      "planes": [
        {
          "objective": "OA Original",
          "focoObservacion": ["Indicador 1", "Indicador 2"],
          "inicio": "Descripción detallada del inicio",
          "desarrollo": "Descripción detallada del desarrollo",
          "cierre": "Descripción detallada del cierre"
        }
      ],
      "mediacion": "Texto de mediación pedagógica"
    }
  `;

  console.log("Generando Plan Integral para", sourceItems.length, "ítems...");

  try {
    const { data: responseData, error } = await supabase.functions.invoke('generate-content', {
      body: {
        model: "gemini-1.5-flash",
        prompt: prompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nivel: { type: Type.STRING },
            equipo: { type: Type.STRING },
            mes: { type: Type.STRING },
            ambitoNucleo: { type: Type.STRING },
            planes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objective: { type: Type.STRING },
                  focoObservacion: { type: Type.ARRAY, items: { type: Type.STRING } },
                  inicio: { type: Type.STRING },
                  desarrollo: { type: Type.STRING },
                  cierre: { type: Type.STRING }
                },
                required: ["objective", "focoObservacion", "inicio", "desarrollo", "cierre"]
              }
            },
            mediacion: { type: Type.STRING }
          },
          required: ["nivel", "ambitoNucleo", "planes", "mediacion"]
        }
      }
    });

    if (error) throw error;

    const result = parseJSONResponse(responseData.text);
    console.log("Plan Integral generado exitosamente.");
    return result;
  } catch (error: any) {
    console.error("Gemini API Error (Global Planning Detailed):", error);
    if (error.message?.includes('fetch')) throw new Error("Error de red: Gemini no responde para el plan integral.");
    if (error.message?.includes('JSON')) throw new Error("Error de formato: La respuesta de la IA no fue válida.");
    throw new Error(`Error en generación: ${error.message}`);
  }
}
