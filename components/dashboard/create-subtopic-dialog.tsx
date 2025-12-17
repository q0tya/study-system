"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createSubtopic } from "@/app/actions/content-actions"
import { toast } from "sonner"
import { Plus } from "lucide-react"

const formSchema = z.object({
    title: z.string().min(3, { message: "Минимум 3 символа" }),
    slug: z.string().min(3, { message: "Минимум 3 символа" }),
    contentMarkdown: z.string().optional(),
})

export function CreateSubtopicDialog({ topicId }: { topicId: string }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            slug: "",
            contentMarkdown: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await createSubtopic({ ...values, topicId })
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Подтема создана")
                setOpen(false)
                form.reset()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="mr-2 h-3 w-3" /> Подтема</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Создать подтему</DialogTitle>
                    <DialogDescription>
                        Добавьте новый модуль в эту тему.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Заголовок</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Архитектура ЦП" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cpu-arch" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="contentMarkdown"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Контент (Markdown)</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[200px]" placeholder="# Теоретический материал..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Создание..." : "Создать"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
