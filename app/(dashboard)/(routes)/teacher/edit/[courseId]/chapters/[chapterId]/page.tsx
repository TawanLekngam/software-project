import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChapterBox } from "./_components/attachment-box";
import { CreateAttachment } from "./_components/create-attachment";
import { ImageForm } from "../../_components/image-form";
import { TitleForm } from "../../_components/title-form";
import { DescriptionForm } from "../../_components/description-form";
import { ChapterNavbar } from "../../_components/chapter-navbar";
import { CourseActions } from "../../_components/course-actions";
import { SelectCategory } from "../../_components/select-category";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const chapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        include: {
          userProgress: {
            where: {
              userId,
            },
          },
          documents: {
            orderBy: {
              createdAt: "asc",
            },
            where: {
              chapterId: params.chapterId, // Filter documents for the current chapter
            },
          },
          flashcarddecks: {
            orderBy: {
              createdAt: "asc",
            },
            where: {
              chapterId: params.chapterId, // Filter documents for the current chapter
            },
          },
          questionSet: {
            orderBy: {
              createdAt: "asc",
            },
            where: {
              chapterId: params.chapterId, // Filter documents for the current chapter
            },
          },
          videos: {
            where: {
              chapterId: params.chapterId, // Filter documents for the current chapter
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const category = await db.category.findMany();

  if (!course) {
    return redirect("/");
  }

  const initialChapterIndex = course.chapters.findIndex(
    (chapter) => chapter.id === params.chapterId
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="flex flex-col w-full items-center lg:items-start justify-center px-6 py-12 gap-6 lg:flex-row bg-white">
        <Link href={`/courses/${params.courseId}/chapters/${params.chapterId}`}>
          <Button variant={"underline"}>
            <ChevronLeft />
            back
          </Button>
        </Link>
        <div className="w-[270px] h-[200px]">
          <ImageForm initialData={course} courseId={course.id} />
        </div>
        <div className="flex flex-col max-w-[720px] items-center justify-center lg:items-start pt-6 lg:pt-0">
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <div className="flex flex-row w-full justify-between pt-8 items-center">
            <SelectCategory
              courseId={course.id}
              initialCategory={course.categoryId}
              category={category}
            />

            <CourseActions
              courseId={course.id}
              disabled={false}
              isPublished={course.isPublished}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex-grow justify-center px-6 pt-6 bg-[#F3F4F4]">
        <div className="flex w-screen justify-center item-center ">
          <ChapterNavbar
            course={course}
            initialChapterIndex={initialChapterIndex}
          />
        </div>
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
          <div className="flex justify-center">
            <CreateAttachment
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default chapterIdPage;
