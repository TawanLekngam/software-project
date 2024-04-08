"use client"

import { UserProfile } from "@prisma/client"

import { Pencil } from "lucide-react"
import Profile from "../_components/user.svg"

import { cn } from "@/lib/utils"
import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ProfileHeroProps {
  initialData: UserProfile | null
  firstName: string | null
  lastName: string | null
  pic: string | null
}

export const ProfileHero = ({
  initialData,
  firstName,
  lastName,
  pic,
}: ProfileHeroProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const toggleEdit = () => setIsEditing((current) => !current)
  const [data, setData] = useState<UserProfile | null>(initialData)
  const [description, setDescription] = useState(data?.description)

  const router = useRouter()

  const handleCancel = () => {
    setDescription(data?.description)
    toggleEdit()
  }

  const handleSave = async (description: any) => {
    try {
      let value = {
        description: description,
      }
      toast.loading("Updating profile...")
      await axios.patch(`/api/user/${data?.userId}`, value)
      toast.dismiss()
      toast.success("Profile updated")
      router.refresh()
    } catch {
      toast.dismiss()
      toast.error("Something went wrong")
    }
    toggleEdit()
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 justify-center items-center lg:items-start ">
      <div className="w-[200px] h-[200px]">
        <img
          className="rounded-full w-full h-full object-cover"
          src={pic ? pic : Profile}
          alt={"Profile"}
        />
      </div>
      <div className="flex flex-col items-center lg:items-start gap-4 max-w-[600px] lg:max-w-none lg:w-[600px]">
        <h1 className="text-[32px] font-extrabold text-primary">
          {firstName} {lastName}
        </h1>
        {!isEditing && (
          <>
            <p
              className={cn(
                "text-center lg:text-left",
                !description && "text-slate-500 italic"
              )}
            >
              {description || "Write your description"}
            </p>
            <Button onClick={toggleEdit} variant="underline" size="ghost">
              <Pencil className="h-4 w-4 mr-1" />
              Edit Card
            </Button>
          </>
        )}
        {isEditing && (
          <>
            <Textarea
              placeholder="Write your description"
              value={description ? description : ""}
              onChange={(e) => setDescription(e.target.value)}
              className="h-full text-left min-w-[350px] md:min-w-[600px]"
            />
            <div className="flex justify-end w-full gap-4">
              <Button
                onClick={(e) => handleCancel()}
                variant="underline"
                size="ghost"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm_l"
                onClick={(e) => handleSave(description)}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
