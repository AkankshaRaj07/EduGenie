import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data: any = await response.json();
    if (data.models) {
      console.log(data.models.map((m: any) => m.name));
    } else {
      console.log("No models array:", data);
    }
  } catch (err) {
    console.error(err);
  }
}
listModels();
