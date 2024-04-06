import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { CheckCircle, Clock } from "lucide-react"

import Image from "next/image"
import HeroPic from "./_components/hero.svg"
import Levelup from "./_components/levelup.svg"
import Feedback from "./_components/feedback.svg"
import Quiz from "./_components/quiz.svg"

import { Slider } from "@/components/slider"

import { db } from "@/lib/db"
import { getRecommendCourses } from "@/actions/get-recommended-course"
import { ChapterBox } from "@/app/courses/[courseId]/chapters/[chapterId]/_components/chapter-box"

export default async function Dashboard() {
  const { userId } = auth()

  if (!userId) {
    return redirect("/")
  }

  const courses = await getRecommendCourses({
    userId,
  })

  return (
    <>
      <section className="flex flex-col-reverse items-center bg-[#F3F4F4] justify-center px-4 py-24 gap-4 lg:gap-14 lg:flex-row">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-[32px] text-[#4F46E5] font-extrabold">
            AI TEACH
          </h1>
          <h2 className="text-2xl font-medium">
            Explore course and level up your skill
          </h2>
        </div>
        <div className="max-w-xs xl:max-w-md">
          <Image src={HeroPic} alt={"Hero Pic"} />
        </div>
      </section>

      <section className="flex flex-col items-center justify-center px-24 py-16 gap-12">
        <h1 className="text-[32px] text-[#4F46E5] font-extrabold text-center">
          Recommended Course
        </h1>
        <Slider items={courses} />
      </section>

      <section className="flex flex-col items-center justify-center bg-[#F3F4F4] px-24 py-20 gap-12">
        <h1 className="text-[32px] text-[#4F46E5] font-extrabold text-center">
          Our Platform
        </h1>
        <div className="grid grid-cols-1 gap-12 lg:gap-y-16 lg:grid-cols-4 lg:gap-x-32 xl:max-w-7xl xl:grid-cols-6 xl:gap-16 2xl:gap-28">
          <div className="xl:grid-col items-center gap-8 hidden xl:col-span-2 xl:col-start-1 xl:mt-12 xl:grid">
            <h2 className="text-2xl text-center text-[#4B4B4B] font-semibold">
              Level up your skill
            </h2>
            <Image className="w-[200px]" src={Levelup} alt={"Level up"} />
          </div>
          <div className="flex flex-col items-center gap-y-4 lg:gap-y-8 lg:col-span-2 lg:col-start-2 lg:justify-self-center xl:col-start-3">
            <h2 className="text-2xl text-center text-[#4B4B4B] font-semibold">
              Give feedback <br /> on your assignment
            </h2>
            <Image
              className="w-[160px] md:w-[200px]"
              src={Feedback}
              alt={"Feedback"}
            />
          </div>
          <div className=" xl:hidden grid grid-col items-center gap-y-4 lg:gap-y-8 lg:col-span-2">
            <h2 className="text-2xl text-center text-[#4B4B4B] font-semibold">
              Level up your skill
            </h2>
            <Image
              className="w-[160px] md:w-[200px] justify-self-center"
              src={Levelup}
              alt={"Level up"}
            />
          </div>
          <div className="grid grid-col items-center gap-y-4 lg:gap-y-8 lg:col-span-2 xl:mt-12 ">
            <h2 className="text-2xl text-center text-[#4B4B4B] font-semibold">
              Review with <br /> quiz and flashcard
            </h2>
            <Image
              className="w-[160px] md:w-[200px] justify-self-center"
              src={Quiz}
              alt={"Quiz"}
            />
          </div>
        </div>
      </section>
    </>
  )
}
