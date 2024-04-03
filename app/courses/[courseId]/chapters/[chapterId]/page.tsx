import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ChapterNavbar from "../../_components/chapter-navbar";
import CourseHero from "../../_components/course-hero";
import { ChapterBox } from "./_components/chapter-box";

const chapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          documents: {
            orderBy: {
              createdAt: "asc",
            },
          },
          flashcarddecks: {
            orderBy: {
              createdAt: "asc",
            },
          },
          questionSet: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const initialChapterIndex = course!.chapters.findIndex(
    (ch) => ch.id === params.chapterId
  );

  if (!course) {
    return redirect("/");
  }
  return (
    <>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <CourseHero course={course} userId={userId} />
        <div className="w-full flex-grow justify-center px-6 pt-6 bg-[#F3F4F4]">
          <ChapterNavbar
            course={course}
            initialChapterIndex={initialChapterIndex}
          />
          <div className="max-w-[720px] mx-auto justify-center">
            {course.chapters.map((chapter) => (
              <div key={chapter.id}>
                {chapter.documents.map((document) => (
                  <ChapterBox
                    key={document.id}
                    name={document.title}
                    link={`/courses/${params.courseId}/chapters/${params.chapterId}/document/${document.id}`}
                  />
                ))}
                {chapter.flashcarddecks.map((flashcard) => (
                  <ChapterBox
                    key={flashcard.id}
                    name={flashcard.title}
                    link={`/courses/${params.courseId}/chapters/${params.chapterId}/document/${flashcard.id}`}
                  />
                ))}
                {chapter.questionSet.map((question) => (
                  <ChapterBox
                    key={question.id}
                    name={question.title}
                    link={`/courses/${params.courseId}/chapters/${params.chapterId}/document/${question.id}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default chapterIdPage;
