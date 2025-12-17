"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createQuestion, deleteQuestion, getQuestionsForSubtopic } from "@/app/actions/question-actions"
import { Loader2, Plus, Trash, Check, X } from "lucide-react"

interface TopicWithSubtopics {
    id: string
    title: string
    subtopics: { id: string; title: string, slug: string }[]
}

export function DashboardQuestionsClient({ topics }: { topics: TopicWithSubtopics[] }) {
    const [selectedTopicId, setSelectedTopicId] = useState<string>("")
    const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("")

    const [questions, setQuestions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Form state
    const [questionText, setQuestionText] = useState("")
    const [options, setOptions] = useState([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
    ])

    useEffect(() => {
        if (selectedSubtopicId) {
            setIsLoading(true)
            getQuestionsForSubtopic(selectedSubtopicId).then(data => {
                setQuestions(data)
                setIsLoading(false)
            })
        } else {
            setQuestions([])
        }
    }, [selectedSubtopicId])

    const handleCreate = () => {
        if (!questionText || options.some(o => !o.text)) {
            toast.error("Пожалуйста, заполните все поля")
            return
        }
        if (options.filter(o => o.isCorrect).length !== 1) {
            toast.error("Пожалуйста, отметьте ровно один правильный ответ")
            return
        }

        startTransition(async () => {
            const result = await createQuestion({
                subtopicId: selectedSubtopicId,
                text: questionText,
                options
            })
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Вопрос создан")
                // Refresh list
                const data = await getQuestionsForSubtopic(selectedSubtopicId)
                setQuestions(data)
                // Reset form
                setQuestionText("")
                setOptions([
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false }
                ])
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить вопрос?")) return;
        const result = await deleteQuestion(id)
        if (result?.success) {
            toast.success("Удалено")
            setQuestions(prev => prev.filter(q => q.id !== id))
        } else {
            toast.error("Ошибка удаления")
        }
    }

    const updateOption = (index: number, field: 'text' | 'isCorrect', value: any) => {
        const newOptions = [...options]
        if (field === 'isCorrect' && value === true) {
            // Uncheck others
            newOptions.forEach(o => o.isCorrect = false)
        }
        newOptions[index] = { ...newOptions[index], [field]: value }
        setOptions(newOptions)
    }

    const selectedTopic = topics.find(t => t.id === selectedTopicId)

    return (
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle>Выбор модуля</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Тема</Label>
                        <Select onValueChange={setSelectedTopicId} value={selectedTopicId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите тему" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedTopic && (
                        <div className="space-y-2">
                            <Label>Подтема</Label>
                            <Select onValueChange={setSelectedSubtopicId} value={selectedSubtopicId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите подтему" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedTopic.subtopics.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                {selectedSubtopicId ? (
                    <>
                        {/* Creator Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Добавить вопрос</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Текст вопроса</Label>
                                    <Input
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        placeholder="Например: Что значит CPU?"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label>Варианты (Отметьте правильный)</Label>
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Button
                                                variant={opt.isCorrect ? "default" : "outline"}
                                                size="icon"
                                                className={opt.isCorrect ? "bg-green-600 hover:bg-green-700" : ""}
                                                onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
                                            >
                                                {opt.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                            </Button>
                                            <Input
                                                value={opt.text}
                                                onChange={(e) => updateOption(idx, 'text', e.target.value)}
                                                placeholder={`Вариант ${idx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={handleCreate} disabled={isPending} className="w-full">
                                    {isPending ? "Сохранение..." : "Сохранить вопрос"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Существующие вопросы ({questions.length})</h2>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                questions.map((q, i) => (
                                    <Card key={q.id}>
                                        <CardHeader className="py-3 flex flex-row items-start justify-between">
                                            <div className="font-medium">{i + 1}. {q.text}</div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                                                <Trash className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {q.options.map((o: any) => (
                                                    <li key={o.id} className={o.isCorrect ? "text-green-600 font-semibold" : ""}>
                                                        {o.text} {o.isCorrect && "(Верно)"}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex h-[200px] items-center justify-center border rounded-md bg-muted/10 text-muted-foreground">
                        Выберите подтему для управления вопросами
                    </div>
                )}
            </div>
        </div>
    )
}
