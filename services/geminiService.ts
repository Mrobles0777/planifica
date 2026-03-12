import { Level, GeneratedAssessment, Methodology, Planning, PlanningSpan } from "../types";
import { supabase } from "../supabaseClient";

// Modelo principal estable; gemini-2.0-flash tiene disponibilidad general y soporte full de responseSchema en v1beta.
// Cambia esta constante si el usuario tiene acceso a un modelo más reciente.
const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";

// Timeout en el cliente para que el botón nunca se quede bloqueado indefinidamente.
const CLIENT_TIMEOUT_MS = 95_000;

// Feriados Chile 2024-2025 (simplificado para prompt)
const CHILEAN_HOLIDAYS = [
  "2024-01-01", "2024-03-29", "2024-03-30", "2024-05-01", "2024-05-21", "2024-06-20", "2024-06-29", "2024-07-16", "2024-08-15", "2024-09-18", "2024-09-19", "2024-09-20", "2024-10-12", "2024-10-27", "2024-11-01", "2024-12-08", "2024-12-25",
  "2025-01-01", "2025-04-18", "2025-04-19", "2025-05-01", "2025-05-21", "2025-06-16", "2025-06-29", "2025-07-16", "2025-08-15", "2025-09-18", "2025-09-19", "2025-10-12", "2025-11-01", "2025-12-08", "2025-12-25"
];

/**
 * Envuelve una promesa con un timeout. Si el tiempo se agota, lanza un error descriptivo.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, operationName: string): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(
      `La operación "${operationName}" tardó demasiado (>${ms / 1000}s). Revisa tu conexión o intenta de nuevo.`
    )), ms)
  );
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Limpia y parsea la respuesta JSON del modelo de IA.
 */
function parseJSONResponse(text: string): unknown {
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("Nested JSON parsing failed:", innerError);
      }
    }
    throw new Error("La respuesta del modelo no tiene un formato JSON válido.");
  }
}

/**
 * Maneja errores de Supabase Edge Functions de manera uniforme.
 * Extrae el mensaje de error del body de la respuesta cuando está disponible.
 */
async function handleAIError(error: unknown): Promise<Error> {
  console.error("AI Service Error:", error);

  if (error && typeof error === 'object') {
    const supabaseError = error as { context?: { json?: () => Promise<{ error?: string }>, text?: () => Promise<string> }; message?: string; status?: number };

    // Intentamos extraer el mensaje del body de la respuesta de la Edge Function
    if (supabaseError.context) {
      try {
        if (typeof supabaseError.context.json === 'function') {
          const body = await supabaseError.context.json();
          if (body?.error) return new Error(body.error);
        } else if (typeof supabaseError.context.text === 'function') {
          const rawText = await supabaseError.context.text();
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              if (parsed?.error) return new Error(parsed.error);
            } catch {
              // El body no es JSON, usamos el texto directamente si es corto
              if (rawText.length < 200) return new Error(rawText);
            }
          }
        }
      } catch (extractionError) {
        console.warn("Could not extract error body from Supabase response:", extractionError);
      }
    }

    // Error genérico de Edge Function (non-2xx)
    if (supabaseError.message?.includes('Edge Function returned a non-2xx status code')) {
      return new Error("La función de IA falló. Revisa si la GEMINI_API_KEY está configurada en Supabase (Perfil → Diagnosticar Conexión).");
    }

    if (supabaseError.message) {
      return new Error(supabaseError.message);
    }
  }

  return new Error("Error al conectar con el servicio de IA.");
}

/**
 * Genera detalles de la evaluación basándose en las BCEP y metodologías seleccionadas.
 */
