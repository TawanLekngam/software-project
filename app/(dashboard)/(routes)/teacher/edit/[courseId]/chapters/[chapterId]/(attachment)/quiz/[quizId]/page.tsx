import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChevronLeft, PencilRuler } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { QuizTitleForm } from "./_components/quiz-title-form";
import { QuizForm } from "./_components/quiz-form";
import { Actions } from "./_components/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const QuizPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
    quizId: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const questionSet = await db.questionSet.findUnique({
    where: {
      id: params.quizId,
    },
    include: {
      Question: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          answers: {
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!questionSet) {
    return redirect("/");
  }

  return (
    <>
      {!questionSet?.isPublished && (
        <Banner label="This course is unpublished. It will not be visible to the students." />
      )}
      <div className="flex flex-col items-center justify-center w-full px-4 py-16 gap-8 ">
        <div className="flex items-center w-4/5 max-w-7xl justify-between">
          <Link
            href={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}`}
          >
            <Button variant={"underline"}>
              <ChevronLeft />
              back
            </Button>
          </Link>
          <div className="flex flex-row gap-2 items-center justify-center">
            <PencilRuler />
            <h1 className="text-2xl font-medium">Question set</h1>
          </div>

          <Actions
            disabled={false}
            courseId={params.courseId}
            chapterId={params.chapterId}
            questionSetId={params.quizId}
            isPublished={questionSet.isPublished}
          />
        </div>

        <div className="flex flex-col gap-8 w-4/5 max-w-7xl justify-center">
          <QuizTitleForm
            initialData={questionSet}
            courseId={params.courseId}
            chapterId={params.chapterId}
            questionsetId={params.quizId}
          />
          <hr className="border-t-4 rounded-md border-gray-400" />
          <QuizForm
            initialData={questionSet.Question}
            courseId={params.courseId}
            chapterId={params.chapterId}
            questionsetId={params.quizId}
          />
        </div>
      </div>
    </>
  );
};

export default QuizPage;
