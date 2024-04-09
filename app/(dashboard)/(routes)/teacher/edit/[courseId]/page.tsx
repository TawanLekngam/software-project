import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ImageForm } from "./_components/image-form";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import ChapterNavbar from "./_components/chapter-navbar";
import { CourseActions } from "./_components/course-actions";
import { SelectCategory } from "./_components/select-category";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const EditPage = async ({ params }: { params: { courseId: string } }) => {
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

  if (course.chapters.length === 0) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <div className="flex flex-col w-full items-center lg:items-start justify-center px-6 gap-2 lg:gap-6 py-12 lg:flex-row bg-white h-full">
          <Link href={`/courses/${params.courseId}`}>
            <Button variant={"underline"}>
              <ChevronLeft />
              back
            </Button>
          </Link>
          <div className="w-[270px] h-[200px]">
            <ImageForm initialData={course} courseId={course.id} />
          </div>
          <div className="flex flex-col max-w-[720px] items-center justify-center lg:items-start">
            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <div className="flex flex-row w-full justify-between pt-8 items-center gap-4">
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
          <ChapterNavbar course={course} initialChapterIndex={0} />
        </div>
      </div>
    );
  }
  return redirect(
    `/teacher/edit/${course.id}/chapters/${course.chapters[0].id}`
  );
};

export default EditPage;
