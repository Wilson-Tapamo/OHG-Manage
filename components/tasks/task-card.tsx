'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Calendar, MessageSquare, MoreVertical, CheckCircle2, Eye, Pencil, Trash } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { deleteTask, updateTaskStatus } from "@/app/actions/tasks"
// import { toast } from "sonner" 

// ... (imports)

interface TaskCardProps {
    task: any
    onView: (task: any) => void
    onEdit: (task: any) => void
    onStatusChange?: (task: any) => void
}

export function TaskCard({ task, onView, onEdit, onStatusChange }: TaskCardProps) {
    const handleDelete = async () => {
        if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
            await deleteTask(task.id)
        }
    }

    // Calculate subtasks
    const subtaskCount = task.subtasks?.length || 0
    const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
    const progress = subtaskCount > 0 ? Math.round((completedSubtasks / subtaskCount) * 100) : 0

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 3: return "text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
            case 2: return "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200"
            case 1:
            default: return "text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
        }
    }

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 3: return "Haute"
            case 2: return "Moyenne"
            case 1:
            default: return "Basse"
        }
    }

    return (
        <Card onClick={() => onView(task)} className="hover:shadow-md transition-all cursor-pointer group bg-background">
            <CardContent className="p-3 space-y-3">
                <div className="flex justify-between items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto font-normal bg-muted/50 truncate max-w-[120px] w-fit">
                        {task.project?.name}
                    </Badge>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-auto font-medium border w-fit ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 shrink-0">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(task); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task); }}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Changer statut
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold leading-tight mb-2 line-clamp-2">{task.title}</h4>
                </div>

                {subtaskCount > 0 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Progression</span>
                            <span>{completedSubtasks}/{subtaskCount}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <div className="flex -space-x-2">
                        {task.assignees?.map((u: any) => (
                            <Avatar key={u.id} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback className="text-[9px]">{getInitials(u.name)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {task._count?.comments > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task._count.comments}</span>
                            </div>
                        )}

                        {task.dueDate && (
                            <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() ? 'text-destructive font-medium' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), "d MMM", { locale: fr })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
