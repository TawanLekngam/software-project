import { db } from "@/lib/db";
import Flashcard from "./_components/Flashcard";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const flashcardPage = async ({
  params,
}: {
  params: {
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
        <div className="container mx-auto justify-center max-w-[980px]">
          <div className="flex flex-col items-center justify-center px-24 py-12 gap-12">
            <Button variant={"outline"} onClick={router.back}>
              <ChevronLeft />
              back
            </Button>
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
