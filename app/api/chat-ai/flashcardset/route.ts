import { NextResponse } from "next/server";

import { getCompletion } from "@/lib/gemini";
import { FlashcardDTO } from "@/dto/flashcardDTO";

export async function POST(req: Request) {
  try {
    const { document, number } = await req.json();

    if (!document || !number) {
      return new NextResponse("Bad request", { status: 400 });
    }

    if (number > 10 || number < 1) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const completion = await getCompletion(
      `give ${number} interest keywords for the following document: ${document} in a array format (JSON). example ["keyword1", "keyword2", "keyword3"]`
    );

    // let keyWords = completion.replace(/\\/g, "");
    const start_index = completion.indexOf("[");
    const end_index = completion.indexOf("]");
    let keyWords = completion.slice(start_index, end_index + 1);

    const keywordsArray = JSON.parse(keyWords);

    const keywordWithDefinitions = await Promise.all(
      keywordsArray.map(
        async (keyword: string) =>
          ({
            front: keyword,
            back: await getCompletion(
              `define a short definition for ${keyword} in the context of document: ${document}`
            ),
          } as FlashcardDTO)
      )
    );

    return new NextResponse(JSON.stringify(keywordWithDefinitions));
  } catch (error) {
    console.log("[AI FLASHCARD]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
