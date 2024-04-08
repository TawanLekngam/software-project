import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CourseHero from "./_components/course-hero";
import ChapterNavbar from "./_components/chapter-navbar";

const CoursePage = async ({
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
  if (course.chapters.length === 0) {
    return (
      <>      
        <CourseHero course={course} userId={userId} enroll={enroll?.userId!} />
        <ChapterNavbar
          initialChapterIndex={initialChapterIndex}
          course={course}
        />
      </>
    );
  }
  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
};

export default CoursePage;
