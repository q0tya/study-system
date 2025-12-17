import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Props {
    params: Promise<{
        userId: string
    }>
}

export default async function UserDetailsPage(props: Props) {
    const params = await props.params;
    const session = await auth()

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        redirect("/dashboard")
    }

    const user = await prisma.user.findUnique({
        where: { id: params.userId },
        include: {
            attempts: {
                orderBy: { createdAt: 'desc' },
                include: {
                    subtopic: {
                        include: { topic: true }
                    }
                }
            }
        }
    })

    if (!user) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/users"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">История: {user.name}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Инфо</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><span className="font-semibold">Email:</span> {user.email}</p>
                        <p><span className="font-semibold">Роль:</span> {user.role}</p>
                        <p><span className="font-semibold">Всего попыток:</span> {user.attempts.length}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Результаты тестов</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.attempts.length === 0 ? (
                        <p className="text-muted-foreground">Пользователь еще не проходил тесты.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Тема</TableHead>
                                    <TableHead>Модуль</TableHead>
                                    <TableHead>Результат</TableHead>
                                    <TableHead>Дата</TableHead>
                                    <TableHead className="text-right">Детали</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.attempts.map((attempt) => {
                                    const percentage = Math.round((attempt.score / attempt.total) * 100)
                                    let gradeColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    if (percentage >= 80) gradeColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    else if (percentage >= 50) gradeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"

                                    return (
                                        <TableRow key={attempt.id}>
                                            <TableCell>{attempt.subtopic.topic.title}</TableCell>
                                            <TableCell className="font-medium">{attempt.subtopic.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border-0 ${gradeColor}`}>
                                                    {percentage}% ({attempt.score}/{attempt.total})
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{attempt.createdAt.toLocaleDateString('ru-RU')} {attempt.createdAt.toLocaleTimeString('ru-RU')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/result/${attempt.id}`}>Просмотр</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
