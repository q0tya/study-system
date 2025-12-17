"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const submitQuizSchema = z.object({
    subtopicId: z.string(),
    answers: z.array(z.object({
        questionId: z.string(),
        optionId: z.string(),
    }))
})

export async function submitQuiz(values: z.infer<typeof submitQuizSchema>) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    const { subtopicId, answers } = submitQuizSchema.parse(values)

    // Fetch questions and correct options to verify
    const questions = await prisma.question.findMany({
        where: { subtopicId },
        include: { options: true }
    })

    let score = 0;
    const total = questions.length;

    // Build answer records
    const attemptAnswersData = answers.map(ans => {
        const question = questions.find(q => q.id === ans.questionId)
        if (!question) throw new Error("Question not found")

        const selectedOption = question.options.find(o => o.id === ans.optionId)
        const isCorrect = selectedOption?.isCorrect || false

        if (isCorrect) score++;

        return {
            questionId: ans.questionId,
            selectedOptionId: ans.optionId,
            isCorrect
        }
    })

    const attempt = await prisma.attempt.create({
        data: {
            userId: session.user.id,
            subtopicId,
            score,
            total,
            answers: {
                create: attemptAnswersData
            }
        }
    })

    revalidatePath(`/topics`) // Update progress indicators
    revalidatePath(`/dashboard`)

    return { success: true, attemptId: attempt.id }
}

export async function getQuizData(subtopicId: string) {
    const session = await auth()
    if (!session?.user) return null

    const questions = await prisma.question.findMany({
        where: { subtopicId },
        include: {
            options: {
                select: { id: true, text: true } // Don't send isCorrect to client
            }
        }
    })

    return questions
}

export async function getAttemptResult(attemptId: string) {
    const session = await auth()
    if (!session?.user) return null

    const attempt = await prisma.attempt.findUnique({
        where: { id: attemptId },
        include: {
            subtopic: { include: { topic: true } },
            answers: {
                include: {
                    question: {
                        include: {
                            options: true // Need full options to show correct answer
                        }
                    },
                    selectedOption: true
                }
            }
        }
    })

    if (attempt?.userId !== session.user.id && session.user.role === 'STUDENT') {
        return null // Unauthorized to view others' results
    }

    return attempt
}
