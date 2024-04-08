import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function getCompletion(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}
