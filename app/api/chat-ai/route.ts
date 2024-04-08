import { NextResponse } from "next/server";
import { getCompletion } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const completion = await getCompletion(message);
    return new NextResponse(completion);
  } catch (error) {
    console.log("[CHAT AI]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
