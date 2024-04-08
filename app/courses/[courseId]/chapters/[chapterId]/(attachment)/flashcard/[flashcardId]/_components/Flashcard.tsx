"use client"
import React, { useState } from "react"
import FlashcardGroup from "./FlashcardGroup"
import WordCard from "./WordCard"
import FlashcardModal from "./FlashcardModal"

interface FlashcardProps {
  title: string
  words: Word[]
}

type Word = {
  id: string
  word: string
  definition: string
}

type Answer = {
  wordId: string
  answer: string
  correct: boolean
}

const Flashcard: React.FunctionComponent<FlashcardProps> = ({
  title,
  words,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isFlipped, setIsFlipped] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [knownAnswersCount, setKnownAnswersCount] = useState(0)

  const restartFlashcard = () => {
    setCurrentQuestionIndex(0)
    setKnownAnswersCount(0)
    setIsFlipped(false)
    setShowModal(false)
  }

  const submitAnswer = (userAnswer: string) => {
    if (userAnswer === "know") {
      setKnownAnswersCount(knownAnswersCount + 1)
    }
    const newAnswer: Answer = {
      wordId: words[currentQuestionIndex].id,
      answer: userAnswer,
      correct: userAnswer === words[currentQuestionIndex].definition,
    }

    setAnswers([...answers, newAnswer])

    if (currentQuestionIndex < words.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setIsFlipped(false)
    } else {
      setShowModal(true)
      console.log("Submit all answers:", answers)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h2>{title}</h2>
        <div>{`Word ${words.length < 1? 0 : currentQuestionIndex + 1}/${words.length}`}</div>
      </div>
      {words.length > 0 ? (
        <>
          <WordCard
            word={words[currentQuestionIndex].word}
            definition={words[currentQuestionIndex].definition}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
          />

          <FlashcardGroup submitAnswer={submitAnswer} />
        </>
      ) : null}
      <FlashcardModal
        score={knownAnswersCount}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRestart={restartFlashcard}
      />
    </section>
  )
}

export default Flashcard
