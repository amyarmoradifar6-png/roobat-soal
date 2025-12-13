import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { QuizQuestion, Flashcard, StepByStepExercise, SampleQuestion } from "../types";

// Initialize API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Safety Settings to prevent blocking harmless content
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// --- MOCK DATA FOR FALLBACK (Prevents "Error" screen) ---

const MOCK_QUIZ: QuizQuestion[] = [
  {
    question: "کدام کمیت نرده‌ای است؟ (نمونه آفلاین)",
    options: ["جابجایی", "نیرو", "دما", "شتاب"],
    correctIndex: 2,
    explanation: "دما جهت ندارد و فقط اندازه دارد، پس نرده‌ای است."
  },
  {
    question: "یکای چگالی در SI چیست؟",
    options: ["kg/m³", "g/cm³", "kg/L", "N/m²"],
    correctIndex: 0,
    explanation: "یکای جرم kg و یکای حجم m³ است."
  },
  {
    question: "فشار مایعات به چه عاملی بستگی ندارد؟",
    options: ["چگالی مایع", "شتاب گرانش", "ارتفاع مایع", "سطح مقطع ظرف"],
    correctIndex: 3,
    explanation: "فشار مایعات P = ρgh است و به سطح مقطع بستگی ندارد."
  }
];

const MOCK_FLASHCARDS: Flashcard[] = [
  { front: "کمیت نرده‌ای (آفلاین)", back: "کمیتی که فقط دارای اندازه است." },
  { front: "اصل ارشمیدس", back: "نیروی شناوری برابر است با وزن شاره جابجا شده." },
  { front: "گرما", back: "انرژی منتقل شده به دلیل اختلاف دما." }
];

const MOCK_STEPS: StepByStepExercise[] = [
  {
    question: "جسمی به جرم ۲ کیلوگرم با سرعت ۱۰ متر بر ثانیه حرکت می‌کند. انرژی جنبشی آن چقدر است؟ (آفلاین)",
    solution: "طبق فرمول انرژی جنبشی داریم:\n$$K = \\frac{1}{2}mv^2$$\nبا جایگذاری اعداد:\n$$K = 0.5 \\times 2 \\times 100$$\nبنابراین:\n$$K = 100 \\text{ J}$$"
  }
];

const MOCK_SAMPLES: SampleQuestion[] = [
  {
    question: "تفاوت تبخیر سطحی و جوشش را بنویسید. (آفلاین)",
    answer: "تبخیر سطحی در هر دمایی رخ می‌دهد و فقط از سطح مایع است، اما جوشش در دمای خاصی و از تمام حجم مایع صورت می‌گیرد."
  }
];

// --- HELPERS ---

const parseJson = <T>(text: string | undefined, fallback: T): T => {
  if (!text) return fallback;
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBracket = cleanText.indexOf('[');
    const firstBrace = cleanText.indexOf('{');
    let startIndex = -1;
    let endIndex = -1;

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
    console.warn("JSON Parse Error, using fallback data.");
    return fallback;
  }
};

const getSystemInstruction = (subjectTitle: string) => `
You are an expert ${subjectTitle} teacher for Grade 10 students in Iran.
Language: Persian (Farsi).
Style: Like high-quality Iranian textbooks (e.g., Kheili Sabz, Gaj).
Rules:
1. Return ONLY valid JSON.
2. IMPORTANT: Wrap ALL math formulas, equations, variables (like x, y, kg, m/s), and numbers in formulas with '$$' for block equations or '$' for inline math.
3. Example: "سرعت جسم برابر است با $v = 20 m/s$."
4. Do NOT output raw LaTeX without delimiters.
5. Use Persian numbers (۰-۹) for text descriptions, but English numbers (0-9) INSIDE the math formulas ($...$).
`;

// --- API FUNCTIONS ---

export const createChatSession = (subjectTitle: string = 'فیزیک') => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(subjectTitle),
      safetySettings,
    },
  });
};

export const generateQuizQuestions = async (subjectTitle: string, chapter: string, count: number = 5): Promise<QuizQuestion[]> => {
  const prompt = `Generate ${count} multiple-choice questions for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Output JSON Array: [{"question": "...", "options": ["..."], "correctIndex": 0, "explanation": "..."}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", safetySettings }
    });
    const data = parseJson<QuizQuestion[]>(response.text, []);
    return data.length > 0 ? data : MOCK_QUIZ;
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return MOCK_QUIZ;
  }
};

export const generateFlashcards = async (subjectTitle: string, chapter: string, count: number = 10): Promise<Flashcard[]> => {
  const prompt = `Create ${count} flashcards for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Output JSON Array: [{"front": "...", "back": "..."}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", safetySettings }
    });
    const data = parseJson<Flashcard[]>(response.text, []);
    return data.length > 0 ? data : MOCK_FLASHCARDS;
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    return MOCK_FLASHCARDS;
  }
};

export const generateStepByStepExercises = async (subjectTitle: string, chapter: string): Promise<StepByStepExercise[]> => {
  const prompt = `Create 3 textbook-style exercises with DETAILED solutions for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Output JSON Array: [{"question": "...", "solution": "..."}]
  Make sure to format the solution with steps, using '$$' for formulas.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", safetySettings }
    });
    const data = parseJson<StepByStepExercise[]>(response.text, []);
    return data.length > 0 ? data : MOCK_STEPS;
  } catch (error) {
    console.error("Exercise Gen Error:", error);
    return MOCK_STEPS;
  }
};

export const generateSampleQuestions = async (subjectTitle: string, chapter: string): Promise<SampleQuestion[]> => {
  const prompt = `Create 5 descriptive exam questions for ${subjectTitle} Grade 10, Chapter: "${chapter}".
  Output JSON Array: [{"question": "...", "answer": "..."}]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", safetySettings }
    });
    const data = parseJson<SampleQuestion[]>(response.text, []);
    return data.length > 0 ? data : MOCK_SAMPLES;
  } catch (error) {
    console.error("Sample Q Gen Error:", error);
    return MOCK_SAMPLES;
  }
};

export const solveProblem = async (subjectTitle: string, problemText: string, imageData?: { mimeType: string; data: string }): Promise<string> => {
  try {
    const parts: any[] = [];
    if (imageData) parts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
    parts.push({ text: `Solve this ${subjectTitle} problem in Persian. Use LaTeX.` }); 

    parts[parts.length - 1].text = `Solve this ${subjectTitle} problem step-by-step in Persian, like an Iranian textbook.
      Problem: ${problemText}
      Rules:
      1. Use LaTeX for ALL math formulas, wrapped in '$$' or '$'.
      2. Use Persian digits for text explanation.
      3. Use English digits inside the LaTeX formulas.
      `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { safetySettings }
    });
    return response.text || "متاسفانه مشکلی در حل سوال پیش آمد.";
  } catch (error) {
    console.error("Solver Error:", error);
    return "خطا در ارتباط. لطفا دوباره تلاش کنید.";
  }
};