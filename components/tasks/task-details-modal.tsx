'use client'

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    MessageSquare,
    Paperclip,
    Send,
    User,
    X,
    FileText,
    MoreVertical,
    Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import { addComment, toggleSubtask, getComments } from "@/app/actions/tasks"
// import { Comment } from "@prisma/client" // Avoid direct import if possible, use any

interface TaskDetailsModalProps {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (task: any) => void
    currentUser: any
}

export function TaskDetailsModal({ task, open, onOpenChange, onEdit, currentUser }: TaskDetailsModalProps) {
    const [newComment, setNewComment] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [loadingComments, setLoadingComments] = useState(false)

    useEffect(() => {
        if (open && task?.id) {
            setLoadingComments(true)
            getComments(task.id).then(res => {
                if (res.success && res.data) {
                    setComments(res.data)
                }
                setLoadingComments(false)
            })
        }
    }, [open, task?.id])

    const handleSendComment = async () => {
        if (!newComment.trim()) return
        setIsSending(true)
        try {
            const res = await addComment(task.id, newComment)
            if (res.success) {
                setNewComment("")
                // Optimistic or refetch
                const user = {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                }
                setComments([...comments, {
                    id: `temp-${Date.now()}`,
                    content: newComment,
                    createdAt: new Date(),
                    user
                }])
                // In real app, revalidation might handle it, but for modal state:
                getComments(task.id).then(r => r.success && r.data && setComments(r.data))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSending(false)
        }
    }

    const handleToggleSubtask = async (subtaskId: string, current: boolean) => {
        try {
            await toggleSubtask(subtaskId, !current)
        } catch (error) {
            console.error(error)
        }
    }

    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-full sm:h-[85vh] sm:max-w-4xl p-0 gap-0 overflow-hidden flex flex-col sm:flex-row">
                {/* Left: Details */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    <div className="p-6 border-b flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{task.project?.name}</Badge>
                                <Badge className={
                                    task.status === "TODO" ? "bg-slate-500" :
                                        task.status === "IN_PROGRESS" ? "bg-blue-500" :
                                            task.status === "REVIEW" ? "bg-amber-500" : "bg-green-500"
                                }>{task.status}</Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-8">
                            {/* Description */}
                            <section>
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Description
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {task.description || "Aucune description."}
                                </p>
                            </section>

                            {/* Subtasks */}
                            <section>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    Sous-tâches
                                </h3>
                                <div className="space-y-2">
                                    {task.subtasks?.map((st: any) => (
                                        <div key={st.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 group">
                                            <div
                                                className={`mt-0.5 cursor-pointer h-4 w-4 border rounded flex items-center justify-center ${st.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
                                                onClick={() => handleToggleSubtask(st.id, st.completed)}
                                            >
                                                {st.completed && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                            <span className={`text-sm ${st.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                {st.title}
                                            </span>
                                        </div>
                                    ))}
                                    {(!task.subtasks || task.subtasks.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic">Aucune sous-tâche.</p>
                                    )}
                                </div>
                            </section>

                            {/* Budget & Meta */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <span className="font-bold">Finances</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Débours</p>
                                        <p className="text-sm font-medium">
                                            {task.budgetDebours ? `${task.budgetDebours} FCFA` : "0 FCFA"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Perdiem</p>
                                        <p className="text-sm font-medium">
                                            {task.budgetPerdiem ? `${task.budgetPerdiem} FCFA` : "0 FCFA"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Transport</p>
                                        <p className="text-sm font-medium">
                                            {task.budgetTransport ? `${task.budgetTransport} FCFA` : "0 FCFA"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                        <p className="text-xs text-primary uppercase font-bold mb-1">Total</p>
                                        <p className="text-sm font-bold text-primary">
                                            {((Number(task.budgetDebours) || 0) + (Number(task.budgetPerdiem) || 0) + (Number(task.budgetTransport) || 0)).toFixed(0)} FCFA
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/20 rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Assignés</p>
                                    <div className="flex -space-x-2">
                                        {task.assignees?.map((u: any) => (
                                            <Avatar key={u.id} className="h-8 w-8 border-2 border-background">
                                                <AvatarImage src={u.avatar} />
                                                <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {(!task.assignees || task.assignees.length === 0) && <span>-</span>}
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/20 rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Échéance</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {task.dueDate ? format(new Date(task.dueDate), "PPP", { locale: fr }) : "-"}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right: Comments */}
                <div className="w-full sm:w-[350px] border-l bg-muted/10 flex flex-col">
                    <div className="p-4 border-b bg-background/50 backdrop-blur">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Commentaires
                        </h3>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="text-center py-4 text-xs text-muted-foreground">Chargement...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Aucun commentaire pour le moment.
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3 text-sm">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={comment.user?.avatar} />
                                            <AvatarFallback>{getInitials(comment.user?.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-xs">{comment.user?.name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(comment.createdAt), "d MMM HH:mm", { locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground leading-snug">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-background">
                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Écrire un commentaire..."
                                className="min-h-[80px] resize-none"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={handleSendComment} disabled={isSending || !newComment.trim()}>
                                {isSending ? <Clock className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                <span className="sr-only">Envoyer</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
