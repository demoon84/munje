import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "이미지가 필요합니다." }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        const prompt = `
Role: You are a professional Math Education Expert.
Context: The user has uploaded an image of a math problem.

Task:
1. Analyze the mathematical principle in the image.
2. Infer the appropriate grade level based on the problem.
3. Create 10 NEW similar problems based on the same principle and difficulty.
4. Output specific JSON format only.

Output Format (JSON):
{
  "questions": [
    {
      "question": "Problem text (Korean)",
      "answer": "Step-by-step solution and answer (Korean)"
    }
  ]
}
`.trim();

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: imageFile.type,
                },
            },
        ]);

        const response = result.response;
        let text = response.text();
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const data = JSON.parse(text);
        return NextResponse.json({ questions: data.questions });

    } catch (error: any) {
        console.error("Gemini Error:", error);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);

        let errorMessage = "문제를 생성하는 도중 오류가 발생했습니다.";
        if (error?.message?.includes("API_KEY")) {
            errorMessage = "API 키가 유효하지 않습니다.";
        } else if (error?.message?.includes("quota")) {
            errorMessage = "API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.";
        } else if (error?.message?.includes("JSON")) {
            errorMessage = "AI 응답을 처리하는 중 오류가 발생했습니다.";
        }

        return NextResponse.json(
            { error: errorMessage, details: error?.message },
            { status: 500 }
        );
    }
}
