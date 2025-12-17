import { SiteHeader } from "@/components/site-header"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Book, CheckCircle } from "lucide-react"
import { notFound } from "next/navigation"
import { auth } from "@/auth"

interface Props {
    params: Promise<{
        topicSlug: string
    }>
}

export default async function TopicDetailPage(props: Props) {
    const params = await props.params;
    const session = await auth()

    const topic = await prisma.topic.findUnique({
        where: { slug: params.topicSlug },
        include: {
            subtopics: {
                orderBy: { createdAt: 'asc' },
                include: {
                    attempts: {
                        where: { userId: session?.user?.id },
                        orderBy: { score: 'desc' }, // Get best attempt
                        take: 1
                    }
                }
            }
        }
    })

    if (!topic) {
        notFound()
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/topics" className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Назад к темам
                    </Link>
                    <h1 className="text-3xl font-bold">{topic.title}</h1>
                    <p className="text-muted-foreground mt-2">{topic.description}</p>
                </div>

                <div className="grid gap-4">
                    {topic.subtopics.map((sub, index) => {
                        const bestAttempt = sub.attempts[0]
                        const isCompleted = bestAttempt && bestAttempt.score === bestAttempt.total && bestAttempt.total > 0

                        return (
                            <Link key={sub.id} href={`/topics/${topic.slug}/${sub.slug}`}>
                                <Card className="hover:bg-accent transition-colors">
                                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                                {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Book className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg">
                                                    {index + 1}. {sub.title}
                                                </CardTitle>
                                                {bestAttempt && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Лучший результат: {bestAttempt.score}/{bestAttempt.total}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </CardHeader>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
