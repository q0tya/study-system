"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const questionSchema = z.object({
    subtopicId: z.string(),
    text: z.string().min(3),
    options: z.array(z.object({
        text: z.string().min(1),
        isCorrect: z.boolean()
    })).min(2)
})

export async function getQuestionsForSubtopic(subtopicId: string) {
    const session = await auth()
    if (session?.user?.role === 'STUDENT') return []

    return await prisma.question.findMany({
        where: { subtopicId },
        include: { options: true },
        orderBy: { createdAt: 'asc' }
    })
}

export async function createQuestion(values: z.infer<typeof questionSchema>) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    const { subtopicId, text, options } = questionSchema.parse(values)

    // Validate only one correct answer (for radio)
    const correctCount = options.filter(o => o.isCorrect).length
    if (correctCount !== 1) {
        return { error: "Exactly one option must be correct" }
    }

    try {
        await prisma.question.create({
            data: {
                subtopicId,
                text,
                options: {
                    create: options
                }
            }
        })
        revalidatePath('/dashboard/questions')
        return { success: "Question created" }
    } catch (e: any) {
        return { error: "Failed to create question" }
    }
}

export async function deleteQuestion(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    await prisma.question.delete({ where: { id } })
    revalidatePath('/dashboard/questions')
    return { success: "Question deleted" }
}
