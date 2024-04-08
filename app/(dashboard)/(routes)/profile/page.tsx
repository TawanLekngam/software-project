import { auth, currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { CheckCircle, Clock } from "lucide-react"

import { getDashboardCourses } from "@/actions/get-dashboard-courses"
import { getCoursesForInstructor } from "@/actions/get-courses-for-instuctor"

import { InfoCard } from "./_components/info-card"
import { ProfileHero } from "./_components/profile-hero"
import { Toggle } from "./_components/toggle"


import { db } from "@/lib/db"


export default async function Dashboard() {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId || !user) {
    return redirect("/")
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  )

  const teachingCourses = await getCoursesForInstructor({
    userId,
    isPublished: undefined,
  })

  const userProfile = await db.userProfile.findUnique({
    where: {
      userId,
    },
  })

  return (
    <>
      <section className="flex flex-col-reverse items-center bg-[#F3F4F4] justify-center px-12 py-24 gap-4 lg:gap-14 lg:flex-row">
        <ProfileHero initialData={userProfile} firstName={user?.firstName} lastName={user?.lastName} pic={user?.imageUrl} />
      </section>
      <section className="flex flex-col justify-center items-center px-12 py-20 gap-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-4/5 max-w-4xl">
          <InfoCard
            icon={Clock}
            label="In Progress"
            numberOfItems={coursesInProgress.length}
          />
          <InfoCard
            icon={CheckCircle}
            label="Completed"
            numberOfItems={completedCourses.length}
            variant="success"
          />
        </div>
        <Toggle
          enrollCourses={[...coursesInProgress, ...completedCourses]}
          teachingCourses={teachingCourses}
        />
      </section>
    </>
  )
}
