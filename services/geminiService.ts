
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, Flashcard, StepByStepExercise, SampleQuestion } from "../types";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (subjectTitle: string) => `
You are a friendly and expert ${subjectTitle} teacher for Grade 10 students in Iran. 
Your tone is encouraging, clear, and educational.
You communicate in Persian (Farsi).
When solving problems, use the "Step-by-Step" (گام به گام) method:
1. Identify the given data (داده‌های مسئله).
2. Identify the unknown (مجهول).
3. Select the appropriate formula or theorem.
4. Perform the calculation or logical steps.
5. State the final answer with units if applicable.
Use LaTeX formatting for formulas if possible, or clear text representation.
`;

const getSolverInstruction = (subjectTitle: string) => `
You are a "Homework Helper" for ${subjectTitle} Grade 10. 
The user will provide a question. 
You must output a detailed, step-by-step solution in Persian.
Format clearly with bold headers for each step.
`;

export const createChatSession = (subjectTitle: string = 'فیزیک') => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(subjectTitle),
    },
  });
};

export const generateQuizQuestions = async (subjectTitle: string, chapter: string, count: number = 5): Promise<QuizQuestion[]> => {
  const prompt = `Generate ${count} multiple-choice ${subjectTitle} questions for Grade 10 students in Iran.
  Topic: ${chapter}.
  Language: Persian (Farsi).
  Style: Iranian Textbook (Grade 10).
  Structure:
  - Question text in Persian using Persian digits.
  - 4 Persian options.
  - Explanation using Iranian teaching terms.
  Difficulty: Medium.`;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "The conversational question text in Persian" },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Array of 4 options in Persian" 
        },
        correctIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
        explanation: { type: Type.STRING, description: "Short explanation of the solution in Persian" }
      },
      required: ["question", "options", "correctIndex", "explanation"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateFlashcards = async (subjectTitle: string, chapter: string, count: number = 10): Promise<Flashcard[]> => {
  const prompt = `Generate ${count} educational flashcards for ${subjectTitle} Grade 10, Topic: ${chapter}.
  Language: Persian (Farsi).
  Style: Iranian Curriculum (Ketab Darsi).
  
  CRITICAL INSTRUCTION:
  - The 'front' should be a core Concept, Question, or Definition Request.
  - The 'back' must be the precise definition, formula, or theorem used in Iranian schools.
  - Keep it concise.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING, description: "The concept or question" },
        back: { type: Type.STRING, description: "The answer or definition" },
      },
      required: ["front", "back"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as Flashcard[];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};

export const generateStepByStepExercises = async (subjectTitle: string, chapter: string): Promise<StepByStepExercise[]> => {
  const prompt = `Act as a strict Iranian ${subjectTitle} Teacher for Grade 10.
  Generate 3 standard textbook exercises for Chapter: "${chapter}".

  RULES FOR CONTENT:
  1.  **Context:** Use Iranian contexts.
  2.  **Digits:** Use Persian Digits (۰-۹) in text.
  3.  **Style:** Formal, educational, like a solution manual (Gam-be-Gam).

  OUTPUT FORMAT (JSON):
  Return an array of objects with 'question' and 'solution'.

  SOLUTION STRUCTURE (Markdown):
  The 'solution' string MUST follow this structure EXACTLY:
  
  (Optional brief text analysis in Persian)

  **فرمول / نکته:**
  $$ [Formula/Theorem in LaTeX] $$

  **جایگذاری و حل:**
  $$ [Calculations in LaTeX] $$

  **پاسخ نهایی:**
  $$ [Final Answer in LaTeX] $$
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "The problem text with Persian digits." },
        solution: { type: Type.STRING, description: "Structured solution with headers: فرمول, جایگذاری, پاسخ نهایی." },
      },
      required: ["question", "solution"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as StepByStepExercise[];
  } catch (error) {
    console.error("Error generating exercises:", error);
    return [];
  }
};

export const generateSampleQuestions = async (subjectTitle: string, chapter: string): Promise<SampleQuestion[]> => {
  const prompt = `Generate 5 standard descriptive/essay-type exam questions (سوالات تشریحی امتحانی) for ${subjectTitle} Grade 10 in Iran.
  Chapter: "${chapter}".

  STRICT CONTENT RULES:
  1. **Style:** Formal, Academic, Serious (Like "Emtehan Nahaee" exams). 
  2. **Language:** Persian (Farsi).
  3. **Digits:** Use Persian Digits (۰-۹) in the text.
  4. **Structure:**
     - Question: A standard problem or definition request.
     - Answer: A complete, descriptive answer including formulas if needed.
  5. **Math:** Use LaTeX ($$ or $) for formulas.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "The exam question in formal Persian." },
        answer: { type: Type.STRING, description: "The detailed answer in formal Persian." },
      },
      required: ["question", "answer"],
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as SampleQuestion[];
  } catch (error) {
    console.error("Error generating sample questions:", error);
    return [];
  }
};

export const solveProblem = async (subjectTitle: string, problemText: string, imageData?: { mimeType: string; data: string }): Promise<string> => {
  try {
    const parts: any[] = [];
    
    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data
        }
      });
    }

    parts.push({
      text: `Solve this ${subjectTitle} problem step-by-step in Persian (Farsi). 
      Use Persian digits (۰-۹) in text.
      Format with headers: "فرمول/نکته:", "حل مسئله:", "پاسخ:".
      Enclose all math in $$...$$ for centered display.
      Problem Context: ${problemText}`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: getSolverInstruction(subjectTitle),
      }
    });
    return response.text || "متاسفانه مشکلی در حل سوال پیش آمد.";
  } catch (error) {
    console.error("Error solving problem:", error);
    return "خطا در ارتباط با هوش مصنوعی.";
  }
};
