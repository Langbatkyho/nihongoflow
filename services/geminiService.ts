
import { GoogleGenAI, Type } from "@google/genai";
import { PronunciationFeedback, KanjiExplanation, ImageAnalysisResult, WritingFeedback, QuizQuestion } from "../types";

let genAI: GoogleGenAI | null = null;
const MODEL_FLASH = 'gemini-2.5-flash';

const ROLEPLAY_INSTRUCTION = `
Bạn là Tanaka-sensei, giáo viên tiếng Nhật N5/N4.
1. Nói tiếng Nhật tự nhiên, đơn giản.
2. Sửa lỗi nhẹ nhàng.
3. Trả về JSON gồm: japanese (câu trả lời), romaji (phiên âm), english (nghĩa Tiếng Việt).
`;

export const GeminiService = {
  initialize(apiKey: string) {
    genAI = new GoogleGenAI({ apiKey });
  },

  isInitialized() {
    return !!genAI;
  },

  async chatWithSensei(history: string[], userMessage: string): Promise<{ japanese: string; romaji: string; english: string }> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Lịch sử: ${history.join('\n')}
      Học sinh: "${userMessage}"
      Trả lời dưới dạng JSON: { "japanese": "...", "romaji": "...", "english": "Tiếng Việt" }
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        systemInstruction: ROLEPLAY_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            japanese: { type: Type.STRING },
            romaji: { type: Type.STRING },
            english: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async analyzeAudio(base64Audio: string): Promise<PronunciationFeedback> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Phân tích audio tiếng Nhật (N5/N4).
      Trả về JSON: transcription, romaji, score (0-100), feedback (Tiếng Việt), advice (Tiếng Việt), nativeExample, exampleRomaji.
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/wav", data: base64Audio } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            romaji: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            advice: { type: Type.STRING },
            nativeExample: { type: Type.STRING },
            exampleRomaji: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async getKanjiStory(input: string): Promise<KanjiExplanation> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Dạy Kanji/Từ vựng: "${input}". 
      Tạo mnemonic (câu chuyện gợi nhớ) vui bằng Tiếng Việt.
      Trả về JSON đủ các trường: kanji, reading (kana), romaji, meaning (Tiếng Việt), mnemonic, examples [{sentence, reading, romaji, translation}].
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kanji: { type: Type.STRING },
            reading: { type: Type.STRING },
            romaji: { type: Type.STRING },
            meaning: { type: Type.STRING },
            mnemonic: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  romaji: { type: Type.STRING },
                  translation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async analyzeImage(base64Image: string): Promise<ImageAnalysisResult> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Nhận diện vật thể chính. Dịch sang tiếng Nhật (N5).
      Trả về JSON: japaneseTerm, reading, romaji, englishMeaning (Tiếng Việt), exampleSentence, exampleRomaji.
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH, 
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            japaneseTerm: { type: Type.STRING },
            reading: { type: Type.STRING },
            romaji: { type: Type.STRING },
            englishMeaning: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            exampleRomaji: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async evaluateHandwriting(base64Image: string, targetChar: string): Promise<WritingFeedback> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");
    const prompt = `Chấm điểm chữ viết tay "${targetChar}". JSON: recognizedChar, score, feedback (Việt), exampleWord, exampleMeaning.`;
    
    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: {
        parts: [
            { inlineData: { mimeType: "image/png", data: base64Image } },
            { text: prompt }
        ]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  },

  async generateQuiz(type: 'LISTENING' | 'GRAMMAR' | 'TEST', level: 'N5' | 'N4'): Promise<QuizQuestion[]> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    let typePrompt = "";
    if (type === 'LISTENING') typePrompt = "Tạo bài tập nghe. 'question' là transcript hội thoại (tiếng Nhật). Người dùng sẽ nghe transcript này.";
    if (type === 'GRAMMAR') typePrompt = "Tạo bài tập ngữ pháp trắc nghiệm (điền vào chỗ trống).";
    if (type === 'TEST') typePrompt = "Tạo bài kiểm tra tổng hợp (từ vựng, ngữ pháp, đọc hiểu).";

    const prompt = `
      Tạo 5 câu hỏi trắc nghiệm trình độ ${level} theo giáo trình Minna no Nihongo.
      ${typePrompt}
      Trả về JSON mảng đối tượng: { id (number), type ('text' hoặc 'audio' - audio dùng cho bài nghe), question (nội dung), options (mảng 4 đáp án), correctIndex (0-3), explanation (giải thích tiếng Việt) }.
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              type: { type: Type.STRING, enum: ["text", "audio"] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }
};
