import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function POST(
  req: Request,
  {
    params,
  }: { params: { courseId: string; chapterId: string; questionId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });
    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    console.log("[ANSWER]", values);
    const answer = await db.answer.create({
      data: {
        questionId: params.questionId,
        text: values.text || null,
        isCorrect: values.isCorrect || false,
      },
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.log("[ANSWER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
