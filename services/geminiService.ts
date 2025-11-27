
import { GoogleGenAI, Type } from "@google/genai";
import { PronunciationFeedback, KanjiExplanation, ImageAnalysisResult, WritingFeedback, QuizQuestion, Phrase } from "../types";

let genAI: GoogleGenAI | null = null;
const MODEL_FLASH = 'gemini-2.5-flash';

const ROLEPLAY_INSTRUCTION = `
Bạn là Tanaka-sensei, giáo viên tiếng Nhật N5/N4 nhiệt tình.
1. Người dùng có thể nói tiếng Nhật hoặc tiếng Việt. Nếu họ nói tiếng Việt, hãy hiểu và trả lời bằng tiếng Nhật kèm dịch nghĩa.
2. Trả lời ngắn gọn, tự nhiên, phù hợp trình độ sơ cấp.
3. Luôn trả về JSON: 
   - japanese: câu trả lời của bạn (Kanji/Kana).
   - romaji: phiên âm romaji của câu tiếng Nhật.
   - english: dịch nghĩa câu trả lời của bạn sang Tiếng Việt.
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
      Lịch sử hội thoại:
      ${history.join('\n')}
      
      Học sinh nói: "${userMessage}"
      
      Hãy đóng vai Tanaka-sensei và trả lời.
      Định dạng JSON: { "japanese": "...", "romaji": "...", "english": "Dịch tiếng Việt" }
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

  async analyzeAudio(base64Audio: string, targetSentence?: string): Promise<PronunciationFeedback> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const context = targetSentence ? `Câu mẫu cần đọc là: "${targetSentence}".` : "Người dùng đang nói tự do.";

    const prompt = `
      Phân tích audio tiếng Nhật (N5/N4). ${context}
      Trả về JSON: transcription, romaji, score (0-100), feedback (Tiếng Việt, chỉ ra lỗi sai cụ thể), advice (Tiếng Việt), nativeExample (gợi ý câu đúng hoặc câu tốt hơn), exampleRomaji.
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

  async getShadowingSentence(): Promise<{ japanese: string; romaji: string; meaning: string }> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");
    const prompt = "Tạo 1 câu tiếng Nhật ngẫu nhiên (trình độ N5/N4) để luyện nói. JSON: japanese, romaji, meaning (Tiếng Việt).";
    
    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             japanese: { type: Type.STRING },
             romaji: { type: Type.STRING },
             meaning: { type: Type.STRING }
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
    if (type === 'LISTENING') typePrompt = "Tạo bài tập nghe. 'question' là transcript hội thoại (tiếng Nhật).";
    if (type === 'GRAMMAR') typePrompt = "Tạo bài tập ngữ pháp (điền từ).";
    if (type === 'TEST') typePrompt = "Tạo bài kiểm tra tổng hợp.";

    const prompt = `
      Tạo 5 câu hỏi trắc nghiệm trình độ ${level} chủ đề cuộc sống hàng ngày.
      ${typePrompt}
      Yêu cầu bắt buộc:
      1. Cung cấp phiên âm 'romaji' cho TẤT CẢ các câu hỏi (questionRomaji) và TẤT CẢ các đáp án (optionsRomaji).
      2. Với phần Nghe (LISTENING), vẫn hiển thị transcript và romaji.
      
      Trả về JSON mảng đối tượng: 
      { 
        id (number), 
        type ('text' hoặc 'audio'), 
        question (nội dung tiếng Nhật), 
        questionRomaji (phiên âm Romaji của câu hỏi),
        options (mảng 4 đáp án tiếng Nhật), 
        optionsRomaji (mảng 4 đáp án phiên âm Romaji tương ứng),
        correctIndex (0-3), 
        explanation (giải thích tiếng Việt) 
      }.
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
              questionRomaji: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              optionsRomaji: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  },

  async getMorePhrases(category: string): Promise<Phrase[]> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");
    const prompt = `Tạo 5 mẫu câu tiếng Nhật thông dụng chủ đề "${category}" (N5/N4). JSON: japanese, romaji, vietnamese, category.`;
    
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
              japanese: { type: Type.STRING },
              romaji: { type: Type.STRING },
              vietnamese: { type: Type.STRING },
              category: { type: Type.STRING },
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }
};
