import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { userId } = auth();
    const { description } = await req.json();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingUser = await db.userProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!existingUser) {
      const newUser = await db.userProfile.create({
        data: {
          userId: userId,
          description: description,
        },
      });

      return NextResponse.json(newUser);
    }

    const updatedUser = await db.userProfile.update({
      where: {
        userId: userId,
      },
      data: {
        description: description,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log("[USER_ID]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
