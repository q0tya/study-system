"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { registerAction } from "@/app/actions/auth-actions"
import Link from 'next/link'

const formSchema = z.object({
    name: z.string().min(2, { message: "Имя должно быть длиннее 2 символов" }),
    email: z.string().email({ message: "Некорректный email" }),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
})

export function RegisterForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await registerAction(values)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Аккаунт создан! Пожалуйста, войдите.")
                router.push('/auth/login')
            }
        })
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>Создайте аккаунт для начала обучения.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Имя</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Иван Иванов" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="student@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Пароль</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Регистрация..." : "Зарегистрироваться"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-gray-500">
                    Уже есть аккаунт? <Link href="/auth/login" className="underline">Войти</Link>
                </p>
            </CardFooter>
        </Card>
    )
}
