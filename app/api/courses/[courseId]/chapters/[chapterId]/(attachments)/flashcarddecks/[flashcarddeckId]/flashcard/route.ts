import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
  req: Request,
  params: { courseId: string; chapterId: string; flashcarddeckId: string }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { frontface, backface } = await req.json();

    const flashcard = await db.flashcard.create({
      data: {
        flashcardDeckId: params.flashcarddeckId,
        front: frontface,
        back: backface,
      },
    });
    return NextResponse.json(flashcard);
  } catch (error) {
    console.log("[FLASHCARD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}