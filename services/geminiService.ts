import { GoogleGenAI, Type } from "@google/genai";
import { PronunciationFeedback, KanjiExplanation, ImageAnalysisResult } from "../types";

let genAI: GoogleGenAI | null = null;

// --- Models ---
const MODEL_FLASH = 'gemini-2.5-flash';

// --- System Instructions ---
const ROLEPLAY_INSTRUCTION = `
Bạn là Tanaka-sensei, một giáo viên tiếng Nhật thân thiện và khích lệ dành cho học sinh trình độ N5/N4.
1. Nói tiếng Nhật tự nhiên nhưng đơn giản, phù hợp với người mới bắt đầu.
2. Nếu người dùng mắc lỗi, hãy nhẹ nhàng sửa lỗi cho họ trong phần phản hồi.
3. Giữ câu trả lời ngắn gọn (dưới 3 câu) để cuộc trò chuyện trôi chảy.
4. Luôn đóng vai người trò chuyện, không thoát vai.
5. Phần dịch nghĩa (translation) bắt buộc phải là TIẾNG VIỆT.
`;

export const GeminiService = {
  initialize(apiKey: string) {
    genAI = new GoogleGenAI({ apiKey });
  },

  isInitialized() {
    return !!genAI;
  },

  /**
   * Starts a chat session or sends a message in an existing flow.
   */
  async chatWithSensei(history: string[], userMessage: string): Promise<{ japanese: string; english: string }> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Lịch sử cuộc trò chuyện:
      ${history.join('\n')}
      
      Học sinh nói: "${userMessage}"
      
      Hãy trả lời với tư cách là Tanaka-sensei.
      Định dạng đầu ra: JSON với các key "japanese" (câu trả lời của bạn bằng tiếng Nhật) và "english" (Dịch câu trả lời đó sang TIẾNG VIỆT).
      Lưu ý: Dù tên biến là 'english', hãy điền nội dung là TIẾNG VIỆT.
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
            english: { type: Type.STRING, description: "Vietnamese translation" }
          },
          required: ["japanese", "english"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ Tanaka-sensei");
    return JSON.parse(text);
  },

  /**
   * Analyzes user audio for pronunciation and grammar.
   */
  async analyzeAudio(base64Audio: string): Promise<PronunciationFeedback> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Phân tích đoạn ghi âm tiếng Nhật của người học này.
      1. Viết lại (Transcribe) những gì họ nói.
      2. Đánh giá ngữ điệu và phát âm (trình độ N5).
      3. Chấm điểm trên thang 100.
      4. Đưa ra lời khuyên cụ thể bằng TIẾNG VIỆT về cách cải thiện.
      5. Cung cấp một câu ví dụ của người bản xứ.
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
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING, description: "Feedback in Vietnamese" },
            advice: { type: Type.STRING, description: "Advice in Vietnamese" },
            nativeExample: { type: Type.STRING }
          },
          required: ["transcription", "score", "feedback", "advice", "nativeExample"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Phân tích thất bại");
    return JSON.parse(text);
  },

  /**
   * Generates a mnemonic story and examples for a Kanji or Word.
   */
  async getKanjiStory(input: string): Promise<KanjiExplanation> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Dạy tôi từ tiếng Nhật hoặc chữ Kanji cho: "${input}".
      Nếu đầu vào là tiếng Việt/Anh, hãy dịch sang tiếng Nhật trước.
      Tạo một câu chuyện gợi nhớ (mnemonic) vui nhộn, dễ nhớ bằng TIẾNG VIỆT (logic N5).
      Cung cấp nghĩa tiếng Việt và 2 câu ví dụ.
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kanji: { type: Type.STRING, description: "The word in Kanji/Kana" },
            reading: { type: Type.STRING, description: "Hiragana/Romaji reading" },
            meaning: { type: Type.STRING, description: "Vietnamese meaning" },
            mnemonic: { type: Type.STRING, description: "A fun story in Vietnamese to remember it" },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING },
                  reading: { type: Type.STRING },
                  translation: { type: Type.STRING, description: "Vietnamese translation" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không thể tạo câu chuyện");
    return JSON.parse(text);
  },

  /**
   * Analyzes an image to identify objects and translate them.
   */
  async analyzeImage(base64Image: string): Promise<ImageAnalysisResult> {
    if (!genAI) throw new Error("API Key chưa được cài đặt.");

    const prompt = `
      Nhận diện đối tượng chính trong hình ảnh này.
      Cung cấp từ tiếng Nhật (Kanji + Kana), nghĩa Tiếng Việt, và một câu ví dụ đơn giản trình độ N5 mô tả đối tượng trong ngữ cảnh của bức ảnh.
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
            englishMeaning: { type: Type.STRING, description: "Vietnamese meaning" },
            exampleSentence: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Phân tích ảnh thất bại");
    return JSON.parse(text);
  }
};