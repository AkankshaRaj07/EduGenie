import { generateQuestions } from './src/services/ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    console.log("Testing generation...");
    const res = await generateQuestions({
      title: "Electricity",
      questionTypes: ["Short Questions"],
      numQuestions: 2,
      totalMarks: 6
    });
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Failure:", err);
  }
}
test();
