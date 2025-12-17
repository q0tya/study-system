"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { submitQuiz } from "@/app/actions/quiz-actions"
import { toast } from "sonner"

interface Question {
    id: string
    text: string
    options: { id: string; text: string }[]
}

interface QuizFormProps {
    subtopicId: string
    questions: Question[]
}

export function QuizForm({ subtopicId, questions }: QuizFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const handleOptionSelect = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    }

    const handleSubmit = () => {
        // Validation
        if (Object.keys(answers).length < questions.length) {
            toast.error("Пожалуйста, ответьте на все вопросы перед отправкой.")
            return
        }

        const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
            questionId: qId,
            optionId: oId
        }))

        startTransition(async () => {
            const result = await submitQuiz({ subtopicId, answers: formattedAnswers })
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("Тест завершен!")
                router.push(`/result/${result.attemptId}`)
            }
        })
    }

    return (
        <div className="space-y-8">
            {questions.map((q, index) => (
                <Card key={q.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {index + 1}. {q.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            onValueChange={(val) => handleOptionSelect(q.id, val)}
                            value={answers[q.id]}
                        >
                            <div className="space-y-3">
                                {q.options.map((opt) => (
                                    <div key={opt.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.id} id={opt.id} />
                                        <Label htmlFor={opt.id} className="cursor-pointer font-normal leading-normal py-1">
                                            {opt.text}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end pt-4 pb-12">
                <Button size="lg" onClick={handleSubmit} disabled={isPending}>
                    {isPending ? "Отправка..." : "Завершить тест"}
                </Button>
            </div>
        </div>
    )
}
