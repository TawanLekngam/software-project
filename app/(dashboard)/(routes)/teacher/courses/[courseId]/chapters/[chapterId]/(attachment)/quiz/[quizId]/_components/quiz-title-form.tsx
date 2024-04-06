"use client"

import axios from "axios"

import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Pencil } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { QuestionSet } from "@prisma/client"

interface QuizTitleFormProps {
  initialData: QuestionSet
  courseId: string
  chapterId: string
  questionsetId: string
}

export const QuizTitleForm = ({
  initialData,
  courseId,
  chapterId,
  questionsetId,
}: QuizTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialData.title)

  const toggleEdit = () => setIsEditing((current) => !current)

  const router = useRouter()

  const onCancel = () => {
    setTitle(initialData.title)
    toggleEdit()
  }

  const onSubmit = async (newTitle: string) => {
    try {
      let value = {
        title: newTitle,
      }
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}`,
        value
      )
      toast.success("Question set updated")
      toggleEdit()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="border bg-slate-100 rounded-md p-6 flex flex-col gap-4 w-full">
      {!isEditing && (
        <div className="font-medium flex justify-between">
          {title}
          <Button
            onClick={toggleEdit}
            variant="underline"
            size="ghost"
            className={isEditing ? "hidden" : "flex"}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit title
          </Button>
        </div>
      )}
      {isEditing && (
        <>
          <Input
            placeholder="e.g. 'Advanced web development quiz'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex justify-end gap-4">
            <Button
              onClick={(e) =>
                onCancel()
              }
              variant="underline"
              size="ghost"
              className={isEditing ? "flex" : "hidden"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm_l"
              variant="primary"
              onClick={(e) =>
                onSubmit(title)
              }
            >
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
