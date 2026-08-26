import { GoogleGenAI, Type } from "@google/genai";
import { llmQuizResponseSchema, LLMQuizResponse } from "@/lib/validations/quiz";

// ── In-memory caches (server process lifetime) ──────────────────────
/** A model name that has been verified to actually work for this API key. */
let verifiedGeminiModel: string | null = null;
/** Ordered list of candidate model names from dynamic discovery. */
let discoveredCandidates: string[] | null = null;

/** Helper to wrap any async operation with a strict timeout */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[AI Timeout] ${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/** Sanitize and parse JSON from any LLM response */
function parseAndValidateQuiz(rawText: string, expectedQuestionCount: number): LLMQuizResponse | null {
  if (!rawText) return null;
  let jsonParsed: unknown;

  try {
    jsonParsed = JSON.parse(rawText);
  } catch {
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    try {
      jsonParsed = JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  // Untrusted LLM verification using Zod
  const validation = llmQuizResponseSchema.safeParse(jsonParsed);
  if (validation.success && validation.data.questions.length === expectedQuestionCount) {
    return validation.data;
  }

  return null;
}

/**
 * Discovers all Flash-tier model candidates from the live Gemini API.
 */
async function discoverFlashCandidates(ai: GoogleGenAI): Promise<string[]> {
  if (discoveredCandidates) return discoveredCandidates;

  try {
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    const candidates: string[] = [];

    for await (const model of pager) {
      const rawName: string = model.name || "";
      const lower = rawName.toLowerCase();

      if (!lower.includes("flash")) continue;
      if (lower.includes("embedding") || lower.includes("aqa") || lower.includes("vision")) continue;
      if (lower.includes("-tts") || lower.includes("-image") || lower.includes("omni")) continue;

      const actions = model.supportedActions || [];
      if (actions.length > 0 && !actions.includes("generateContent")) continue;

      const cleanName = rawName.startsWith("models/") ? rawName.slice(7) : rawName;
      candidates.push(cleanName);
    }

    candidates.sort((a, b) => {
      const aPreview = a.includes("preview") ? 1 : 0;
      const bPreview = b.includes("preview") ? 1 : 0;
      if (aPreview !== bPreview) return aPreview - bPreview;

      const aLite = a.includes("lite") ? 1 : 0;
      const bLite = b.includes("lite") ? 1 : 0;
      if (aLite !== bLite) return aLite - bLite;

      return b.localeCompare(a, undefined, { numeric: true });
    });

    discoveredCandidates = candidates;
    return candidates;
  } catch {
    discoveredCandidates = [];
    return [];
  }
}

/**
 * Returns the ordered list of Gemini model names to try
 */
async function getGeminiModelsToTry(ai: GoogleGenAI): Promise<string[]> {
  const models: string[] = [];

  if (verifiedGeminiModel) {
    models.push(verifiedGeminiModel);
  }
  if (process.env.GEMINI_MODEL_PRIMARY) {
    models.push(process.env.GEMINI_MODEL_PRIMARY);
  }
  if (process.env.GEMINI_MODEL_FALLBACK) {
    models.push(process.env.GEMINI_MODEL_FALLBACK);
  }

  // Fast stable Gemini models discovered from live tests
  models.push(
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
  );

  const discovered = await discoverFlashCandidates(ai);
  models.push(...discovered);

  const seen = new Set<string>();
  return models.filter((m) => {
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
}

/**
 * Provider 1: Google Gemini Flash Generator
 */
async function generateWithGemini({
  prompt,
  questionCount,
  quizSchema,
}: {
  prompt: string;
  questionCount: number;
  quizSchema: any;
}): Promise<LLMQuizResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = await getGeminiModelsToTry(ai);

  // Try up to top 3 Gemini candidates with strict 6s timeouts each
  for (const modelName of modelsToTry.slice(0, 3)) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
          },
        }),
        6000,
        `Gemini (${modelName})`
      );

      const parsed = parseAndValidateQuiz(response.text || "", questionCount);
      if (parsed) {
        verifiedGeminiModel = modelName;
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[Gemini AI] Model "${modelName}" failed or timed out:`, e?.message || e);
      if (verifiedGeminiModel === modelName) verifiedGeminiModel = null;
      continue;
    }
  }

  return null;
}

/**
 * Provider 2: Groq Cloud (Free Tier - GPT-OSS 120B, 20B & Qwen 27B)
 * Ultra-fast free fallback provider (500-1100ms response time)
 */
async function generateWithGroq({
  prompt,
  questionCount,
}: {
  prompt: string;
  questionCount: number;
}): Promise<LLMQuizResponse | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;

  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert educational quiz creator. You MUST respond with ONLY valid raw JSON adhering strictly to the requested schema. No markdown formatting, no conversational text.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Groq AI] Model "${model}" returned status ${res.status}`);
        continue;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";
      const parsed = parseAndValidateQuiz(content, questionCount);
      if (parsed) {
        console.log(`[Groq AI] Successfully generated quiz using model: ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[Groq AI] Model "${model}" error:`, e?.message || e);
      continue;
    }
  }

  return null;
}

