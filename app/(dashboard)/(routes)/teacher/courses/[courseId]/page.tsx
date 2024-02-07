import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { LayoutGrid, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId, userId },
    include: {
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  if (!course) {
    return redirect("/");
  }

  const requireFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters.some(chapter => chapter.isPublished)
  ];

  const totalFields = requireFields.length;
  const completedFields = requireFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutGrid} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            option={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={ListChecks} />
            <h2 className="text-xl">Chapter</h2>
          </div>
          <ChaptersForm initialData={course} courseId={course.id} />
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;