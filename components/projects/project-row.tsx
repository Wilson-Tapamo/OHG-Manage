'use client'

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TableCell, TableRow } from "@/components/ui/table"
import { getInitials } from "@/lib/utils"
import { ProjectActions } from "./project-actions"

interface ProjectRowProps {
    project: any
    onClick: () => void
    onEdit?: () => void
    onStatusChange?: () => void
}

export function ProjectRow({ project, onClick, onEdit, onStatusChange }: ProjectRowProps) {
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

    return (
        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
            <TableCell>
                <Badge variant="outline" className="text-[10px]">
                    {project.type || "JURIDIQUE"}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">
                <div>
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-xs text-muted-foreground">{project.clientName}</div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="secondary" className={getStatusColor(project.status)}>
                    {project.status}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{project.priority}</Badge>
            </TableCell>
            <TableCell className="w-[150px]">
                <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="h-2 w-16" />
                    <span className="text-xs">{project.progress}%</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex -space-x-2">
                    {project.manager && (
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={project.manager.avatar} /> {/* Fixed image to avatar */}
                            <AvatarFallback>{getInitials(project.manager.name)}</AvatarFallback>
                        </Avatar>
                    )}
                    {project.consultants?.slice(0, 3).map((c: any) => (
                        <Avatar key={c.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </TableCell>
            <TableCell>
                {project.endDate ? format(new Date(project.endDate), "dd MMM yyyy", { locale: fr }) : "-"}
            </TableCell>
            <TableCell className="text-right">
                <div onClick={(e) => e.stopPropagation()}>
                    <ProjectActions project={project} onView={onClick} onEdit={onEdit} onStatusChange={onStatusChange} />
                </div>
            </TableCell>
        </TableRow>
    )
}
