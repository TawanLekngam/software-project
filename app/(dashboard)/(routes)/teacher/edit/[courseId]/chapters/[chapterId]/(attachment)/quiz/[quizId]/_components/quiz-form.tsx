"use client"

import axios from "axios"
import { useState, SetStateAction } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Question, Answer } from "@prisma/client"

import { PlusCircle, Pencil } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import React from "react"

interface QuizFormProps {
  initialData: (Question & { answers: Answer[] })[]
  courseId: string
  chapterId: string
  questionsetId: string
}

export const QuizForm = ({
  initialData,
  courseId,
  chapterId,
  questionsetId,
}: QuizFormProps) => {
  const [data, setData] = useState(initialData)
  const [questions, setQuestions] = useState<
    (Question & { answers: Answer[] })[]
  >(JSON.parse(JSON.stringify(data)))
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(questions.length != 0 ? 1 : 0)
  const [count, setCount] = useState(questions.length)

  const [isEditing, setIsEditing] = useState(false)
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("5")
  )
  const [selectedValue, setSelectedValue] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")

  const [keyword, setKeyword] = useState("")
  const [openK, setOpenK] = useState(false)
  const [openD, setOpenD] = useState(false)

  const router = useRouter()

  const toggleEdit = () => setIsEditing((current) => !current)

  const handleRadioChange = (event: {
    target: { value: SetStateAction<string> }
  }) => {
    setSelectedValue(event.target.value)
  }

  const move = () => {
    setSelectedValue(api ? answers[api.selectedScrollSnap()] : "5")
    setCorrectAnswer(api ? answers[api.selectedScrollSnap()] : "5")
  }

  const updateQuestion = (index: number, newValue: string) => {
    setQuestions((prevItems: (Question & { answers: Answer[] })[]) => {
      const updatedItems: (Question & { answers: Answer[] })[] = [...prevItems]
      updatedItems[index].text = newValue
      return updatedItems
    })
  }

  const updateAnswerAtIndex = (
    indexQ: number,
    indexA: number,
    newValue: string
  ) => {
    setQuestions((prevItems: (Question & { answers: Answer[] })[]) => {
      const updatedItems: (Question & { answers: Answer[] })[] = [...prevItems]
      updatedItems[indexQ].answers[indexA].text = newValue
      return updatedItems
    })
  }

  const onCancel = (index: number) => {
    setQuestions((prevItems: (Question & { answers: Answer[] })[]) => {
      const updatedItems: (Question & { answers: Answer[] })[] = [...prevItems]
      console.log(data)
      updatedItems[index] = JSON.parse(JSON.stringify(data[index]))
      return updatedItems
    })
    setSelectedValue(correctAnswer)
    toggleEdit()
  }

  const createQuestionFromKeyword = async (keyword: string) => {
    try {
      let value = {
        message: keyword,
      }
      let result = await axios.post(`/api/chat-ai/question`, value)

      setOpenK(false)
      setKeyword("")
      await handleQuestionAdd(result.data.question, result.data.answers)
    } catch {
      toast.error("Something went wrong")
    }
  }

  const handleQuestionAdd = async (question: any, answerSet: any) => {
    let newQuestion
    let result
    let valueQ = {
      question: question,
    }

    try {
      toast.loading("Creating question...")
      result = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}/questions`,
        valueQ
      )
      // console.log(values.answers)
      newQuestion = await result.data
      for (let i = 0; i < 4; i++) {
        let valueA = {
          text: answerSet ? answerSet[i].text : null,
          isCorrect: answerSet ? answerSet[i].isCorrect : false,
        }

        let answer = await axios.post(
          `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}/questions/${newQuestion.id}/answers`,
          valueA
        )
        newQuestion.answers.push(await answer.data)
      }
      toast.dismiss()
      toast.success("Question created")

      setQuestions([newQuestion, ...questions])
      setData([newQuestion, ...questions])
      setCount(count + 1)
      answerSet
        ? (setAnswers(["0", ...answers]),
          setSelectedValue("0"),
          setCorrectAnswer("0"))
        : (setAnswers(["5", ...answers]),
          setSelectedValue("5"),
          setCorrectAnswer("5"))
      api?.scrollTo(0)

      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  const handleQuestionRemove = async (index: number) => {
    try {
      toast.loading("Deleting question...")
      let questionId = questions[index].id

      await axios.delete(
        `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}/questions/${questionId}`
      )
      toast.dismiss()
      toast.success("Question deleted")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
    questions.splice(index, 1)
    answers.splice(index, 1)
    setCount(questions.length)
    questions.length == 0
      ? setCurrent(0)
      : index == questions.length
      ? setCurrent(current - 1)
      : setCurrent(current)
    move()
    toggleEdit()
  }

  const handleQuestionEdit = (index: number) => {
    questions[index].answers?.map((answer: Answer, index: number) => {
      answer.isCorrect
        ? (setSelectedValue(String(index)), setCorrectAnswer(String(index)))
        : null
    })
    toggleEdit()
  }

  const onSubmit = async (index: number) => {
    let question = questions[index]
    let questionId = question.id
    try {
      toast.loading("Updating question...")
      let valueQuestion = { text: questions[index].text }
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}/questions/${questionId}`,
        valueQuestion
      )

      for (let i = 0; i < 4; i++) {
        let valueAnswer = {
          text: question.answers[i].text,
          isCorrect: i == Number(selectedValue),
        }
        {
          i == Number(selectedValue)
            ? (question.answers[i].isCorrect = true)
            : (question.answers[i].isCorrect = false)
        }
        let answerId = question.answers[i].id
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/questionset/${questionsetId}/questions/${questionId}/answers/${answerId}`,
          valueAnswer
        )
      }
      setData(JSON.parse(JSON.stringify(questions)))
      answers[index] = selectedValue
      setCorrectAnswer(selectedValue)
      toast.dismiss()
      toast.success("Question updated")
      toggleEdit()
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  React.useEffect(() => {
    if (!api) {
      return
    }
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })

    questions.map((question, index: number) => {
      question?.answers.map((answer: Answer, i: number) => {
        answer.isCorrect ? (answers[index] = String(i)) : null
      })
    })
    setSelectedValue(answers[0])
    setCorrectAnswer(answers[0])
  }, [api])

  return (
    <div className="w-4/5 flex flex-col self-center gap-8">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <h3 className="text-lg font-medium">Create Question with AI from:</h3>
        <div className="flex flex-row gap-4">
          <Dialog open={openK} onOpenChange={setOpenK}>
            <DialogTrigger asChild>
              <Button variant="cancel" disabled={isEditing}>
                Keyword
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="gap-2 pt-2">
                <DialogTitle>Create Question with AI</DialogTitle>
                <DialogDescription>
                  Write a keyword to create a new question
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
                  onClick={(e) => createQuestionFromKeyword(keyword)}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={openD} onOpenChange={setOpenD}>
            <DialogTrigger asChild>
              <Button variant="cancel" disabled={isEditing}>
                Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className="gap-2 pt-2">
                <DialogTitle>Create Question with AI</DialogTitle>
                <DialogDescription>
                  Choose a document to create a new question
                </DialogDescription>
              </DialogHeader>
              {/* <div className="grid gap-4 py-4">
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
              </div> */}
              <DialogFooter>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm_l"
                  // onClick={(e) => createFlashcard(keyword)}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex flex-col gap-4 justify-between md:grid md:grid-cols-3">
        <div className="text-center text-xl col-start-1 md:col-start-2">
          Question {current} of {count}
        </div>
        <Button
          onClick={(e) => handleQuestionAdd(null, null)}
          variant="underline"
          size="ghost"
          className="justify-self-end col-start-3"
          disabled={isEditing}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add new question
        </Button>
      </div>
      {questions.length != 0 && (
        <Carousel setApi={setApi} className="w-full ">
          <CarouselContent>
            {questions.map((question, index: number) => (
              <CarouselItem key={index}>
                <div className="flex flex-col gap-4">
                  <div className="border bg-slate-100 rounded-md p-6 flex flex-col gap-4">
                    <div className="font-medium flex justify-between">
                      Question
                      <Button
                        onClick={(e) => handleQuestionEdit(index)}
                        variant="underline"
                        size="ghost"
                        className={isEditing ? "hidden" : "flex"}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit question
                      </Button>
                    </div>

                    {!isEditing && (
                      <>
                        <section className="flex flex-col gap-4">
                          <p
                            className={cn(
                              "text-sm",
                              !question?.text && "text-slate-500 italic"
                            )}
                          >
                            {question?.text || "No question"}
                          </p>
                          <div className="font-medium flex justify-between">
                            Answer
                          </div>
                          <RadioGroup
                            className="flex flex-col space-y-3"
                            disabled={true}
                          >
                            {question?.answers.map((answer: Answer, i: any) => (
                              <div className="flex flex-row items-center space-x-3 space-y-0">
                                <RadioGroupItem
                                  value={i}
                                  checked={selectedValue === i.toString()}
                                />
                                <p
                                  className={cn(
                                    "text-sm",
                                    !answer.text && "text-slate-500 italic"
                                  )}
                                >
                                  {answer.text || "No answer"}
                                </p>
                              </div>
                            ))}
                          </RadioGroup>
                        </section>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <section className="flex flex-col gap-4">
                          <Textarea
                            placeholder="e.g. 'Question... ?'"
                            value={question?.text || ""}
                            onChange={(e) =>
                              updateQuestion(index, e.target.value)
                            }
                          />
                          <div className="font-medium flex justify-between">
                            Answer
                          </div>
                          <div className="flex flex-col space-y-1">
                            {question.answers.map((answer: Answer, i: any) => (
                              <div className="flex items-center space-x-3 space-y-0">
                                <input
                                  type="radio"
                                  id={i}
                                  value={i}
                                  checked={selectedValue === i.toString()}
                                  onChange={handleRadioChange}
                                />
                                <Input
                                  placeholder={`e.g. 'Choice ${i + 1}'`}
                                  value={answer?.text || ""}
                                  onChange={(e) =>
                                    updateAnswerAtIndex(
                                      index,
                                      i,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </section>

                        <div className="flex flex-row justify-between pt-4">
                          <Button
                            variant="warning"
                            size="sm_l"
                            onClick={(e) => handleQuestionRemove(index)}
                          >
                            Delete
                          </Button>
                          <div className="flex justify-end gap-4">
                            <Button
                              variant="underline"
                              size="ghost"
                              onClick={(e) => onCancel(index)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm_l"
                              variant="primary"
                              onClick={(e) => onSubmit(index)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            disabled={isEditing || !api?.canScrollPrev()}
            onClick={(e) => (api?.scrollPrev(), move())}
          />
          <CarouselNext
            disabled={isEditing || !api?.canScrollNext()}
            onClick={(e) => (api?.scrollNext(), move())}
          />
        </Carousel>
      )}
    </div>
  )
}
