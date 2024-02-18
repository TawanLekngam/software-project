import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { PencilRuler } from "lucide-react"

import { db } from "@/lib/db"
import { IconBadge } from "@/components/icon-badge"
import { Banner } from "@/components/banner"

import { TitleForm } from "./_components/title-form"
import { DescriptionForm } from "./_components/description-form"
import { Actions } from "./_components/actions"

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth()

  if (!userId) {
    return redirect("/")
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: {
          position: "asc",
        },
      },
      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  })

  if (!course) {
    return redirect("/")
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    // course.price,
    course.categoryId,
    // course.chapters.some((chapter) => chapter.isPublished),
  ]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is unpublished. It will not be visible to the students." />
      )}
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <PencilRuler />
              <h1 className="text-2xl font-medium">Quiz</h1>
            </div>
            {/* <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span> */}
          </div>
          {/* <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.isPublished}
          /> */}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="grid grid-cols-1 col-span-2 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <TitleForm initialData={course} courseId={course.id} />
              <DescriptionForm initialData={course} courseId={course.id} />
            </div>
            
          </div>
          
        </div>
      </div>
    </>
  )
}

export default CourseIdPage
