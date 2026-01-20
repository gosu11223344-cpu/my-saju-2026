import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, FortuneResult } from "../types";

// Vite에서는 process.env가 아니라 import.meta.env 사용
const apiKey = import.meta.env.VITE_API_KEY as string;

if (!apiKey) {
  throw new Error(
    "VITE_API_KEY가 없습니다. 프로젝트 루트의 .env에 VITE_API_KEY=... 를 설정하세요."
  );
}

const ai = new GoogleGenAI({ apiKey });

function safeText(res: any): string {
  // @google/genai 응답 객체 형태가 환경/버전에 따라 달라질 수 있어 안전 처리
  return (
    res?.text ??
    res?.response?.text ??
    res?.response?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ??
    ""
  );
}

export async function generateSajuFortune(user: UserInput): Promise<FortuneResult> {
  const birthTime =
    user.birthTime && user.birthTime !== "unknown" ? user.birthTime : "Unknown";

  const prompt = `
Based on Korean Saju (Four Pillars of Destiny), provide a detailed fortune for the year 2026 (Byeong-o).
User Details:
Name: ${user.name}
Gender: ${user.gender === "male" ? "Male" : "Female"}
Birth Date: ${user.birthDate}
Birth Time: ${birthTime}
Calendar Type: ${user.calendarType}

Return strictly valid JSON only (no markdown, no extra commentary).
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: `
You are an expert Korean Saju master (Myeong-ri-hak practitioner).
Provide accurate and detailed 2026 new year's fortune analysis.
The language MUST be Korean.
Tone: professional, wise, encouraging.
Output must be STRICTLY valid JSON matching the schema.
Do NOT wrap JSON in markdown code fences.
`.trim(),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "2026년 전체 요약" },
          keyword: { type: Type.STRING, description: "올해를 대표하는 한마디(사자성어/짧은 구)" },
          score: { type: Type.NUMBER, description: "0~100 운세 점수" },
          wealth: { type: Type.STRING, description: "재물운 상세" },
          career: { type: Type.STRING, description: "직업/사업운 상세" },
          love: { type: Type.STRING, description: "연애/관계운 상세" },
          health: { type: Type.STRING, description: "건강운 상세" },
          monthlyLuck: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.NUMBER, description: "1~12" },
                description: { type: Type.STRING, description: "해당 월 운세" }
              },
              required: ["month", "description"]
            }
          },
          advice: { type: Type.STRING, description: "마무리 조언" }
        },
        required: [
          "summary",
          "keyword",
          "score",
          "wealth",
          "career",
          "love",
          "health",
          "monthlyLuck",
          "advice"
        ]
      }
    }
  });

  const raw = safeText(response);

  try {
    // 혹시 앞뒤에 잡텍스트가 섞여도 JSON만 추출 시도
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonText =
      jsonStart >= 0 && jsonEnd >= 0 ? raw.slice(jsonStart, jsonEnd + 1) : raw;

    return JSON.parse(jsonText) as FortuneResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.error("Raw response text:", raw);
    throw new Error("운세를 생성하는 중에 오류가 발생했습니다.");
  }
}