/**
 * Provider 3: OpenRouter Free Tier (Gemma 4 & Nemotron)
 */
async function generateWithOpenRouter({
  prompt,
  questionCount,
}: {
  prompt: string;
  questionCount: number;
}): Promise<LLMQuizResponse | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;

  const models = [
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3.5-lightning:free",
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://mentatry.vercel.app",
          "X-Title": "Mentatry AI Quizzes",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert quiz creator. You MUST respond with ONLY valid raw JSON adhering strictly to the requested schema. No markdown formatting, no commentary.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[OpenRouter AI] Model "${model}" returned status ${res.status}`);
        continue;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";
      const parsed = parseAndValidateQuiz(content, questionCount);
      if (parsed) {
        console.log(`[OpenRouter AI] Successfully generated quiz using model: ${model}`);
        return parsed;
      }
    } catch (e: any) {
      console.warn(`[OpenRouter AI] Model "${model}" error:`, e?.message || e);
      continue;
    }
  }

  return null;
}

/**
 * Universal Multi-Provider Quiz Generation
 * Cascade order:
 * 1. Google Gemini Flash (Primary)
 * 2. Groq Cloud (Free LLaMA 3.3 70B backup)
 * 3. OpenRouter Free Tier (Backup)
 */
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
  const prompt = `You are an expert educational quiz creator. Generate a high-quality, engaging multiple-choice quiz based on the following parameters:
- Source Type: ${sourceType}
- Source Content: "${sourceContent}"
- Question Count: EXACTLY ${questionCount}
- Difficulty Level: ${difficulty}

CRITICAL CONSTRAINTS:
1. Every question MUST contain EXACTLY 4 distinct option strings in the "options" array.
2. "correctIndex" MUST be an integer: 0, 1, 2, or 3 corresponding to the correct string in options.
3. Generate EXACTLY ${questionCount} questions.
4. Output MUST strictly conform to this JSON schema:
{
  "title": "Short engaging title",
  "questions": [
    {
      "text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation why this is correct."
    }
  ]
}`;

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

  // 1. Primary: Google Gemini Flash
  if (process.env.GEMINI_API_KEY) {
    const geminiResult = await generateWithGemini({ prompt, questionCount, quizSchema });
    if (geminiResult) {
      return { success: true, data: geminiResult };
    }
  }

  // 2. Secondary Fallback: Groq Cloud (Free LLaMA 3.3 70B)
  if (process.env.GROQ_API_KEY) {
    console.log("[AI Engine] Gemini busy or unavailable. Falling back to Groq Cloud...");
    const groqResult = await generateWithGroq({ prompt, questionCount });
    if (groqResult) {
      return { success: true, data: groqResult };
    }
  }

  // 3. Tertiary Fallback: OpenRouter (Free tier models)
  if (process.env.OPENROUTER_API_KEY) {
    console.log("[AI Engine] Falling back to OpenRouter free models...");
    const openRouterResult = await generateWithOpenRouter({ prompt, questionCount });
    if (openRouterResult) {
      return { success: true, data: openRouterResult };
    }
  }

  return {
    success: false,
    error: "AI quiz generation was temporarily unavailable. You can retry in a moment or add a free GROQ_API_KEY to your environment as a backup.",
  };
}
