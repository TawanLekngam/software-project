"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Pencil } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface QuizTitleFormProps {
  initialData: {
    title: string
  }
  courseId: string
  chapterId: string
  questionsetId: string
}

const formSchema = z.object({
  title: z.string().min(1),
})

export const QuizTitleForm = ({
  initialData,
  courseId,
  chapterId,
  questionsetId,
}: 
QuizTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const toggleEdit = () => setIsEditing((current) => !current)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    try {
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
      {!isEditing && (<div className="font-medium flex justify-between">
        {initialData.title}
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Advanced web development quiz'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                onClick={toggleEdit}
                variant="underline"
                size="ghost"
                className={isEditing ? "flex" : "hidden"}
              >
                Cancel
              </Button>
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                size="sm_l"
                variant="primary"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}