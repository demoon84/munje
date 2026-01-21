// 모델 접근 테스트 스크립트
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-1.5-flash-latest",
];

async function testModel(genAI, modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello' in Korean");
        const text = result.response.text();
        console.log(`✅ ${modelName}: ${text.slice(0, 50)}...`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.slice(0, 80)}`);
        return false;
    }
}

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("❌ GEMINI_API_KEY not found");
        return;
    }

    console.log("🔍 Testing models...\n");
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const model of MODELS) {
        await testModel(genAI, model);
    }
}

main();
