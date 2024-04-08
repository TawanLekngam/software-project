"use client"

import React, { useState } from "react"
import { Course, Chapter } from "@prisma/client"
import { ChapterTitleForm } from "./chapter-title-form"
import { ChapterCarousel } from "./chapter-carousel"

interface ChapterNavbarProps {
  course: Course & {
    chapters: Chapter[]
  }
  initialChapterIndex: number // Add a prop for the initial chapter index
}

export const ChapterNavbar = ({
  course,
  initialChapterIndex,
}: ChapterNavbarProps) => {
  const [selectedChapterIndex, setSelectedChapterIndex] =
    useState(initialChapterIndex)

  const handleChapterChange = (index: number) => {
    setSelectedChapterIndex(index)
  }

  return (
    <div className="flex-col w-full justify-center pr-12 pt-4">
      <div className="mx-auto flex flex-wrap justify-center">
        <ChapterCarousel
          course={course}
          onSelectChapter={handleChapterChange}
          selectedChapterIndex={selectedChapterIndex}
        />
      </div>
      <div className="flex max-w-[720px] justify-between mx-auto pt-6 pb-4">
        {course.chapters.length > 0 ? (
          <ChapterTitleForm
            initialData={{
              title: course.chapters[selectedChapterIndex]?.title,
            }}
            courseId={course.id}
            chapterId={course.chapters[selectedChapterIndex]?.id}
          />
        ) : (
          <p>No chapters created</p>
        )}
      </div>
    </div>
  )
}

export default ChapterNavbar
