import { z } from "zod";
import { TIME_LIMIT_OPTIONS } from "../constants";

// Shared optional time limit validator
const validTimeLimits = TIME_LIMIT_OPTIONS.map(opt => opt.value);
const timeLimitSchema = z.coerce
  .number()
  .refine((val) => validTimeLimits.includes(val), {
    message: `Time limit must be one of: ${validTimeLimits.join(", ")} minutes`,
  })
  .transform((val) => (val === 0 ? null : val))
  .optional()
  .nullable();

// --- Form Input Schemas ---

export const topicQuizInputSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters").max(200, "Topic too long"),
  questionCount: z.coerce.number().refine((val) => [5, 10, 15].includes(val), {
    message: "Question count must be 5, 10, or 15",
  }),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimitMinutes: timeLimitSchema,
});

export const textQuizInputSchema = z.object({
  text: z.string().min(20, "Text must be at least 20 characters").max(20000, "Text exceeds maximum limit"),
  questionCount: z.coerce.number().refine((val) => [5, 10, 15].includes(val), {
    message: "Question count must be 5, 10, or 15",
  }),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimitMinutes: timeLimitSchema,
});

export const manualQuestionSchema = z.object({
  text: z.string().min(3, "Question text must be at least 3 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Exactly 4 options required"),
  correctIndex: z.coerce.number().int().min(0).max(3),
  explanation: z.string().optional().nullable(),
});

export const manualQuizInputSchema = z.object({
  title: z.string().min(3, "Quiz title must be at least 3 characters"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimitMinutes: timeLimitSchema,
  questions: z.array(manualQuestionSchema).min(1, "At least 1 question is required"),
});

export const joinCodeSchema = z.object({
  joinCode: z
    .string()
    .min(4, "Join code must be at least 4 characters")
    .max(12, "Invalid join code length")
    .transform((val) => val.trim().toUpperCase()),
});

// --- Raw LLM Output Schemas (Untrusted Input Verification) ---

export const llmQuestionSchema = z.object({
  text: z.string().min(3, "Generated question text invalid"),
  options: z
    .array(z.string())
    .length(4, "LLM must generate exactly 4 options per question"),
  correctIndex: z
    .number()
    .int()
    .min(0)
    .max(3, "correctIndex must be between 0 and 3"),
  explanation: z.string().optional().nullable(),
});

export const llmQuizResponseSchema = z.object({
  title: z.string().min(2, "Generated title missing"),
  questions: z.array(llmQuestionSchema).min(1, "Generated questions list empty"),
});

export type TopicQuizInput = z.infer<typeof topicQuizInputSchema>;
export type TextQuizInput = z.infer<typeof textQuizInputSchema>;
export type ManualQuizInput = z.infer<typeof manualQuizInputSchema>;
export type LLMQuizResponse = z.infer<typeof llmQuizResponseSchema>;
