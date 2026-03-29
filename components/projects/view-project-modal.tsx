import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CheckCircle2, Clock, Mail, MoreVertical, Paperclip, Phone, User, Users, FileText, Layout, Activity, AlertCircle } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { ProjectActions } from "./project-actions"
import { getProjectDetails } from "@/app/actions/projects"

interface ViewProjectModalProps {
    project: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: () => void
    onStatusChange?: () => void
}

export function ViewProjectModal({ project: initialProject, open, onOpenChange, onEdit, onStatusChange }: ViewProjectModalProps) {
    const [details, setDetails] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && initialProject?.id) {
            setLoading(true)
            getProjectDetails(initialProject.id)
                .then(res => {
                    if (res.success) {
                        setDetails(res.data)
                    }
                })
                .finally(() => setLoading(false))
        } else {
            setDetails(null)
        }
    }, [open, initialProject?.id])

    const project = details || initialProject

    if (!project) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-screen sm:h-[90vh] max-w-7xl p-0 gap-0 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b p-6 flex flex-col gap-4 bg-muted/10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
                                    <Badge variant="outline">{project.type}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                        {project.clientName}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Deadline: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Non défini'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ProjectActions project={project} onView={() => { }} onEdit={onEdit} onStatusChange={onStatusChange} />
                        </div>
                    </div>

                    <div className="flex items-center gap-8 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Statut:</span>
                            <Badge variant={project.status === 'COMPLETED' ? 'default' : 'secondary'} className="rounded-full px-3">
                                {project.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Progression:</span>
                            <div className="flex-1 flex items-center gap-2">
                                <Progress value={project.progress || 0} className="h-2" />
                                <span className="text-sm font-medium">{project.progress || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body - Split View */}
                <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden bg-muted/5">
                    {/* Main Content (Left) */}
                    <div className="col-span-12 md:col-span-8 overflow-y-auto p-6 border-r bg-background">
                        <Tabs defaultValue="overview" className="h-full">
                            <TabsList className="items-center rounded-md bg-muted p-1 text-muted-foreground flex flex-wrap justify-start h-auto gap-2 mb-6">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium">Aperçu</TabsTrigger>
                                <TabsTrigger value="tasks" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium">Tâches</TabsTrigger>
                                <TabsTrigger value="files" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium">Fichiers</TabsTrigger>
                                <TabsTrigger value="activity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium">Activité</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8 mt-0">
                                {/* Description */}
                                <section>
                                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                                        <Layout className="h-4 w-4 text-muted-foreground" />
                                        Description
                                    </h3>
                                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {project.description || "Aucune description fournie pour ce projet."}
                                    </div>
                                </section>

                                {/* Client Details Large */}
                                <section>
                                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Informations Client
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Société</p>
                                            <p className="font-medium text-lg">{project.clientName}</p>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Contact Principal</p>
                                            <p className="font-medium text-lg">{project.clientContact || "-"}</p>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Email</p>
                                            {project.clientEmail ? (
                                                <a href={`mailto:${project.clientEmail}`} className="text-primary hover:underline flex items-center gap-2">
                                                    <Mail className="h-3 w-3" /> {project.clientEmail}
                                                </a>
                                            ) : <p>-</p>}
                                        </div>
                                        <div className="p-4 border rounded-lg bg-card">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Téléphone</p>
                                            {project.clientPhone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" /> {project.clientPhone}
                                                </div>
                                            ) : <p>-</p>}
                                        </div>
                                    </div>
                                </section>
                            </TabsContent>

                            <TabsContent value="tasks" className="mt-0 space-y-4">
                                {details?.tasks?.length > 0 ? (
                                    <div className="space-y-3">
                                        {details.tasks.map((task: any) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${task.priority === 3 ? 'bg-red-500' :
                                                            task.priority === 2 ? 'bg-amber-500' : 'bg-blue-500'
                                                        }`} />
                                                    <div>
                                                        <div className="font-medium text-sm">{task.title}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {task.assignees?.map((a: any) => (
                                                            <Avatar key={a.id} className="h-6 w-6 border-2 border-background">
                                                                <AvatarFallback>{getInitials(a.name)}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                        <CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                        <h3 className="font-semibold text-lg">Aucune tâche</h3>
                                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                            Ce projet n'a pas encore de tâches.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="files" className="mt-0">
                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                                    <Paperclip className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                    <h3 className="font-semibold text-lg">Aucun fichier</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                        Déposez ici les documents contractuels, rapports et annexes.
                                    </p>
                                    <Button variant="outline" className="mt-4">Uploader</Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="activity" className="mt-0">
                                <div className="space-y-4">
                                    <div className="relative pl-6 border-l ml-3 space-y-6">
                                        {/* Project Created Event */}
                                        <div className="relative">
                                            <div className="absolute left-[-29px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Projet Créé</p>
                                                <p className="text-xs text-muted-foreground">Le projet a été initié par {project.manager?.name || 'Admin'}.</p>
                                                <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()} à {new Date(project.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>

                                        {/* Synthesized Task Events */}
                                        {details?.tasks?.map((task: any) => (
                                            <div key={task.id} className="relative">
                                                <div className="absolute left-[-29px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-background" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">Tâche Ajoutée: {task.title}</p>
                                                    <p className="text-xs text-muted-foreground">Statut initial: {task.status}</p>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="col-span-12 md:col-span-4 p-6 overflow-y-auto space-y-8 bg-muted/5 border-t md:border-t-0">
                        {/* Project Stats */}
                        <section className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                DETAILS
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Priorité</span>
                                    <Badge variant={project.priority === 'HIGH' ? 'destructive' : 'secondary'}>{project.priority}</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Expertise</span>
                                    <span className="text-sm font-medium">{project.expertise || "Non défini"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Début</span>
                                    <span className="text-sm font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground">Fin estimée</span>
                                    <span className="text-sm font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</span>
                                </div>
                            </div>
                        </section>

                        {/* Team */}
                        <section className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                ÉQUIPE
                            </h4>
                            <div className="space-y-3">
                                {project.manager && (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={project.manager.avatar} />
                                            <AvatarFallback>{getInitials(project.manager.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{project.manager.name}</p>
                                            <p className="text-xs text-muted-foreground">Manager</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2 pl-3 border-l-2 ml-3">
                                    {project.consultants?.map((member: any) => (
                                        <div key={member.id} className="flex items-center gap-3">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">Consultant</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
