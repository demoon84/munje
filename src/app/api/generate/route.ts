import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 모델 우선순위 (할당량 초과 시 다음 모델로 폴백)
const MODELS = [
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
];

const PROMPT = `
Role: You are a professional Math Education Expert.
Context: The user has uploaded an image.

Task:
1. First, determine if the image contains a math problem.
2. If it's NOT a math problem, return: {"notMathProblem": true, "message": "수학 문제가 아닌 이미지입니다."}
3. If it IS a math problem:
   - Analyze the mathematical principle in the image.
   - Infer the appropriate grade level based on the problem.
   - Create 10 NEW similar problems based on the same principle and difficulty.
   - Output the JSON format below.

Output Format (JSON):
For math problems:
{
  "questions": [
    {
      "question": "Problem text (Korean)",
      "answer": "Step-by-step solution and answer (Korean)"
    }
  ]
}

For non-math images:
{
  "notMathProblem": true,
  "message": "수학 문제가 아닌 이미지입니다."
}
`.trim();

async function tryGenerateWithModel(
    genAI: GoogleGenerativeAI,
    modelName: string,
    base64Data: string,
    mimeType: string
): Promise<{ success: boolean; data?: any; error?: string; isQuotaError?: boolean }> {
    try {
        console.log(`Trying model: ${modelName}`);

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });

        const result = await model.generateContent([
            PROMPT,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = result.response;
        let text = response.text();
        text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const data = JSON.parse(text);
        console.log(`Success with model: ${modelName}`);

        return { success: true, data };
    } catch (error: any) {
        const errorMessage = error?.message || "";
        const isQuotaError =
            errorMessage.includes("429") ||
            errorMessage.includes("quota") ||
            errorMessage.includes("RESOURCE_EXHAUSTED") ||
            errorMessage.includes("rate limit");

        console.log(`Model ${modelName} failed:`, errorMessage.slice(0, 100));

        return {
            success: false,
            error: errorMessage,
            isQuotaError
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "이미지가 필요합니다." }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        // Use direct Google API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "API 키가 설정되지 않았습니다." },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try each model until one succeeds
        let lastError = "";
        for (const modelName of MODELS) {
            const result = await tryGenerateWithModel(
                genAI,
                modelName,
                base64Data,
                imageFile.type
            );

            if (result.success && result.data) {
                // Check if it's not a math problem
                if (result.data.notMathProblem) {
                    return NextResponse.json({
                        notMathProblem: true,
                        message: result.data.message || "수학 문제가 아닌 이미지입니다."
                    });
                }

                return NextResponse.json({
                    questions: result.data.questions,
                    model: modelName // 사용된 모델 정보
                });
            }

            lastError = result.error || "Unknown error";

            // If it's not a quota error, don't try other models
            if (!result.isQuotaError) {
                break;
            }
        }

        // All models failed
        let errorMessage = "문제를 생성하는 도중 오류가 발생했습니다.";
        if (lastError.includes("API_KEY")) {
            errorMessage = "API 키가 유효하지 않습니다.";
        } else if (lastError.includes("quota") || lastError.includes("429")) {
            errorMessage = "모든 모델의 API 할당량을 초과했습니다. 잠시 후 다시 시도해주세요.";
        } else if (lastError.includes("JSON")) {
            errorMessage = "AI 응답을 처리하는 중 오류가 발생했습니다.";
        }

        return NextResponse.json(
            { error: errorMessage, details: lastError },
            { status: 500 }
        );

    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "문제를 생성하는 도중 오류가 발생했습니다.", details: error?.message },
            { status: 500 }
        );
    }
}
