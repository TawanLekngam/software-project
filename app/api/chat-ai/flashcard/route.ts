import { NextResponse } from "next/server";

import { getCompletion } from "@/lib/gemini";
import { FlashcardDTO } from "@/dto/flashcardDTO";

export async function POST(req: Request) {
  try {
    const { message, document } = await req.json();

    if (!message) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const completion = document
      ? await getCompletion(
          `give a short definition for ${message} based on the following document: ${document}`
        )
      : await getCompletion(`give a short definition for ${message}`);

    const flashcard: FlashcardDTO = {
      front: message,
      back: completion,
    };

    return new NextResponse(JSON.stringify(flashcard));
  } catch (error) {
    console.log("[AI FLASHCARD]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
