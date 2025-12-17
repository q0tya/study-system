"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const topicSchema = z.object({
    title: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().optional(),
})

const subtopicSchema = z.object({
    topicId: z.string(),
    title: z.string().min(3),
    slug: z.string().min(3),
    contentMarkdown: z.string().optional(),
})

// --- Topics ---

export async function createTopic(values: z.infer<typeof topicSchema>) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    const parsed = topicSchema.safeParse(values)
    if (!parsed.success) return { error: "Invalid fields" }

    const { title, slug, description } = parsed.data

    try {
        await prisma.topic.create({
            data: { title, slug, description }
        })
        revalidatePath('/dashboard/topics')
        revalidatePath('/topics')
        return { success: "Topic created" }
    } catch (e: any) {
        if (e.code === 'P2002') return { error: "Slug already exists" }
        return { error: "Failed to create topic" }
    }
}

export async function deleteTopic(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    await prisma.topic.delete({ where: { id } })
    revalidatePath('/dashboard/topics')
    revalidatePath('/topics')
    return { success: "Topic deleted" }
}

// --- Subtopics ---

export async function createSubtopic(values: z.infer<typeof subtopicSchema>) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    const parsed = subtopicSchema.safeParse(values)
    if (!parsed.success) return { error: "Invalid fields" }

    const { topicId, title, slug, contentMarkdown } = parsed.data

    try {
        await prisma.subtopic.create({
            data: { topicId, title, slug, contentMarkdown }
        })
        revalidatePath(`/dashboard/topics`)
        // In a real app we might redirect to the topic page, but for now we revalidate
        return { success: "Subtopic created" }
    } catch (e: any) {
        if (e.code === 'P2002') return { error: "Slug already exists for this topic" }
        return { error: "Failed to create subtopic" }
    }
}

export async function deleteSubtopic(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        return { error: "Unauthorized" }
    }

    await prisma.subtopic.delete({ where: { id } })
    revalidatePath('/dashboard/topics')
    return { success: "Subtopic deleted" }
}
