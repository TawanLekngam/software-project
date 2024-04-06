import { getCompletion } from "@/lib/completion";
import { NextResponse } from "next/server";
import { QuestionDTO } from "@/dto/questionDTO";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const questionCompletion = await getCompletion(
      `create a question from this message: ${message}`
    );

    const answer1Completion = await getCompletion(
      `create a correct answer for ${questionCompletion}`
    );

    const answer2Completion = await getCompletion(
      `create a wrong answer for ${questionCompletion}`
    );

    const answer3Completion = await getCompletion(
      `create a  wrong  answer for ${questionCompletion}`
    );

    const answer4Completion = await getCompletion(
      `create a  wrong answer for ${questionCompletion}`
    );

    const question: QuestionDTO = {
      question: questionCompletion,
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
