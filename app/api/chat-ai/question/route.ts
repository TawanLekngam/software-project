import { getCompletion } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { QuestionDTO } from "@/dto/questionDTO";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const answer1Completion = await getCompletion(
      `create a correct answer for ${message}`
    );

    const answer2Completion = await getCompletion(
      `create a wrong answer for ${message}`
    );

    const answer3Completion = await getCompletion(
      `create a  wrong  answer for ${message}`
    );

    const answer4Completion = await getCompletion(
      `create a  wrong answer for ${message}`
    );

    const question: QuestionDTO = {
      question: message,
      answers: [
        {
          text: answer1Completion,
          isCorrect: true,
        },
        {
          text: answer2Completion,
          isCorrect: false,
        },
        {
          text: answer3Completion,
          isCorrect: false,
        },
        {
          text: answer4Completion,
          isCorrect: false,
        },
      ],
    };

    return new NextResponse(JSON.stringify(question));
  } catch (error) {
    console.log("[QUESTION AI]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
