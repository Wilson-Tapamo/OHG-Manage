'use client'

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Users } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getInitials } from "@/lib/utils"
import { ProjectActions } from "./project-actions"

interface ProjectCardProps {
    project: any
    onClick: () => void
    onEdit?: () => void
    onStatusChange?: () => void
}

export function ProjectCard({ project, onClick, onEdit, onStatusChange }: ProjectCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "IN_PROGRESS":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case "COMPLETED":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            case "PENDING":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            case "ON_HOLD":
                return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
            default:
                return "bg-slate-100 text-slate-700"
        }
    }

    const teamSize = (project.consultants?.length || 0) + 1

    // Calculate stats
    const totalBudget = project.tasks?.reduce((sum: number, task: any) => sum + Number(task.budget || 0), 0) || 0
    const taskCount = project.tasks?.length || 0 // or use project._count?.tasks

    return (
        <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800 group h-full flex flex-col relative"
            onClick={onClick}
        >
            <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                <ProjectActions project={project} onView={onClick} onEdit={onEdit} onStatusChange={onStatusChange} />
            </div>

            <CardHeader className="pb-3 flex-none pr-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-normal">
                            {project.type || "JURIDIQUE"}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] px-1 py-0 h-5 font-normal ${getStatusColor(project.status)}`}>
                            {project.status}
                        </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{project.clientName}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-end pt-0">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 py-2">
                    <div className="bg-muted/30 p-2 rounded-md">
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Budget</p>
                        <p className="text-sm font-semibold text-primary">
                            {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(totalBudget)}
                        </p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md">
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">Début</p>
                        <p className="text-sm font-semibold">
                            {project.startDate ? format(new Date(project.startDate), "d MMM", { locale: fr }) : "-"}
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <span className="font-medium text-foreground">{taskCount}</span> tâches
                        </span>
                        <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-auto">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {project.manager && (
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={project.manager.avatar} />
                                    <AvatarFallback>{getInitials(project.manager.name)}</AvatarFallback>
                                </Avatar>
                            )}
                            {project.consultants?.slice(0, 3).map((c: any) => (
                                <Avatar key={c.id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={c.avatar} />
                                    <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {teamSize > 4 && (
                                <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                                    +{teamSize - 4}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                            DL: {project.endDate ? format(new Date(project.endDate), "d MMM", { locale: fr }) : "---"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
