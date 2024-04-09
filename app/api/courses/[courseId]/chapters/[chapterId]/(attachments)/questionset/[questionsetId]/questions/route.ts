import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
  req: Request,
  {
    params,
  }: { params: { courseId: string; chapterId: string; questionsetId: string } }
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

    const question = await db.question.create({
      data: {
        questionSetId: params.questionsetId,
        text: values.question,
      },
    include: {
      answers: true,
    },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.log("[QUESTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
