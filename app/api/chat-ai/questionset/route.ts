import { NextResponse } from "next/server";

import { getCompletion } from "@/lib/gemini";
import { QuestionDTO } from "@/dto/questionDTO";

export async function POST(req: Request) {
  try {
    const { document, number } = await req.json();

    if (!document || !number) {
      return new NextResponse("Bad request", { status: 400 });
    }

    if (number > 5 || number < 1) {
      return new NextResponse("Bar request", { status: 400 });
    }

    const completion = await getCompletion(
      `give ${number} questions for the following document: ${document} in a array format (JSON) without question number. example ["question1", "question2", "question3"]`
    );

    const questions = completion.replace(/\\/g, "");
    const questionsArray = JSON.parse(questions);

    const questionsWithAnswers = await Promise.all(
      questionsArray.map(
        async (question: string) =>
          ({
            question: question,
            answers: [
              {
                text: await getCompletion(
                  `create a correct answer (short answer) for ${question}`
                ),
                isCorrect: true,
              },
              {
                text: await getCompletion(
                  `create a wrong answer (short answer) for ${question}`
                ),
                isCorrect: false,
              },
              {
                text: await getCompletion(
                  `create a wrong answer (short answer) for ${question}`
                ),
                isCorrect: false,
              },
              {
                text: await getCompletion(
                  `create a wrong answer (short answer) for ${question}`
                ),
                isCorrect: false,
              },
            ],
          } as QuestionDTO)
      )
    );

    return new NextResponse(JSON.stringify(questionsWithAnswers));
  } catch (error) {
    console.log("[AI QUESTIONSET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
