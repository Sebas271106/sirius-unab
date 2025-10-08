"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  quiz: {
    id: number
    title: string
    description: string
    timeLimit: number
  }
}

const quizQuestions = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What is the worst-case time complexity of quicksort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 1,
  },
]

export function QuizModal({ isOpen, onClose, quiz }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60)

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex })
  }

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
  }

  const calculateScore = () => {
    let correct = 0
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quizQuestions.length) * 100)
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{quiz.description}</p>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-16 h-16 text-[#ff9800] mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Quiz Submitted!</h3>
            <p className="text-3xl text-[#ff9800] font-medium mb-2">{calculateScore()}%</p>
            <p className="text-sm text-muted-foreground">
              You answered {Object.keys(answers).length} out of {quizQuestions.length} questions
            </p>
            <Button onClick={onClose} className="mt-6 bg-[#ff9800] hover:bg-[#ff9800]/90 text-white">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">{quizQuestions[currentQuestion].question}</h3>

              <RadioGroup
                value={answers[quizQuestions[currentQuestion].id]?.toString()}
                onValueChange={(value) => handleAnswerChange(quizQuestions[currentQuestion].id, Number.parseInt(value))}
              >
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                Previous
              </Button>
              <div className="flex gap-2">
                {currentQuestion === quizQuestions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length === 0}
                    className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