export async function generateAssessmentDetails(
  level: Level,
  nucleo: string,
  objective: string,
  methodology: Methodology,
  span: PlanningSpan = PlanningSpan.DAILY
): Promise<Omit<GeneratedAssessment, 'level' | 'nucleo' | 'objective' | 'methodology' | 'createdAt'>> {

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
    Nivel: ${level}
    Núcleo: ${nucleo}
    Objetivo de Aprendizaje (OA): ${objective}
    Enfoque: ${methodology}
    Alcance: ${span}
    
    IMPORTANTE PARA PLANES EXTENDIDOS (${span}):
    - Si el Núcleo u Objetivo es "Aleatorio", tú como experto DEBES seleccionar los Núcleos y OAs más pertinentes de las BCEP para el nivel ${level}.
    - Asegura una progresión pedagógica lógica para el período solicitado.
    - Puedes incluir uno o hasta DOS objetivos de aprendizaje por experiencia si la complejidad lo amerita.
    
    INSTRUCCIONES DE ALCANCE:
    - Si es ${PlanningSpan.DAILY}: Una experiencia única potente.
    - Si es ${PlanningSpan.WEEKLY}: Una secuencia de 5 experiencias relacionadas (Lunes a Viernes).
    - Si es ${PlanningSpan.MONTHLY}: Un plan de 4 semanas con experiencias clave para días hábiles.
    
    IMPORTANTE: Descarta sábados, domingos y feriados de Chile (Considera: ${CHILEAN_HOLIDAYS.join(", ")}).
    
    ${methodologyPrompt}

    La respuesta DEBE ser un JSON con esta estructura exacta:
    {
      "activityName": "Nombre de la experiencia",
      "description": "Descripción lúdica y técnica",
      "indicators": ["indicador 1", "indicador 2", "indicador 3"],
      "materials": ["material 1", "material 2"]
    }
  `;

  const invokePromise = supabase.functions.invoke('generate-content', {
    body: {
      model: DEFAULT_GEMINI_MODEL,
      prompt: prompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          activityName: { type: "STRING" },
          description: { type: "STRING" },
          indicators: { type: "ARRAY", items: { type: "STRING" } },
          materials: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["activityName", "description", "indicators", "materials"]
      }
    }
  });

  try {
    const invokeResult = await withTimeout(invokePromise, CLIENT_TIMEOUT_MS, "Crear Aventura");
    const { data: responseData, error } = invokeResult as { data: { text?: string } | null, error: unknown };

    if (error) throw await handleAIError(error);
    if (!responseData) throw new Error("No se recibió respuesta de la función de IA.");

    const responseText = responseData.text;
    if (!responseText) throw new Error("La IA devolvió una respuesta vacía. Verifica la GEMINI_API_KEY en Supabase.");

    const data = parseJSONResponse(responseText) as {
      activityName?: string;
      description?: string;
      indicators?: string[];
      materials?: string[];
      instructions?: string;
      evaluation?: string;
      experienceSummary?: string;
      experienceTable?: { day: string; activity: string; objectives: string[]; description: string; }[];
    };

    return {
      id: Math.random().toString(36).substr(2, 9),
      activityName: data.activityName || "Nueva Experiencia",
      description: data.description || "Sin descripción disponible.",
      indicators: data.indicators || [],
      materials: data.materials || [],
      instructions: data.instructions || "Sin instrucciones.",
      evaluation: data.evaluation || "Sin evaluación.",
      groundingSources: [],
      experienceSummary: data.experienceSummary,
      experienceTable: data.experienceTable
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("generateAssessmentDetails Error:", err.message);

    if (err.message.includes('fetch') || err.message.includes('Network') || err.message.includes('Failed to send')) {
      throw new Error("Error de red al conectar con la función de IA. Revisa tu conexión a internet.");
    }
    throw err;
  }
}

/**
 * Genera la planificación técnica detallada.
 */
export async function generateVariablePlanning(assessment: GeneratedAssessment): Promise<Planning> {
  const spanPadding = assessment.span === PlanningSpan.WEEKLY ? "Genera una secuencia para 5 DÍAS (Lunes a Viernes)." : 
                     assessment.span === PlanningSpan.MONTHLY ? "Genera una propuesta para un MES completo (días hábiles)." : 
                     "Genera para un DÍA único.";

  const prompt = `
    Como experto en Educación Parvularia, crea una PLANIFICACIÓN ${assessment.span || 'VARIABLE'} detallada para Chile siguiendo las BCEP.
    
    ${spanPadding}

    Datos Base:
    - Nivel: ${assessment.level}
    - Núcleo: ${assessment.nucleo}
    - Objetivo: ${assessment.objective}
    - Actividad/Tema Base: ${assessment.activityName}
    - Metodología: ${assessment.methodology}

    INSTRUCCIÓN DE AUTONOMÍA:
    - Si el Núcleo u Objetivo indica "Varios" o "Autónomo", DEBES proponer e integrar en la planificación los OAs específicos de las BCEP que mejor se adapten a la experiencia y al nivel ${assessment.level}.
    - Considera proponer hasta dos objetivos por jornada para una planificación más robusta.

    IMPORTANTE: 
    - Genera en el array "planes" una entrada por cada día o semana según corresponda.
    - Para SEMANAL o MENSUAL, cada objeto en "planes" debe representar un día o una semana de actividades.
    - Mantén el rigor técnico de Inicio, Desarrollo, Cierre y Foco de Observación.
  `;

  const invokePromise = supabase.functions.invoke('generate-content', {
    body: {
      model: DEFAULT_GEMINI_MODEL,
      prompt: prompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          titulo: { type: "STRING" },
          metodologia: { type: "STRING" },
          materiales: { type: "ARRAY", items: { type: "STRING" } },
          nivel: { type: "STRING" },
          equipo: { type: "STRING" },
          mes: { type: "STRING" },
          ambitoNucleo: { type: "STRING" },
          planes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                objective: { type: "STRING" },
                focoObservacion: { type: "ARRAY", items: { type: "STRING" } },
                inicio: { type: "STRING" },
                desarrollo: { type: "STRING" },
                cierre: { type: "STRING" }
              },
              required: ["objective", "focoObservacion", "inicio", "desarrollo", "cierre"]
            }
          },
          mediacion: { type: "STRING" },
          experienceSummary: { type: "STRING" },
          experienceTable: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                day: { type: "STRING" },
                activity: { type: "STRING" },
                objectives: { type: "ARRAY", items: { type: "STRING" } },
                description: { type: "STRING" }
              },
              required: ["day", "activity", "objectives", "description"]
            }
          }
        },
        required: ["nivel", "ambitoNucleo", "planes", "mediacion", "experienceSummary", "experienceTable"]
      }
    }
  });

  try {
    const invokeResult = await withTimeout(invokePromise, CLIENT_TIMEOUT_MS, "Generar Planificación");
    const { data: responseData, error } = invokeResult as { data: { text?: string } | null, error: unknown };

    if (error) throw await handleAIError(error);
    if (!responseData?.text) throw new Error("No se recibió contenido para la planificación.");

    return parseJSONResponse(responseData.text) as Planning;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("generateVariablePlanning Error:", err.message);

    if (err.message.includes('fetch')) throw new Error("Error de red en planificación variable.");
    throw err;
  }
}

/**
 * Genera una planificación integrada global a partir de múltiples documentos técnicos.
 */
export async function generateGlobalPlanning(sourceItems: unknown[]): Promise<Planning> {
  const details = (sourceItems as Array<{ content?: { ambitoNucleo?: string; nivel?: string; planes?: Array<{ objective?: string; inicio?: string; desarrollo?: string; cierre?: string }> }; title?: string; ambitoNucleo?: string; nivel?: string; planes?: unknown[]; objective?: string; description?: string }>).map((item, index) => {
    const content = (item.content || item) as { ambitoNucleo?: string; nivel?: string; planes?: Array<{ objective?: string; inicio?: string; desarrollo?: string; cierre?: string }>; objective?: string; description?: string };
    const title = (item as { title?: string }).title || content.ambitoNucleo || "Actividad " + (index + 1);
    const nivel = content.nivel || "No especificado";

    let plansText = "";
    if (content.planes && Array.isArray(content.planes)) {
      plansText = content.planes.map((p) =>
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
    6. Genera un "titulo" integrador para todo el plan.
    7. Genera un array consolidado de "materiales" (sin duplicados) necesarios para todas las actividades del plan.
    8. El campo "metodologia" debe ser "Planificación Integrada".

    ESTRUCTURA DE SALIDA (JSON):
    {
      "titulo": "Título Integrador",
      "metodologia": "Planificación Integrada",
      "materiales": ["material 1", "material 2"],
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

  const invokePromise = supabase.functions.invoke('generate-content', {
    body: {
      model: DEFAULT_GEMINI_MODEL,
      prompt: prompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          titulo: { type: "STRING" },
          metodologia: { type: "STRING" },
          materiales: { type: "ARRAY", items: { type: "STRING" } },
          nivel: { type: "STRING" },
          equipo: { type: "STRING" },
          mes: { type: "STRING" },
          ambitoNucleo: { type: "STRING" },
          planes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                objective: { type: "STRING" },
                focoObservacion: { type: "ARRAY", items: { type: "STRING" } },
                inicio: { type: "STRING" },
                desarrollo: { type: "STRING" },
                cierre: { type: "STRING" }
              },
              required: ["objective", "focoObservacion", "inicio", "desarrollo", "cierre"]
            }
          },
          mediacion: { type: "STRING" },
          experienceSummary: { type: "STRING" },
          experienceTable: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                day: { type: "STRING" },
                activity: { type: "STRING" },
                objectives: { type: "ARRAY", items: { type: "STRING" } },
                description: { type: "STRING" }
              },
              required: ["day", "activity", "objectives", "description"]
            }
          }
        },
        required: ["nivel", "ambitoNucleo", "planes", "mediacion", "experienceSummary", "experienceTable"]
      }
    }
  });

  try {
    const invokeResult = await withTimeout(invokePromise, CLIENT_TIMEOUT_MS, "Plan Integral");
    const { data: responseData, error } = invokeResult as { data: { text?: string } | null, error: unknown };

    if (error) throw await handleAIError(error);
    if (!responseData?.text) throw new Error("No se recibió contenido para el plan integral.");

    const result = parseJSONResponse(responseData.text) as Planning;
    console.log("Plan Integral generado exitosamente.");
    return result;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("generateGlobalPlanning Error:", err.message);

    if (err.message.includes('fetch')) throw new Error("Error de red: la IA no responde para el plan integral.");
    if (err.message.includes('JSON')) throw new Error("Error de formato: la respuesta de la IA no fue válida.");
    throw err;
  }
}
