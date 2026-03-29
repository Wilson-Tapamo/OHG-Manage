'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    LayoutGrid,
    List,
    Plus,
    Search,
    Calendar as CalendarIcon,
    BarChart2,
    Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { TaskCard } from "./task-card"
interface TasksViewProps {
    initialTasks: any[]
    projects: any[]
    consultants: any[]
    currentUser: any
}

export function TasksView({ initialTasks, projects, consultants, currentUser }: TasksViewProps) {
    const [viewMode, setViewMode] = useState<"board" | "list" | "calendar" | "gantt">("board")
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [editingTask, setEditingTask] = useState<any>(null)
    const [statusTask, setStatusTask] = useState<any>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        router.replace(`/tasks?${params.toString()}`)
    }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "ALL") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.replace(`/tasks?${params.toString()}`)
    }

    // Group tasks for Kanban
    const columns = [
        { id: "TODO", title: "À faire", color: "bg-slate-100 dark:bg-slate-800" },
        { id: "IN_PROGRESS", title: "En cours", color: "bg-blue-50 dark:bg-blue-900/10" },
        { id: "REVIEW", title: "Revue", color: "bg-amber-50 dark:bg-amber-900/10" },
        { id: "COMPLETED", title: "Terminé", color: "bg-green-50 dark:bg-green-900/10" },
    ]

    const handleCreateTask = () => {
        setEditingTask(null)
        setIsNewTaskOpen(true)
    }

    const handleEditTask = (task: any) => {
        setEditingTask(task)
        setSelectedTask(null)
        setIsNewTaskOpen(true)
    }

    const handleViewTask = (task: any) => {
        setSelectedTask(task)
    }

    const handleStatusChange = (task: any) => {
        setStatusTask(task)
    }

    return (
        <div className="space-y-6">
            {/* ... (Header and Filters) */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
                    <p className="text-muted-foreground mt-1">
                        Suivez et gérez l'ensemble des tâches de vos projets.
                    </p>
                </div>
                <Button onClick={handleCreateTask} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Tâche
                </Button>
            </div>

            {/* Filters & Controls */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                            <div className="relative flex-1 w-full sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher..."
                                    className="pl-10"
                                    defaultValue={searchParams.get("search")?.toString()}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            <Select
                                defaultValue={searchParams.get("projectId") || "ALL"}
                                onValueChange={(v) => handleFilterChange("projectId", v)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Projet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tous les projets</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                defaultValue={searchParams.get("assigneeId") || "ALL"}
                                onValueChange={(v) => handleFilterChange("assigneeId", v)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Assigné à" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tous les membres</SelectItem>
                                    {consultants.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="hidden md:flex border rounded-md bg-muted/50 p-1">
                            <Button
                                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('board')}
                                title="Kanban"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                title="Liste"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                                title="Calendrier"
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('gantt')}
                                title="Gantt"
                            >
                                <BarChart2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Views */}
            {viewMode === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                    {columns.map(col => {
                        const colTasks = initialTasks.filter(t => t.status === col.id)
                        return (
                            <div key={col.id} className="flex flex-col h-full min-w-[280px]">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="font-semibold text-sm flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${col.id === 'TODO' ? 'bg-slate-500' : col.id === 'IN_PROGRESS' ? 'bg-blue-500' : col.id === 'REVIEW' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                        {col.title}
                                    </h3>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
                                </div>
                                <div className={`flex-1 rounded-lg p-2 space-y-3 overflow-y-auto ${col.color}`}>
                                    {colTasks.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onView={handleViewTask}
                                            onEdit={handleEditTask}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div className="text-center py-8 text-xs text-muted-foreground italic">
                                            Aucune tâche
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* List View Placeholder */}
            {viewMode === 'list' && (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm">Tâche</th>
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm">Projet</th>
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm">Priorité</th>
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm">Assigné à</th>
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm">Statut</th>
                                        <th className="text-left p-4 font-medium text-slate-500 text-sm w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initialTasks.map(task => (
                                        <tr key={task.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => handleViewTask(task)}>
                                            <td className="p-4">
                                                <div className="font-medium text-sm">{task.title}</div>
                                                {task.dueDate && (
                                                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                        <CalendarIcon className="h-3 w-3 mr-1" />
                                                        {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                                {task.project?.name}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.priority >= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        task.priority === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {task.priority >= 3 ? 'Haute' : task.priority === 2 ? 'Moyenne' : 'Basse'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex -space-x-2">
                                                    {task.assignees?.map((assignee: any) => (
                                                        <div key={assignee.id} className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white dark:border-slate-950 text-[10px] font-medium text-indigo-700" title={assignee.name}>
                                                            {assignee.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                    {(!task.assignees || task.assignees.length === 0) && <span className="text-xs text-muted-foreground">-</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(task); }}
                                                    className={`text-xs px-2 py-1 rounded-full font-medium border ${task.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' :
                                                            task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' :
                                                                task.status === 'REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}
                                                >
                                                    {task.status === 'TODO' && 'À faire'}
                                                    {task.status === 'IN_PROGRESS' && 'En cours'}
                                                    {task.status === 'REVIEW' && 'En revue'}
                                                    {task.status === 'COMPLETED' && 'Terminé'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => { e.stopPropagation(); handleViewTask(task); }}>
                                                    <List className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {initialTasks.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                Aucune tâche trouvée
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Calendar View Placeholder */}
            {viewMode === 'calendar' && (
                <div className="text-center py-12 text-muted-foreground">Vue Calendrier à venir (Placeholder)</div>
            )}
            {/* Gantt View Placeholder */}
            {viewMode === 'gantt' && (
                <div className="text-center py-12 text-muted-foreground">Vue Gantt à venir (Placeholder)</div>
            )}

            <NewTaskModal
                key={editingTask ? editingTask.id : 'new'}
                open={isNewTaskOpen}
                onOpenChange={setIsNewTaskOpen}
                projects={projects}
                consultants={consultants}
                task={editingTask}
            />

            <TaskDetailsModal
                open={!!selectedTask}
                onOpenChange={(open) => !open && setSelectedTask(null)}
                task={selectedTask}
                currentUser={currentUser}
                onEdit={handleEditTask}
                onStatusChange={() => {
                    if (selectedTask) handleStatusChange(selectedTask)
                }}
            />

            <TaskStatusModal
                key={statusTask?.id}
                open={!!statusTask}
                onOpenChange={(open) => !open && setStatusTask(null)}
                task={statusTask}
                currentUserId={currentUser?.id || ''}
                isDirector={(currentUser as any)?.role === 'DIRECTOR'}
            />
        </div>
    )
}
