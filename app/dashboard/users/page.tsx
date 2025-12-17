import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
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

export default async function UsersPage() {
    const session = await auth()

    // Admin and Teacher Check
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") {
        redirect("/dashboard")
    }

    // Filter logic: Admins see everyone. Teachers see Students and Teachers.
    const whereClause: any = session?.user?.role === "TEACHER"
        ? { role: { in: ["STUDENT", "TEACHER"] } }
        : {}

    // @ts-ignore
    const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { attempts: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Список всех пользователей ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Имя</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Попыток тестов</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || "Без имени"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'TEACHER' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user._count.attempts}</TableCell>
                                    <TableCell>{user.createdAt.toLocaleDateString('ru-RU')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/dashboard/users/${user.id}`}>Детали</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
