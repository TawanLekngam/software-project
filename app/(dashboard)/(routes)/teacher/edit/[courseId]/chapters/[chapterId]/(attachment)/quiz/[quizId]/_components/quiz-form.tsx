"use client"

import axios from "axios"
import { useState, SetStateAction } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import { Question, Answer, Document } from "@prisma/client"

import { PlusCircle, Pencil } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import pdfToText from "react-pdftotext"

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
  documents: Document[] | null
}

export const QuizForm = ({
  initialData,
  courseId,
  chapterId,
  questionsetId,
  documents,
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
  const [openDK, setOpenDK] = useState(false)

  const [clickedDocument, setClickedDocument] = useState(999)

  const router = useRouter()

  const [extractedText, setExtractedText] = useState("")
  const [num_input, setNumInput] = useState("3")

  const extractText = async (url: string) => {
    try {
      const file = await fetch(url).then((res) => res.blob())

      const text = await pdfToText(file)
      const cleanedText = text.replace(/['"`]/g, "")
      setExtractedText(cleanedText)
    } catch (error) {
      console.error("Failed to extract text:", error)
    }
  }

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
      toast.loading("Loading...")
      let value = {
        message: keyword,
      }
      let result = await axios.post(`/api/chat-ai/question`, value)
      toast.dismiss()
      setOpenK(false)
      setKeyword("")
      await handleQuestionAdd(result.data.question, result.data.answers)
    } catch {
      toast.dismiss()
      toast.error("Something went wrong")
    }
  }

  const createQuestionFromDocument = async (keyword: string, index: number) => {
    await extractText(documents![index].url)
    try {
      toast.loading("Loading...")
      let value = {
        message: keyword,
        document: extractedText,
      }
      let result = await axios.post(`/api/chat-ai/question`, value)
      toast.dismiss()
      setOpenDK(false)
      setKeyword("")
      setClickedDocument(999)
      await handleQuestionAdd(result.data.question, result.data.answers)
    } catch {
      toast.dismiss()
      toast.error("Something went wrong")
    }
  }

  const createQuestionSetFromDocument = async (num: string, index: number) => {
    await extractText(documents![index].url)
    try {
      toast.loading("Loading...")
      let value = {
        document: extractedText,
        number: num,
      }

      let result = await axios.post(`/api/chat-ai/questionset`, value)
      toast.dismiss()
      setOpenD(false)
      console.log(result.data)
      for (let i = 0; i < result.data.length; i++) {
        await handleQuestionAdd(result.data[i].question, result.data[i].answers)
      }
      router.refresh()
      setClickedDocument(999)
    } catch {
      toast.dismiss()
      toast.error("Something went wrong")
    }
  }

  const handleQuestionAdd = async (question: any, answerSet: any) => {
    let newQuestion: any
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

      setQuestions((prevItems) => ([newQuestion, ...prevItems]))
      setData((prevItems) => ([newQuestion, ...prevItems]))
      setCount((prevItems) => (prevItems+1))
      answerSet
        ? (setAnswers((prevItems) => (["0", ...prevItems])),
          setSelectedValue((prevItems) => ("0")),
          setCorrectAnswer((prevItems) => ("0")))
        : (setAnswers((prevItems) => (["0", ...prevItems])),
          setSelectedValue((prevItems) => ("5")),
          setCorrectAnswer((prevItems) => ("5")))
      api?.scrollTo(0)

      router.refresh()
    } catch {
      toast.dismiss()
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
      toast.dismiss()
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
      toast.dismiss()
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
    <div className="w-4/5 flex flex-col self-center gap-6">
      <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-medium">
            Create a Question with AI from:
          </h3>
          <div className="flex flex-row gap-4">
            <Dialog open={openK} onOpenChange={setOpenK}>
              <DialogTrigger asChild>
                <Button variant="cancel" disabled={isEditing}>
                  Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px] rounded-md">
                <DialogHeader className="gap-2 pt-2">
                  <DialogTitle>Create Question with AI</DialogTitle>
                  <DialogDescription>
                    Write a keyword to create a new question
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 pb-4">
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
            <Dialog open={openDK} onOpenChange={setOpenDK}>
              <DialogTrigger asChild>
                <Button variant="cancel" disabled={isEditing}>
                  Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px] rounded-md">
                <DialogHeader className="gap-2 pt-2">
                  <DialogTitle>Create Question with AI</DialogTitle>
                  <DialogDescription>
                    Write a keyword and choose a document to create a new
                    question
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 pb-2">
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
                <hr className="mb-2 border-t-2 rounded-md border-gray-200" />
                {documents?.map((document, i) => (
                  <button
                    key={i}
                    className={`font-medium p-4 h-[56px] rounded-md ${
                      clickedDocument === i
                        ? "bg-[#80489C]/90 text-white"
                        : "bg-slate-200"
                    }`}
                    onClick={(e) => setClickedDocument(i)}
                  >
                    {document.title}
                  </button>
                ))}
                {documents!.length > 0 ? (
                  ""
                ) : (
                  <div className="text-md text-center text-slate-500 italic">
                    No document file in this chapter
                  </div>
                )}
                <DialogFooter>
                  <Button
                    disabled={
                      keyword != "" && clickedDocument != 999 ? false : true
                    }
                    type="submit"
                    variant="primary"
                    size="sm_l"
                    onClick={(e) =>
                      createQuestionFromDocument(keyword, clickedDocument)
                    }
                    className="mt-2"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center lg:border-l-2 lg:border-gray-200 lg:ounded-md lg:mb-2 lg:pl-8">
          <h3 className="text-lg font-medium">
            Create a Question set with AI from:
          </h3>
          <Dialog open={openD} onOpenChange={setOpenD}>
            <DialogTrigger asChild>
              <Button variant="cancel" disabled={isEditing}>
                Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[425px] rounded-md">
              <DialogHeader className="gap-2 pt-2">
                <DialogTitle>Create Question set with AI</DialogTitle>
                <DialogDescription>
                  Choose a document to create a new question set
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 pb-2 items-center">
                <Label htmlFor="name" className="text-left">
                  Number of questions:
                </Label>
                <input
                  type="number"
                  id="num_input"
                  name="num_input"
                  min="1"
                  max="5"
                  defaultValue={num_input}
                  value={num_input}
                  className="pl-2"
                  onChange={(e) => {
                    setNumInput(e.target.value)
                  }}
                />{" "}
                <p
                  className={`text-sm text-red-400 ${
                    Number(num_input) < 6 && 0 < Number(num_input)
                      ? "hidden"
                      : ""
                  } `}
                >
                  Number is not valid!
                </p>
              </div>
              <hr className="mb-2 border-t-2 rounded-md border-gray-200" />
              {documents?.map((document, i) => (
                <button
                  key={i}
                  className={`font-medium p-4 h-[56px] rounded-md ${
                    clickedDocument === i
                      ? "bg-[#80489C]/90 text-white"
                      : "bg-slate-200"
                  }`}
                  onClick={(e) => setClickedDocument(i)}
                >
                  {document.title}
                </button>
              ))}
              {documents!.length > 0 ? (
                ""
              ) : (
                <div className="text-md text-center text-slate-500 italic">
                  No document file in this chapter
                </div>
              )}
              <DialogFooter>
                <Button
                  disabled={
                    Number(num_input) < 6 &&
                    0 < Number(num_input) &&
                    clickedDocument != 999
                      ? false
                      : true
                  }
                  type="submit"
                  variant="primary"
                  size="sm_l"
                  onClick={(e) =>
                    createQuestionSetFromDocument(num_input, clickedDocument)
                  }
                  className="mt-2"
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
