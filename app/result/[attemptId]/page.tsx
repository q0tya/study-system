import { auth } from "@/auth"
import { getAttemptResult } from "@/app/actions/quiz-actions"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
    params: Promise<{
        attemptId: string
    }>
}

export default async function ResultPage(props: Props) {
    const params = await props.params;
    const session = await auth()
    if (!session) redirect('/auth/login')

    const attempt = await getAttemptResult(params.attemptId)
    if (!attempt) notFound()

    const percentage = Math.round((attempt.score / attempt.total) * 100)
    let gradeColor = "text-red-500"
    if (percentage >= 80) gradeColor = "text-green-500"
    else if (percentage >= 50) gradeColor = "text-yellow-500"

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Результаты теста</h1>
                    <p className="text-muted-foreground mb-6">Тема: {attempt.subtopic.title}</p>

                    <div className="bg-card border rounded-lg p-6 inline-block min-w-[200px] shadow-sm">
                        <div className={cn("text-5xl font-bold mb-2", gradeColor)}>
                            {percentage}%
                        </div>
                        <p className="text-sm font-medium">
                            {attempt.score} из {attempt.total} верно
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {attempt.answers.map((ans, index) => {
                        return (
                            <Card key={ans.id} className={cn("border-l-4", ans.isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex justify-between items-start">
                                        <span>{index + 1}. {ans.question.text}</span>
                                        {ans.isCorrect ? <CheckCircle className="text-green-500 h-6 w-6 ml-2 shrink-0" /> : <XCircle className="text-red-500 h-6 w-6 ml-2 shrink-0" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {ans.question.options.map(opt => {
                                        const isSelected = opt.id === ans.selectedOptionId
                                        const isActuallyCorrect = opt.isCorrect

                                        let styleClass = "border rounded p-3 flex justify-between items-center"
                                        if (isSelected && isActuallyCorrect) {
                                            styleClass += " bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
                                        } else if (isSelected && !isActuallyCorrect) {
                                            styleClass += " bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-900"
                                        } else if (!isSelected && isActuallyCorrect) {
                                            styleClass += " bg-green-50/30 border-green-200 dark:bg-green-900/10 dark:border-green-900 border-dashed"
                                        }

                                        return (
                                            <div key={opt.id} className={styleClass}>
                                                <span className={cn(
                                                    (isSelected || isActuallyCorrect) ? "font-medium" : ""
                                                )}>
                                                    {opt.text}
                                                </span>
                                                {isSelected && <Badge variant={isActuallyCorrect ? "default" : "destructive"}>{isActuallyCorrect ? "Верно" : "Ваш ответ"}</Badge>}
                                                {!isSelected && isActuallyCorrect && <Badge variant="outline" className="border-green-500 text-green-600">Правильный ответ</Badge>}
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="flex justify-center gap-4 mt-12 mb-8">
                    <Button variant="outline" asChild>
                        <Link href={`/topics/${attempt.subtopic.topic.slug}`}>Назад к теме</Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/quiz/${attempt.subtopicId}`}>Пройти снова</Link>
                    </Button>
                </div>
            </main>
        </div>
    )
}
