"use client"

import axios from "axios"
import toast from "react-hot-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Pencil } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Flashcarddeck } from "@prisma/client"

interface FlashcarddeckTitleFormProps {
  initialData: Flashcarddeck
  courseId: string
  chapterId: string
  flashcarddeckId: string
}

export const FlashcarddeckTitleForm = ({
  initialData,
  courseId,
  chapterId,
  flashcarddeckId,
}: FlashcarddeckTitleFormProps) => {
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
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}`,
        value
      )
      toast.success("Flashcard deck updated")
      toggleEdit()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="border bg-slate-100 rounded-md p-6 flex flex-col gap-4">
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
            placeholder="flashcard deck title"
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
