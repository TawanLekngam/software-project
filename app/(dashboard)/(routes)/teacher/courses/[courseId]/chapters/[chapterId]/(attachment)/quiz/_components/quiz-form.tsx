"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Pencil } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Course } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QuizAnswerForm } from "./quiz-answer-form"
import { quiz } from "./mock-quiz"
import { QuizQuestionForm } from "./quiz-question-form"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

import React from "react"

interface QuizFormProps {
  initialData: Course
  courseId: string
}

const formSchema = z.object({
  description: z.string().min(1),
})

export const QuizForm = ({ initialData, courseId }: QuizFormProps) => {
  const [questions, setQuestions] = useState(quiz)

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  })

  const handleQuestionAdd = () => {
    setQuestions([...questions, { question: "", choices: [] }])
  }

  const handleQuestionRemove = (index: number) => {
    const items = [...questions]
    items.splice(index, 1)
    setQuestions(items)
  }

  return (
    <>
      {/* <QuizQuestionForm initialData={initialData} courseId={courseId} /> */}
      {questions.map((question, index) => (
        <>
          <QuizAnswerForm
            key={index}
            initialData={initialData}
            courseId={courseId}
          />
          <Button
            variant="warning"
            size="default"
            onClick={(e) => handleQuestionRemove(index)}
          >
            Delete question
          </Button>
          <hr className="border-t-2 rounded-md border-gray-400" />
        </>
      ))}
      <Button
        variant="primary"
        size="default"
        onClick={(e) => handleQuestionAdd()}
      >
        Add question
      </Button>
      <div>
        <Carousel setApi={setApi} className="w-full max-w-xs">
          <CarouselContent>
            {questions.map((question, index) => (
              <CarouselItem key={index}>
                <>
                  <QuizAnswerForm
                    key={index}
                    initialData={initialData}
                    courseId={courseId}
                  />
                  <Button
                    variant="warning"
                    size="default"
                    onClick={(e) => handleQuestionRemove(index)}
                  >
                    Delete question
                  </Button>
                  <hr className="border-t-2 rounded-md border-gray-400" />
                </>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Question {current} of {count}
        </div>
      </div>
    </>
  )
}
