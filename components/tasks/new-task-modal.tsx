'use client'

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTask, updateTask } from "@/app/actions/tasks"
import { TaskSchema, TaskInput } from "@/lib/schemas"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, X } from "lucide-react"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface NewTaskModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projects: any[]
    consultants: any[]
    task?: any
}

export function NewTaskModal({ open, onOpenChange, projects, consultants, task }: NewTaskModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [selectedConsultants, setSelectedConsultants] = useState<string[]>(
        task?.assignees?.map((a: any) => a.id) || []
    )

    // Load existing subtasks or empty
    // We store id if it exists, so we know it's not new
    const [subtasks, setSubtasks] = useState<{ value: string, id?: string }[]>(
        task?.subtasks?.map((s: any) => ({ value: s.title, id: s.id })) || []
    )

    // If task changes (e.g. from props), we might need useEffect, but key prop in parent handles reset.
    // However, if we just close/reopen for same task, state persists? 
    // The parent uses `key={editingTask ? editingTask.id : 'new'}` so it resets.

    const form = useForm<TaskInput>({
        resolver: zodResolver(TaskSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            status: (task?.status as any) || "TODO",
            priority: task?.priority || 1,
            budgetDebours: Number(task?.budgetDebours) || 0,
            budgetPerdiem: Number(task?.budgetPerdiem) || 0,
            budgetTransport: Number(task?.budgetTransport) || 0,
            initialSubtasks: [],
            assigneeIds: task?.assignees?.map((a: any) => a.id) || [],
            projectId: task?.projectId || "",
            dueDate: task?.dueDate ? new Date(task.dueDate) : undefined
        }
    })

    const onSubmit = async (data: TaskInput) => {
        startTransition(async () => {
            try {
                const formattedData = {
                    ...data,
                    // For creation, we send initialSubtasks
                    initialSubtasks: !task ? subtasks.filter(s => s.value.trim().length > 0).map(s => s.value) : undefined
                }

                let result;
                if (task) {
                    result = await updateTask(task.id, formattedData)

                    // Handle new subtasks for Edit mode
                    const newSubtasks = subtasks.filter(s => !s.id && s.value.trim().length > 0)
                    if (newSubtasks.length > 0) {
                        // Import addSubtask dynamically or assume it's imported
                        const { addSubtask } = await import("@/app/actions/tasks")
                        await Promise.all(newSubtasks.map(s => addSubtask(task.id, s.value)))
                    }
                } else {
                    result = await createTask(formattedData)
                }

                if (result.success) {
                    onOpenChange(false)
                    form.reset()
                    if (!task) {
                        setSelectedConsultants([])
                        setSubtasks([])
                    }
                } else {
                    console.error(result.error)
                }
            } catch (error) {
                console.error(error)
            }
        })
    }

    const toggleConsultant = (id: string) => {
        const newSelection = selectedConsultants.includes(id)
            ? selectedConsultants.filter(c => c !== id)
            : [...selectedConsultants, id]

        setSelectedConsultants(newSelection)
        form.setValue('assigneeIds', newSelection)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-full sm:h-auto sm:max-w-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{task ? "Modifier la Tâche" : "Nouvelle Tâche"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">Général</TabsTrigger>
                                <TabsTrigger value="budget">Budget</TabsTrigger>
                                <TabsTrigger value="subtasks">Sous-tâches</TabsTrigger>
                                <TabsTrigger value="files">Fichiers</TabsTrigger>
                            </TabsList>

                            {/* GENERAL TAB */}
                            <TabsContent value="general" className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre du livrable *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Rédaction contrat..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="projectId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Projet *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un projet" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {projects.map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Statut</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Satut actuel" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="TODO">À faire</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                                                        <SelectItem value="REVIEW">Revue</SelectItem>
                                                        <SelectItem value="COMPLETED">Terminé</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date limite</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP", { locale: fr })
                                                                ) : (
                                                                    <span>Choisir une date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="priority"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Priorité</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Niveau de priorité" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">Basse</SelectItem>
                                                        <SelectItem value="2">Moyenne</SelectItem>
                                                        <SelectItem value="3">Haute</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <FormLabel>Assignés</FormLabel>
                                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
                                        {selectedConsultants.map(id => {
                                            const consultant = consultants.find(c => c.id === id)
                                            return (
                                                <div key={id} onClick={() => toggleConsultant(id)} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                                                    <span>{consultant?.name}</span>
                                                    <X className="h-3 w-3" />
                                                </div>
                                            )
                                        })}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full border border-dashed">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-2" align="start">
                                                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                                    {consultants.map(c => (
                                                        <div
                                                            key={c.id}
                                                            className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer ${selectedConsultants.includes(c.id) ? 'bg-primary/5' : ''}`}
                                                            onClick={() => toggleConsultant(c.id)}
                                                        >
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={c.avatar} />
                                                                <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm truncate">{c.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Détails de la tâche..." className="resize-none h-24" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* BUDGET TAB */}
                            <TabsContent value="budget" className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="budgetDebours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Débours (FCFA)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budgetPerdiem"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Perdiem (FCFA)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budgetTransport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transport (FCFA)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-4 bg-muted/20 rounded-lg flex justify-between items-center">
                                    <span className="font-medium">Total Estimé</span>
                                    <span className="text-xl font-bold text-primary">
                                        {((Number(form.watch("budgetDebours")) || 0) +
                                            (Number(form.watch("budgetPerdiem")) || 0) +
                                            (Number(form.watch("budgetTransport")) || 0)).toFixed(0)} FCFA
                                    </span>
                                </div>
                            </TabsContent>

                            {/* SUBTASKS TAB */}
                            <TabsContent value="subtasks" className="pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Liste de contrôle</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSubtasks([...subtasks, { value: "" }])}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Ajouter
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {subtasks.map((st, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={st.value}
                                                    onChange={(e) => {
                                                        const newSubtasks = [...subtasks]
                                                        newSubtasks[index].value = e.target.value
                                                        setSubtasks(newSubtasks)
                                                    }}
                                                    placeholder={`Sous-tâche ${index + 1}`}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        ))}
                                        {subtasks.length === 0 && (
                                            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-md">
                                                Aucune sous-tâche définie
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* FILES TAB */}
                            <TabsContent value="files" className="pt-4">
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                                    <p className="text-muted-foreground text-sm mb-4">Glissez-déposez vos fichiers ici</p>
                                    <Button variant="outline" onClick={(e) => e.preventDefault()}>
                                        Parcourir
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">(Fonctionnalité à venir)</p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {task ? "Enregistrer" : "Créer la tâche"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
