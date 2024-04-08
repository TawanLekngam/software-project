"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

import { Menu } from "lucide-react"
import AITeach from "../public/aiteach.svg"

import { cn } from "@/lib/utils"

export const Navbar = () => {
  const [navbar, setNavbar] = useState(false)
  const [state, setState] = useState("home")

  return (
    <nav className="sticky top-0 z-10 w-full bg-white shadow">
      <div className="mx-auto px-8 py-5 md:flex md:items-center lg:max-w-7xl">
        <div className="flex md:grow">
          <Link href="/" className="grow">
            <Image className="h-10" src={AITeach} alt={"AITeach"} />
          </Link>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setNavbar(!navbar)}>
              <Menu className="w-8" />
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div
          className={`py-4 md:flex md:justify-center md:py-0 ${
            navbar ? "block" : "hidden"
          }`}
        >
          <ul className="justify-center space-y-6 text-center items-center flex flex-col md:flex-row md:space-x-10 md:space-y-0 ">
            <Link href="/">
              <li className={cn("text-base font-semibold hover:text-[#4F46E5] hover:underline hover:underline-offset-4 hover:decoration-2", (state == "home") && "text-[#4F46E5] underline underline-offset-4 decoration-2")} onClick={(e) => setState("home")}>
                Home
              </li>
            </Link>
            <Link href="/profile">
              <li className={cn("text-base font-semibold hover:text-[#4F46E5] hover:underline hover:underline-offset-4 hover:decoration-2", (state == "profile") && "text-[#4F46E5] underline underline-offset-4 decoration-2")} onClick={(e) => setState("profile")}>
                Profile
              </li>
            </Link>
            <Link href="/explore">
              <li className={cn("text-base font-semibold hover:text-[#4F46E5] hover:underline hover:underline-offset-4 hover:decoration-2", (state == "explore") && "text-[#4F46E5] underline underline-offset-4 decoration-2")} onClick={(e) => setState("explore")}>
                Explore
              </li>
            </Link>
            <Link href="/teacher/courses">
              <li className={cn("text-base font-semibold hover:text-[#4F46E5] hover:underline hover:underline-offset-4 hover:decoration-2", (state == "instructor") && "text-[#4F46E5] underline underline-offset-4 decoration-2")} onClick={(e) => setState("instructor")}>
                Instructor
              </li>
            </Link>
            <Link href="/learning">
              <li className={cn("text-base font-semibold hover:text-[#4F46E5] hover:underline hover:underline-offset-4 hover:decoration-2", (state == "learning") && "text-[#4F46E5] underline underline-offset-4 decoration-2")} onClick={(e) => setState("learning")}>
                My learning
              </li>
            </Link>

            <div className="hidden md:block">
              <UserButton afterSignOutUrl="/" />
            </div>
          </ul>
        </div>
      </div>
    </nav>
  )
}
