import { SiteHeader } from "@/components/site-header"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"

interface Props {
    params: Promise<{
        topicSlug: string
        subtopicSlug: string
    }>
}

import { auth } from "@/auth"

export default async function SubtopicPage(props: Props) {
    const params = await props.params;
    const session = await auth()
    const isStudent = session?.user?.role === "STUDENT"

    const subtopic = await prisma.subtopic.findFirst({
        where: {
            slug: params.subtopicSlug,
            topic: {
                slug: params.topicSlug
            }
        },
        include: {
            topic: true
        }
    })

    if (!subtopic) {
        notFound()
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <nav className="flex text-sm text-muted-foreground mb-6 gap-2">
                    <Link href="/topics" className="hover:underline">Темы</Link>
                    <span>/</span>
                    <Link href={`/topics/${subtopic.topic.slug}`} className="hover:underline">{subtopic.topic.title}</Link>
                    <span>/</span>
                    <span className="text-foreground">{subtopic.title}</span>
                </nav>

                <h1 className="text-3xl font-bold mb-6">{subtopic.title}</h1>

                <Card className="mb-8">
                    <CardContent className="prose dark:prose-invert max-w-none pt-6">
                        {subtopic.contentMarkdown ? (
                            <ReactMarkdown>{subtopic.contentMarkdown}</ReactMarkdown>
                        ) : (
                            <p className="italic text-muted-foreground">Материал отсутствует.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    {isStudent ? (
                        <Button size="lg" asChild>
                            <Link href={`/quiz/${subtopic.id}`}>
                                Начать тест <PlayCircle className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <div className="text-muted-foreground text-sm italic">
                            (Тестирование доступно только для студентов)
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
```
