import { GoogleGenerativeAI, Content } from "@google/generative-ai";

export interface ChatProps {
  message: string;
  chatHistorys: Content[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

export async function getCompletion(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function getChat(
  mesage: string,
  chatHistorys: Content[]
): Promise<ChatProps> {
  const chat = model.startChat({
    history: chatHistorys,
    generationConfig: {
      maxOutputTokens: 255,
    },
  });
  const result = await chat.sendMessage(mesage);

  const chatResponse: ChatProps = {
    message: result.response.text(),
    chatHistorys: await chat.getHistory(),
  };

  return chatResponse;
}
