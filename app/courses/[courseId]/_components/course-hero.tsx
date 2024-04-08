"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Course } from "@prisma/client"
import Link from "next/link"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface CourseHeroProps {
  course: Course
  userId: string | null
  enroll: string | null
}

const CourseHero = ({ course, userId, enroll }: CourseHeroProps) => {
  const router = useRouter()

  const onEnroll = async (value: string) => {
    try {
      await axios.post(`/api/courses/${course.id}/checkout`)
      toast.success("Course enrolled")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }
  return (
    <div>
      <div className="flex flex-col w-screen items-center justify-center px-12 py-12 lg:flex-row bg-white">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-6 lg:items-start">
            <div className="w-[270px] h-[200px]">
              <img
                src={course.imageUrl ?? "./_componets/default.svg"}
                alt={"${course.title} Image"}
                className="rounded-xl w-full h-full object-cover "
                // width={200}
                // height={200}
              />
            </div>
            <div className="flex flex-col gap-5 items-center justify-center lg:items-start h-full">
              <h1 className="text-xl font-extrabold text-blue md:text-2xl">
                {course.title}
              </h1>
              <p className="text-sm font-medium text-center lg:max-w-[720px] lg:text-base lg:text-start">
                {course.description!}
              </p>
            </div>
          </div>
          <div className="w-full flex grid-row-2 gap-5 justify-center lg:justify-end">
            {userId === course.userId && (
              <Link href={`/teacher/edit/${course.id}`}>
                <Button variant="outline">Edit Course</Button>
              </Link>
            )}
            {course.isPublished && userId != course.userId ? ( // Check if course is published
              enroll === userId ? ( // Check if user is already enrolled
                <Button variant="primary" disabled>
                  Already Enrolled
                </Button>
              ) : (
                <Button variant="primary" onClick={() => onEnroll(userId!)}>
                  Enroll Course
                </Button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseHero
