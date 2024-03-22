"use client";

import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Flashcard } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FlashcardFormProps {
  initialData: Flashcard[];
  courseId: string;
  chapterId: string;
  flashcarddeckId: string;
}

export const FlashcardForm = ({
  initialData,
  courseId,
  chapterId,
  flashcarddeckId,
}: FlashcardFormProps) => {
  const [cards, setCards] = useState(initialData);
  const [clickedCard, setClickedCard] = useState(0);
  const [front, setFront] = useState(cards[clickedCard]?.front || null);
  const [back, setBack] = useState(cards[clickedCard]?.back || null);
  const [isEditing, setIsEditing] = useState(false);

  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const handleFlashcardAdd = async () => {
    let newCard;
    try {
      let result = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard`
      );
      toast.success("Flashcard created");
      newCard = await result.data;
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
    setCards([...cards, newCard]);
    setClickedCard(cards.length);
    console.log(newCard.front, newCard.back);
    setFront(newCard.front);
    setBack(newCard.back);
  };

  const handleFlashcardCancel = () => {
    setFront(cards[clickedCard].front);
    setBack(cards[clickedCard].back);
    toggleEdit();
  };

  const handleFlashcardSave = async (index: number, front: any, back: any) => {
    try {
      let value = {
        front: front,
        back: back,
      };
      let flashcardId = cards[index].id;
      let result = await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard/${flashcardId}`,
        value
      );
      setCards((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index] = result.data;
        return updatedItems;
      });
      toast.success("Flashcard updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleFlashcardRemove = async (index: number) => {
    try {
      let flashcardId = cards[index].id;
      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/flashcarddecks/${flashcarddeckId}/flashcard/${flashcardId}`
      );
      toast.success("Flashcard deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
    const items = [...cards];
    items.splice(index, 1);

    setCards(items);
    items.length == 0
      ? console.log("No cards")
      : index == items.length
      ? (setFront(cards[clickedCard - 1].front!),
        setBack(cards[clickedCard - 1].back!),
        setClickedCard(clickedCard - 1))
      : (setFront(cards[clickedCard + 1].front!),
        setBack(cards[clickedCard + 1].back!));
  };

  return (
    <div className="flex flex-col-reverse items-center lg:items-start gap-8 lg:flex-row">
      <div className="flex flex-col gap-4 w-full max-w-sm lg:max-w-xs">
        <div className="flex flex-row justify-between">
          <h3 className="text-lg font-medium">Card list</h3>
          <Button
            variant="underline"
            size="ghost"
            onClick={handleFlashcardAdd}
            disabled={
              (cards.length == 1 && front == null && back == null) || isEditing
            }
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
        <div className="p-4 flex flex-col gap-4 overflow-y-scroll w-full h-[384px] rounded-md border">
          {cards.length != 0 &&
            cards.map((card, index) => (
              <>
                <button
                  key={index}
                  // disabled={isEditing}
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
                        setBack(cards[index].back!));
                  }}
                >
                  {card.front || card.back || "New card"}
                </button>
              </>
            ))}
          {cards.length == 0 && (
            <div className="text-lg text-center pt-4 text-slate-500 italic">
              Card list is empty
            </div>
          )}
        </div>
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
                  <div className="bg-white border-[#80489C] w-full max-w-[440px] h-[280px] border-4 rounded-md px-8 pt-6 pb-8">
                    <>
                      <TabsContent value="front" className="w-full h-full">
                        <div
                          className={cn(
                            "text-2xl font-medium text-center place-content-center grid overflow-y-auto h-[208px]",
                            !(front != null) && "text-lg text-slate-500 italic"
                          )}
                        >
                          {front || "No front side description"}
                        </div>
                      </TabsContent>
                      <TabsContent value="back" className="w-full">
                        <div
                          className={cn(
                            "text-lg font-medium text-center place-content-center grid overflow-y-auto h-[208px]",
                            !(back != null) && "text-lg text-slate-500 italic"
                          )}
                        >
                          {back || "No back side description"}
                        </div>
                      </TabsContent>
                    </>
                  </div>
                  <div className="flex flex-row w-full gap-4">
                    <Button
                      disabled={
                        cards.length == 1 && front == null && back == null
                      }
                      variant="warning"
                      size="rectangle"
                      onClick={(e) => handleFlashcardRemove(clickedCard)}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={toggleEdit}
                      variant="primary"
                      size="rectangle"
                    >
                      Edit
                    </Button>
                  </div>
                </>
              )}
              {isEditing && (
                <>
                  <div className="bg-white border-[#80489C] h-[280px] w-full max-w-[440px] border-4 rounded-md px-6 pt-4 pb-8">
                    <TabsContent value="front" className="w-full h-full">
                      <Textarea
                        // disabled={isSubmitting}
                        placeholder="e.g. 'Flash card'"
                        value={front ? front : ""}
                        onChange={(e) => setFront(e.target.value)}
                        className="h-full text-center text-2xl"
                      />
                    </TabsContent>
                    <TabsContent value="back" className="w-full h-full">
                      <Textarea
                        // disabled={isSubmitting}
                        placeholder="e.g. 'Flash card'"
                        value={back ? back : ""}
                        onChange={(e) => setBack(e.target.value)}
                        className="h-full text-center text-lg"
                      />
                    </TabsContent>
                  </div>

                  <div className="flex flex-row w-full gap-4">
                    <Button
                      onClick={(e) => handleFlashcardCancel()}
                      variant="cancel"
                      size="rectangle"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        cards[clickedCard].front == front &&
                        cards[clickedCard].back == back
                      }
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
  );
};
