import { GoogleGenAI, Type } from "@google/genai";
import { llmQuizResponseSchema, LLMQuizResponse } from "@/lib/validations/quiz";

// ── In-memory caches (server process lifetime) ──────────────────────
/** A model name that has been verified to actually work for this API key. */
let verifiedModel: string | null = null;
/** Ordered list of candidate model names from dynamic discovery. */
let discoveredCandidates: string[] | null = null;

/**
 * Discovers all Flash-tier model candidates from the live Gemini API.
 * Uses the Pager<Model> returned by ai.models.list() (an AsyncIterable).
 * Results are cached for the lifetime of the server process.
 */
async function discoverFlashCandidates(ai: GoogleGenAI): Promise<string[]> {
  if (discoveredCandidates) return discoveredCandidates;

  try {
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    const candidates: string[] = [];

    // Pager<Model> implements AsyncIterable<Model> — use for-await to drain all pages
    for await (const model of pager) {
      const rawName: string = model.name || "";
      const lower = rawName.toLowerCase();

      // Only Flash variants (skip Pro, Ultra, Nano, embedding, Gemma, imagen, etc.)
      if (!lower.includes("flash")) continue;

      // Skip specialized models that can't do structured JSON text generation
      if (lower.includes("embedding") || lower.includes("aqa") || lower.includes("vision")) continue;
      if (lower.includes("-tts")) continue;   // Text-to-speech models
      if (lower.includes("-image")) continue;  // Image generation models
      if (lower.includes("omni")) continue;    // Multimodal omni models

      // Check supportedActions if present (the Model interface uses this field)
      const actions = model.supportedActions || [];
      if (actions.length > 0 && !actions.includes("generateContent")) continue;

      const cleanName = rawName.startsWith("models/") ? rawName.slice(7) : rawName;
      candidates.push(cleanName);
    }

    // Sort: stable production models first, then by version descending
    candidates.sort((a, b) => {
      const aPreview = a.includes("preview") ? 1 : 0;
      const bPreview = b.includes("preview") ? 1 : 0;
      if (aPreview !== bPreview) return aPreview - bPreview; // stable before preview

      const aLite = a.includes("lite") ? 1 : 0;
      const bLite = b.includes("lite") ? 1 : 0;
      if (aLite !== bLite) return aLite - bLite; // full before lite

      return b.localeCompare(a, undefined, { numeric: true }); // higher version first
    });

    discoveredCandidates = candidates;
    return candidates;
  } catch (err) {
    discoveredCandidates = [];
    return [];
  }
}

/**
 * Returns the ordered list of model names to try, combining:
 * 1. A previously verified model (instant, no API call)
 * 2. Env overrides (GEMINI_MODEL_PRIMARY / GEMINI_MODEL_FALLBACK)
 * 3. Dynamically discovered Flash candidates from the live API
 */
async function getModelsToTry(ai: GoogleGenAI): Promise<string[]> {
  const models: string[] = [];

  // 1. If we already verified a model works, try it first
  if (verifiedModel) {
    models.push(verifiedModel);
  }

  // 2. Env overrides come next
  if (process.env.GEMINI_MODEL_PRIMARY) {
    models.push(process.env.GEMINI_MODEL_PRIMARY);
  }
  if (process.env.GEMINI_MODEL_FALLBACK) {
    models.push(process.env.GEMINI_MODEL_FALLBACK);
  }

  // 3. Live discovery candidates
  const discovered = await discoverFlashCandidates(ai);
  models.push(...discovered);

  // Deduplicate while preserving priority order
  const seen = new Set<string>();
  return models.filter((m) => {
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
}

export async function generateQuizWithAI({
  sourceType,
  sourceContent,
  questionCount,
  difficulty,
}: {
  sourceType: "TOPIC" | "TEXT";
  sourceContent: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<{ success: boolean; data?: LLMQuizResponse; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY environment variable is missing on the server. Please add your key to .env file.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = await getModelsToTry(ai);

  if (modelsToTry.length === 0) {
    return {
      success: false,
      error: "No Gemini Flash models could be discovered. Check your API key or set GEMINI_MODEL_PRIMARY in .env.",
    };
  }

  const prompt = `You are an expert educational quiz creator. Generate a high-quality, engaging multiple-choice quiz based on the following parameters:
- Source Type: ${sourceType}
- Source Content: "${sourceContent}"
- Question Count: EXACTLY ${questionCount}
- Difficulty Level: ${difficulty}

CRITICAL CONSTRAINTS:
1. Every question MUST contain EXACTLY 4 distinct option strings in the "options" array.
2. "correctIndex" MUST be an integer: 0, 1, 2, or 3 corresponding to the correct string in options.
3. Generate EXACTLY ${questionCount} questions.`;

  // Schema-constrained output configuration for Gemini API
  const quizSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Engaging title for the quiz" },
      questions: {
        type: Type.ARRAY,
        description: `List of exactly ${questionCount} multiple choice questions`,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Clear question text" },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 4 choices",
            },
            correctIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct option" },
            explanation: { type: Type.STRING, description: "Brief explanation of the answer" },
          },
          required: ["text", "options", "correctIndex"],
        },
      },
    },
    required: ["title", "questions"],
  };

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: quizSchema,
        },
      });

      const rawText = response.text || "";
      let jsonParsed: unknown;

      try {
        jsonParsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        jsonParsed = JSON.parse(cleaned);
      }

      // Untrusted LLM verification using Zod
      const validation = llmQuizResponseSchema.safeParse(jsonParsed);
      if (validation.success && validation.data.questions.length === questionCount) {
        // This model works — cache it for all future calls this server process
        verifiedModel = modelName;
        return { success: true, data: validation.data };
      }

      // Validation failure doesn't mean the model is dead — still cache it
      verifiedModel = modelName;
    } catch (err: any) {
      const status = err?.status;

      if (status === 404) {
        // Model exists in catalog but is unavailable to this key — skip it
        console.warn(`[Gemini AI] ✗ Model "${modelName}" returned 404 (unavailable) — skipping.`);
        // If this was our cached verified model, invalidate it
        if (verifiedModel === modelName) verifiedModel = null;
        continue;
      }

      if (status === 429 || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("Quota exceeded")) {
        console.warn(`[Gemini API] Rate limit (429) for "${modelName}".`);
        // If we already verified this model works, return rate-limit message immediately
        if (verifiedModel === modelName) {
          return {
            success: false,
            error: "Gemini API free-tier rate limit reached. Please wait ~15-30 seconds before trying again.",
          };
        }
        // Otherwise, this model might work but is throttled — try next candidate
        continue;
      }

      console.error(`[Gemini API] Model "${modelName}" error (status ${status}):`, err?.message || err);
      // Unknown error — try next model
      continue;
    }
  }

  return {
    success: false,
    error: "All discovered Gemini models failed. Try again in a moment, or set GEMINI_MODEL_PRIMARY in .env to a specific model.",
  };
}
