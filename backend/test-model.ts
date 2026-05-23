import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function testModel(modelName: string) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello!");
    console.log(`Success with ${modelName}`);
  } catch (err: any) {
    console.error(`Failed with ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-flash-latest');
  await testModel('gemini-1.5-flash-001');
  await testModel('gemini-1.5-pro');
}
run();
