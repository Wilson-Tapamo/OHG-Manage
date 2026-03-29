'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MoreVertical, Mail, Phone, Star, MapPin } from "lucide-react"
import { getInitials } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ConsultantCardProps {
    consultant: any
    onEdit: (consultant: any) => void
    onView: (consultant: any) => void
    onDelete?: (id: string) => void
}

export function ConsultantCard({ consultant, onEdit, onView, onDelete }: ConsultantCardProps) {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'DIRECTOR': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'SENIOR': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'INTERMEDIATE': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
            case 'JUNIOR':
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    // Safely handle counts if available
    const projectCount = consultant._count?.consultingProjects || 0
    const taskCount = consultant._count?.assignedTasks || 0

    return (
        <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => onView(consultant)}>
            <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                            <AvatarImage src={consultant.avatar || undefined} />
                            <AvatarFallback>{getInitials(consultant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base font-semibold">{consultant.name}</CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-1">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {consultant.title || "Consultant"}
                                </span>
                                <Badge variant="outline" className={`w-fit text-[10px] py-0 px-2 border ${getLevelColor(consultant.level)}`}>
                                    {consultant.level}
                                </Badge>
                            </CardDescription>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(consultant) }}>
                                Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(consultant) }}>
                                Modifier
                            </DropdownMenuItem>
                            {onDelete && (
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(consultant.id) }}>
                                    Supprimer
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{consultant.email}</span>
                    </div>
                    {consultant.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{consultant.phone}</span>
                        </div>
                    )}
                </div>

                {consultant.rating > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{consultant.rating.toFixed(1)}</span>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t">
                    <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-foreground">{projectCount}</p>
                        <p className="text-xs text-muted-foreground">Projets</p>
                    </div>
                    <div className="flex-1 text-center border-l">
                        <p className="text-lg font-bold text-foreground">{taskCount}</p>
                        <p className="text-xs text-muted-foreground">Tâches</p>
                    </div>
                    {Number(consultant.hourlyRate) > 0 && (
                        <div className="flex-1 text-center border-l">
                            <p className="text-lg font-bold text-foreground">{Number(consultant.hourlyRate).toLocaleString()} FCFA</p>
                            <p className="text-xs text-muted-foreground">/ heure</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
