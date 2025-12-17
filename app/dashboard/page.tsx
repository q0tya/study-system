import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
    const session = await auth()
    const user = session?.user

    // Fetch some basic stats
    const attemptCount = await prisma.attempt.count({
        where: { userId: user?.id }
    })

    // For teachers/admins, fetch total counts
    const totalTopics = await prisma.topic.count()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ваши попытки</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attemptCount}</div>
                        <p className="text-xs text-muted-foreground">Тестов пройдено</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Доступные темы</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTopics}</div>
                        <p className="text-xs text-muted-foreground">Учебных модулей</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Роль</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{user?.role === 'ADMIN' ? 'Администратор' : user?.role === 'TEACHER' ? 'Учитель' : 'Студент'}</div>
                        <p className="text-xs text-muted-foreground">Текущие права</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
