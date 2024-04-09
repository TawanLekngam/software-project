import { db } from "@/lib/db";
import Quiz from "./_components/Quiz";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const quizPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; quizId: string };
}) => {
  const quiz = await db.questionSet.findUnique({
    where: {
      id: params.quizId,
    },
    include: {
      Question: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          answers: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!quiz) {
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
              Quiz
            </h1>
          </div>
          <Quiz
            title={quiz.title}
            questions={quiz.Question.map((question) => ({
              id: question.id,
              question: question.text || "", // Assuming text can be null
              choices: question.answers.map((answer) => answer.text || ""),
              answer:
                question.answers.find((answer) => answer.isCorrect)?.text || "",
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default quizPage;
