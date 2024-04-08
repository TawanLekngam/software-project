"use client"

import axios from "axios"
import { PlusCircle, Pencil } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Flashcard } from "@prisma/client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface FlashcardFormProps {
  initialData: Flashcard[]
  courseId: string
  chapterId: string
  flashcarddeckId: string
}

export const FlashcardForm = ({
  initialData,
  courseId,
  chapterId,
  flashcarddeckId,
}: FlashcardFormProps) => {
  const [cards, setCards] = useState(initialData)
  const [clickedCard, setClickedCard] = useState(0)
  const [front, setFront] = useState(cards[clickedCard]?.front || null)
  const [back, setBack] = useState(cards[clickedCard]?.back || null)
  const [isEditing, setIsEditing] = useState(false)

  const [keyword, setKeyword] = useState("")
  const [open, setOpen] = useState(false)

  const router = useRouter()

  const toggleEdit = () => setIsEditing((current) => !current)

  const createFlashcard = async (keyword: string) => {
    try {
      let value = {
        message: keyword,
      }
      let result = await axios.post(`/api/chat-ai/flashcard`, value)
      console.log("back", result.data.back, "front", result.data.front)

      setOpen(false)
      setKeyword("")
      await handleFlashcardAdd(result.data.front, result.data.back)
    } catch {
      toast.error("Something went wrong")
    }
  }

  const handleFlashcardAdd = async (front: any, back: any) => {
    let newCard
    let value = {
      front: front,
      back: back,
    }
    try {
      toast.loading("Creating card...")
      let result = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard`,
        value
      )
      toast.dismiss()
      toast.success("Flashcard created")
      newCard = await result.data
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
    setCards([newCard, ...cards])
    setClickedCard(0)
    setFront(newCard.front)
    setBack(newCard.back)
  }

  const handleFlashcardCancel = () => {
    setFront(cards[clickedCard].front)
    setBack(cards[clickedCard].back)
    toggleEdit()
  }

  const handleFlashcardSave = async (index: number, front: any, back: any) => {
    try {
      let value = {
        front: front,
        back: back,
      }
      toast.loading("Updating card...")
      let flashcardId = cards[index].id
      let result = await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard/${flashcardId}`,
        value
      )
      setCards((prevItems) => {
        const updatedItems = [...prevItems]
        updatedItems[index] = result.data
        return updatedItems
      })
      toast.dismiss()
      toast.success("Flashcard updated")
      toggleEdit()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  const handleFlashcardRemove = async (index: number) => {
    try {
      toast.loading("Deleting card...")
      let flashcardId = cards[index].id
      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard/${flashcardId}`
      )
      toast.dismiss()
      toast.success("Flashcard deleted")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
    const items = [...cards]
    items.splice(index, 1)

    toggleEdit()

    setCards(items)
    items.length == 0
      ? console.log("No cards")
      : index == items.length
      ? (setFront(cards[clickedCard - 1].front!),
        setBack(cards[clickedCard - 1].back!),
        setClickedCard(clickedCard - 1))
      : (setFront(cards[clickedCard + 1].front!),
        setBack(cards[clickedCard + 1].back!))
  }

  return (
    <div className="flex flex-col-reverse items-center lg:items-start gap-8 lg:flex-row">
      <div className="flex flex-col gap-4 w-full max-w-sm lg:max-w-xs">
        <hr className="lg:hidden mb-2 border-t-2 rounded-md border-gray-200" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" disabled={isEditing}>
              Create with Keyword by AI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="gap-2 pt-2">
              <DialogTitle>Create new flash card by AI</DialogTitle>
              <DialogDescription>
                Write a keyword to create a new flash card
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="name" className="text-left">
                Keyword
              </Label>
              <Input
                id="name"
                placeholder="e.g. 'Keyword'"
                className="col-span-3"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="primary"
                size="sm_l"
                onClick={(e) => createFlashcard(keyword)}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex flex-row justify-between">
          <h3 className="text-lg font-medium">Card list</h3>
          <Button
            variant="underline"
            size="ghost"
            onClick={(e) => handleFlashcardAdd(null, null)}
            disabled={isEditing}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
        <ScrollArea className="h-[384px] rounded-md border">
          <div className="p-4 flex flex-col gap-4  w-full ">
            {cards.length != 0 &&
              cards.map((card, index) => (
                <>
                  <button
                    key={index}
                    className={`font-medium p-4 h-[56px] rounded-md ${
                      clickedCard === index
                        ? "bg-[#80489C]/90 text-white"
                        : "bg-slate-200"
                    } ${
                      card.front || card.back
                        ? "text-black"
                        : "text-slate-500 italic"
                    }`}
                    onClick={(e) => {
                      isEditing
                        ? toast.error("Flashcard has not been saved")
                        : (setClickedCard(index),
                          setFront(cards[index].front!),
                          setBack(cards[index].back!))
                    }}
                  >
                    {card.front
                      ? card.front.length > 30
                        ? card.front.slice(0, 30) + "..."
                        : card.front
                      : card.back
                      ? card.back.length > 30
                        ? card.back.slice(0, 30) + "..."
                        : card.back
                      : "New Card"}
                  </button>
                </>
              ))}
            {cards.length == 0 && (
              <div className="text-lg text-center pt-4 text-slate-500 italic">
                Card list is empty
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      {cards.length != 0 && (
        <div className="flex w-full justify-center ">
          <Tabs
            defaultValue="front"
            className="w-full max-w-sm lg:max-w-md flex flex-col items-center gap-4"
          >
            <TabsList className="grid grid-cols-2 h-[44px] w-full mb-4">
              <TabsTrigger value="front" className="h-full">
                Front side
              </TabsTrigger>
              <TabsTrigger value="back" className="h-full">
                Back side
              </TabsTrigger>
            </TabsList>
            <>
              {!isEditing && (
                <>
                  <Button
                    onClick={toggleEdit}
                    variant="underline"
                    size="ghost"
                    className={isEditing ? "hidden" : "flex"}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit Card
                  </Button>
                  <div className="w-full max-w-[440px] h-[280px]">
                    <TabsContent
                      value="front"
                      className="w-full bg-white border-[#4F46E5] border-4 h-full rounded-md px-8 pt-6 pb-8"
                    >
                      <div
                        className={cn(
                          "text-2xl font-medium text-center place-content-center grid overflow-y-auto h-[208px]",
                          !(front != null && front != "") &&
                            "text-lg text-slate-500 italic"
                        )}
                      >
                        {front != null && front != ""
                          ? front
                          : "No front side description"}
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="back"
                      className="w-full h-full bg-white border-[#80489C] border-4 rounded-md px-8 pt-6 pb-8 "
                    >
                      <div
                        className={cn(
                          "text-lg font-medium text-center place-content-center grid overflow-y-auto h-[208px]",
                          !(back != null && back != "") &&
                            "text-lg text-slate-500 italic"
                        )}
                      >
                        {back != null && back != ""
                          ? back
                          : "No back side description"}
                      </div>
                    </TabsContent>
                  </div>
                </>
              )}
              {isEditing && (
                <>
                  <div className=" h-[280px] w-full max-w-[440px] mb-4">
                    <TabsContent
                      value="front"
                      className="w-full h-full bg-white border-[#4F46E5] border-4 rounded-md px-8 py-8 "
                    >
                      <Textarea
                        // disabled={isSubmitting}
                        placeholder="e.g. 'Flash card'"
                        value={front ? front : ""}
                        onChange={(e) => setFront(e.target.value)}
                        className="h-full text-center text-2xl"
                      />
                    </TabsContent>
                    <TabsContent
                      value="back"
                      className="w-full h-full bg-white border-[#80489C] border-4 rounded-md px-8 py-8 "
                    >
                      <Textarea
                        // disabled={isSubmitting}
                        placeholder="e.g. 'Flash card'"
                        value={back ? back : ""}
                        onChange={(e) => setBack(e.target.value)}
                        className="h-full text-center text-lg"
                      />
                    </TabsContent>
                  </div>
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-row w-full gap-4">
                      <Button
                        variant="warning"
                        size="rectangle"
                        onClick={(e) => handleFlashcardRemove(clickedCard)}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={(e) => handleFlashcardCancel()}
                        variant="cancel"
                        size="rectangle"
                      >
                        Cancel
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="rectangle"
                      onClick={(e) =>
                        handleFlashcardSave(clickedCard, front, back)
                      }
                    >
                      Save
                    </Button>
                  </div>
                </>
              )}
            </>
          </Tabs>
        </div>
      )}
    </div>
  )
}
