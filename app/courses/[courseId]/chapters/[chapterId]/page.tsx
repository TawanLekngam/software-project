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
          videos: {
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

  const enroll = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: userId!,
        courseId: params.courseId,
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
        <CourseHero course={course} userId={userId} enroll={enroll?.userId!} />
        <div className="w-full flex-grow justify-center px-6 pt-6 bg-[#F3F4F4]">
          <ChapterNavbar
            course={course}
            initialChapterIndex={initialChapterIndex}
          />
          <div className="max-w-[720px] mx-auto justify-center">
            {course.chapters
              .filter((chapter) => chapter.id === params.chapterId)
              .map((chapter) => (
                <div key={chapter.id}>
                  {chapter.documents.map((document) => (
                    <ChapterBox
                      key={document.id}
                      name={document.title}
                      link={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}/document/${document.id}`}
                    />
                  ))}
                  {chapter.flashcarddecks.map((flashcard) => (
                    <ChapterBox
                      key={flashcard.id}
                      name={flashcard.title}
                      link={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}/flashcard/${flashcard.id}`}
                    />
                  ))}
                  {chapter.questionSet.map((question) => (
                    <ChapterBox
                      key={question.id}
                      name={question.title}
                      link={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}/quiz/${question.id}`}
                    />
                  ))}
                  {chapter.videos.map((video) => (
                    <ChapterBox
                      key={video.id}
                      name={video.title!}
                      link={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}/video/${video.id}`}
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
