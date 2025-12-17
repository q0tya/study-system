import { auth } from "@/auth"
import { getQuizData } from "@/app/actions/quiz-actions"
import { notFound, redirect } from "next/navigation"
import { QuizForm } from "@/components/quiz/quiz-form"
import { SiteHeader } from "@/components/site-header"
import { prisma } from "@/lib/prisma"

interface Props {
    params: Promise<{
        subtopicId: string
    }>
}

export default async function QuizPage(props: Props) {
    const params = await props.params;
    const session = await auth()
    if (!session) redirect('/auth/login')

    const subtopic = await prisma.subtopic.findUnique({
        where: { id: params.subtopicId },
        include: { topic: true }
    })

    if (!subtopic) notFound()

    const questions = await getQuizData(params.subtopicId)

    if (!questions || questions.length === 0) {
        return (
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Тест: {subtopic.title}</h1>
                    <p className="text-muted-foreground">Вопросы для этого теста еще не добавлены.</p>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Тест: {subtopic.title}</h1>
                    <p className="text-muted-foreground">Тема: {subtopic.topic.title}</p>
                </div>

                <QuizForm subtopicId={subtopic.id} questions={questions} />
            </main>
        </div>
    )
}
