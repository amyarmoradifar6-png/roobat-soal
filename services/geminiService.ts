import { GoogleGenAI } from "@google/genai";
import { QuizQuestion, Flashcard, StepByStepExercise, SampleQuestion } from "../types";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Robust JSON parser that extracts JSON array/object from text safely
const parseJson = <T>(text: string | undefined, fallback: T): T => {
  if (!text) return fallback;
  try {
    // 1. Remove markdown code blocks
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Find the JSON array or object brackets
    const firstBracket = cleanText.indexOf('[');
    const firstBrace = cleanText.indexOf('{');
    
    let startIndex = -1;
    let endIndex = -1;

    // Determine if we are looking for array or object
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIndex = firstBracket;
        endIndex = cleanText.lastIndexOf(']');
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
        endIndex = cleanText.lastIndexOf('}');
    }

    if (startIndex !== -1 && endIndex !== -1) {
        cleanText = cleanText.substring(startIndex, endIndex + 1);
    }

    return JSON.parse(cleanText) as T;
  } catch (error) {
    console.error("JSON Parse Error:", error);
    // If parsing fails, try to return fallback, or maybe fix common JSON errors if needed
    return fallback;
  }
};

const getSystemInstruction = (subjectTitle: string) => `
You are an expert ${subjectTitle} teacher for Grade 10 students in Iran.
Language: Persian (Farsi).
Method: Step-by-step, clear, encouraging.
Use Persian digits (۰-۹) for numbers in text.
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
  const prompt = `Generate ${count} multiple-choice questions for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Language: Persian.
  Format: JSON Array only.
  
  [
    {
      "question": "Question text...",
      "options": ["Op1", "Op2", "Op3", "Op4"],
      "correctIndex": 0,
      "explanation": "Brief explanation..."
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return parseJson<QuizQuestion[]>(response.text, []);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateFlashcards = async (subjectTitle: string, chapter: string, count: number = 10): Promise<Flashcard[]> => {
  const prompt = `Create ${count} study flashcards for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Language: Persian.
  Format: JSON Array only.
  
  [
    {
      "front": "Concept",
      "back": "Definition"
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return parseJson<Flashcard[]>(response.text, []);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};

export const generateStepByStepExercises = async (subjectTitle: string, chapter: string): Promise<StepByStepExercise[]> => {
  const prompt = `Generate 3 textbook-style exercises for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Language: Persian.
  Format: JSON Array only.
  
  [
    {
      "question": "Problem text...",
      "solution": "Step 1... \n\n **فرمول:** $$...$$ \n\n **محاسبه:** $$...$$"
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return parseJson<StepByStepExercise[]>(response.text, []);
  } catch (error) {
    console.error("Error generating exercises:", error);
    return [];
  }
};

export const generateSampleQuestions = async (subjectTitle: string, chapter: string): Promise<SampleQuestion[]> => {
  const prompt = `Generate 5 descriptive exam questions for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Language: Persian.
  Format: JSON Array only.
  
  [
    {
      "question": "Question...",
      "answer": "Detailed answer..."
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return parseJson<SampleQuestion[]>(response.text, []);
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
      text: `Solve this ${subjectTitle} problem step-by-step in Persian.
      Problem: ${problemText}
      Use LaTeX for math.`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: getSystemInstruction(subjectTitle),
      }
    });
    return response.text || "متاسفانه مشکلی در حل سوال پیش آمد.";
  } catch (error) {
    console.error("Error solving problem:", error);
    return "خطا در ارتباط با هوش مصنوعی. لطفا دوباره تلاش کنید.";
  }
};