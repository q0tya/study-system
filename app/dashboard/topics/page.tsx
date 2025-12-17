import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DeleteTopicButton } from "@/components/dashboard/delete-topic-button"
import { CreateTopicDialog } from "@/components/dashboard/create-topic-dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { CreateSubtopicDialog } from "@/components/dashboard/create-subtopic-dialog"
import { Button } from "@/components/ui/button"

export default async function DashboardTopicsPage() {
    const session = await auth()
    if (session?.user.role === "STUDENT") {
        return <div>Нет доступа</div>
    }

    const topics = await prisma.topic.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            subtopics: {
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Темы и Контент</h1>
                <CreateTopicDialog />
            </div>

            <div className="space-y-4">
                {topics.map((topic) => (
                    <Accordion type="single" collapsible key={topic.id} className="border rounded-lg bg-card text-card-foreground shadow-sm">
                        <AccordionItem value={topic.id} className="border-0 px-4">
                            <div className="flex items-center justify-between w-full py-4">
                                <AccordionTrigger className="hover:no-underline py-0 flex-1">{topic.title} <span className="text-xs text-muted-foreground ml-2 font-normal">({topic.slug})</span></AccordionTrigger>
                                <div className="flex items-center gap-2 pl-4">
                                    <CreateSubtopicDialog topicId={topic.id} />
                                    <DeleteTopicButton id={topic.id} />
                                </div>
                            </div>
                            <AccordionContent className="pt-0 pb-4">
                                <div className="pl-4 border-l-2 border-muted ml-2">
                                    {topic.subtopics.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Подтемы отсутствуют.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {topic.subtopics.map(sub => (
                                                <div key={sub.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                                    <span>{sub.title}</span>
                                                    <span className="text-muted-foreground">{sub.slug}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
                {topics.length === 0 && (
                    <div className="text-center h-24 text-muted-foreground flex items-center justify-center border rounded-md">
                        Темы не найдены. Создайте новую.
                    </div>
                )}
            </div>
        </div>
    )
}
