import { db } from "@/lib/db";
import Flashcard from "./_components/Flashcard";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const flashcardPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
    flashcardId: string;
  };
}) => {
  const flashcard = await db.flashcarddeck.findUnique({
    where: {
      id: params.flashcardId,
    },
    include: {
      flashcards: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  if (!flashcard) {
    return redirect("/");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-grow">
        <div className="container mx-auto justify-center max-w-[900px]">
          <div className="self-start pt-6">
            <Link
              href={`/courses/${params.courseId}/chapters/${params.chapterId}`}
            >
              <Button variant={"underline"}>
                <ChevronLeft />
                back
              </Button>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center px-24 py-6 gap-6">
            <h1 className="text-[32px] font-extrabold text-center text-black">
              Flashcard
            </h1>
          </div>
          <Flashcard
            title={flashcard.title}
            words={flashcard.flashcards
              .filter((card) => card.front !== null && card.back !== null)
              .map((card) => ({
                id: card.id,
                word: card.front ?? "",
                definition: card.back ?? "",
              }))}
          />
        </div>
      </div>
    </div>
  );
};

export default flashcardPage;
