import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import { DashboardQuestionsClient } from "@/components/dashboard/dashboard-questions-client"

export default async function DashboardQuestionsPage() {
    const session = await auth()
    if (session?.user.role === 'STUDENT') redirect('/dashboard')

    const topics = await prisma.topic.findMany({
        include: {
            subtopics: {
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Банк Вопросов</h1>
            <DashboardQuestionsClient topics={topics} />
        </div>
    )
}
