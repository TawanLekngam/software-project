import { getCompletion } from "@/lib/completion";
import { NextResponse } from "next/server";
import { QuestionDTO } from "@/dto/questionDTO";

export default async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Bad request", { status: 400 });
    }

    const questionCompletion = await getCompletion(
      `create a question with this message: ${message}`
    );

    const answer1Completion = await getCompletion(
      `create a wrong question for ${questionCompletion}`
    );

    const answer2Completion = await getCompletion(
      `create a wrong question for ${questionCompletion}`
    );

    const answer3Completion = await getCompletion(
      `create a  wrong  question for ${questionCompletion}`
    );

    const answer4Completion = await getCompletion(
      `create a  wrong question for ${questionCompletion}`
    );

    const question: QuestionDTO = {
      question: questionCompletion,
      answers: [
        {
          answer: answer1Completion,
          isCorrect: true,
        },
        {
          answer: answer2Completion,
          isCorrect: false,
        },
        {
          answer: answer3Completion,
          isCorrect: false,
        },
        {
          answer: answer4Completion,
          isCorrect: true,
        },
      ],
    };

    return new NextResponse(JSON.stringify(question));
  } catch (error) {
    console.log("[QUESTION AI]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
