import { NextResponse } from "next/server";
import { getCompletion } from "@/lib/completion";
import { FlashcardDTO } from "@/dto/flashcardDTO";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const backCompletion = await getCompletion(
      `create a definition for this word: ${message}`
    );

    const flashcard: FlashcardDTO = {
      front: message,
      back: backCompletion,
    };

    return new NextResponse(JSON.stringify(flashcard));
  } catch (error) {
    console.log("[CHAT AI]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
