'use client'

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Clock, AlertCircle } from "lucide-react"
import { updateTaskStatus, getTaskHours } from "@/app/actions/tasks"
import { cn, getInitials } from "@/lib/utils"

interface TaskStatusModalProps {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUserId: string
    isDirector: boolean
}

const statuses = [
    { value: "TODO", label: "À faire", description: "La tâche est créée mais pas encore commencée.", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    { value: "IN_PROGRESS", label: "En cours", description: "Travail actif en cours sur cette tâche.", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { value: "REVIEW", label: "Revue", description: "La tâche est terminée et en attente de validation.", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { value: "COMPLETED", label: "Terminé", description: "La tâche est validée et clôturée.", color: "bg-green-500/10 text-green-500 border-green-500/20", directorOnly: true },
]

export function TaskStatusModal({ task, open, onOpenChange, currentUserId, isDirector }: TaskStatusModalProps) {
    const [isPending, setIsPending] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>(task?.status || "TODO")
    const [showHoursForm, setShowHoursForm] = useState(false)
    const [existingHours, setExistingHours] = useState<any[]>([])
    const [hoursData, setHoursData] = useState<{ [userId: string]: { hours: number, description: string } }>({})
    const [error, setError] = useState<string | null>(null)

    // Load existing hours when opening for COMPLETED status
    useEffect(() => {
        if (open && task && (selectedStatus === 'REVIEW' || selectedStatus === 'COMPLETED')) {
            loadExistingHours()
        }
    }, [open, task, selectedStatus])

    async function loadExistingHours() {
        if (!task) return
        const result = await getTaskHours(task.id)
        if (result.success && result.data) {
            setExistingHours(result.data)
            // Pre-fill hours data
            const initial: any = {}
            result.data.forEach((h: any) => {
                initial[h.userId] = { hours: Number(h.hours), description: h.description || '' }
            })
            // Add missing assignees
            task.assignees?.forEach((a: any) => {
                if (!initial[a.id]) {
                    initial[a.id] = { hours: 0, description: '' }
                }
            })
            setHoursData(initial)
        }
    }

    async function handleSubmit() {
        if (!task) return
        setIsPending(true)
        setError(null)

        try {
            // For REVIEW/COMPLETED, we need to check if hours are required
            if ((selectedStatus === 'REVIEW' || selectedStatus === 'COMPLETED') && !showHoursForm) {
                // First attempt without hours to see if they're needed
                const result = await updateTaskStatus(task.id, selectedStatus)

                if (!result.success) {
                    if (result.error === 'HOURS_REQUIRED' || result.error === 'HOURS_REQUIRED_SELF') {
                        setShowHoursForm(true)
                        await loadExistingHours()
                        setIsPending(false)
                        return
                    } else {
                        setError(result.error || "Erreur")
                        setIsPending(false)
                        return
                    }
                }

                onOpenChange(false)
            } else if (showHoursForm) {
                // Submit with hours data
                const hoursArray = Object.entries(hoursData)
                    .filter(([_, v]) => v.hours > 0)
                    .map(([userId, v]) => ({
                        userId,
                        hours: v.hours,
                        description: v.description || undefined
                    }))

                const result = await updateTaskStatus(task.id, selectedStatus, hoursArray)

                if (result.success) {
                    onOpenChange(false)
                    setShowHoursForm(false)
                } else {
                    setError(result.error || "Erreur")
                }
            } else {
                // Simple status change (TODO, IN_PROGRESS)
                const result = await updateTaskStatus(task.id, selectedStatus)
                if (result.success) {
                    onOpenChange(false)
                } else {
                    setError(result.error || "Erreur")
                }
            }
        } catch (error) {
            console.error(error)
            setError("Une erreur est survenue")
        } finally {
            setIsPending(false)
        }
    }

    if (!task) return null

    // Get assignees to show in hours form
    const assigneesToShow = showHoursForm
        ? (isDirector || selectedStatus === 'COMPLETED'
            ? task.assignees || []
            : (task.assignees || []).filter((a: any) => a.id === currentUserId))
        : []

    // Check if current user already logged hours
    const currentUserHasLogged = existingHours.some(h => h.userId === currentUserId)

    // Check validation
    const canSubmitHours = assigneesToShow.every((a: any) =>
        hoursData[a.id]?.hours > 0 || existingHours.some(h => h.userId === a.id)
    )

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) setShowHoursForm(false); onOpenChange(o); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {showHoursForm ? (
                            <span className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Enregistrer les Heures
                            </span>
                        ) : (
                            "Changer le statut"
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {showHoursForm
                            ? selectedStatus === 'REVIEW'
                                ? "Renseignez le nombre d'heures que vous avez passées sur cette tâche."
                                : "Vérifiez ou renseignez les heures de chaque consultant avant de terminer la tâche."
                            : <>Sélectionnez le nouveau statut pour la tâche <strong>{task.title}</strong>.</>
                        }
                    </DialogDescription>
                </DialogHeader>

                {!showHoursForm ? (
                    <div className="py-4">
                        <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="grid grid-cols-1 gap-3">
                            {statuses.map((status) => {
                                const isDisabled = status.directorOnly && !isDirector
                                return (
                                    <div key={status.value}>
                                        <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" disabled={isDisabled} />
                                        <Label
                                            htmlFor={status.value}
                                            className={cn(
                                                "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                                                selectedStatus === status.value ? "border-primary bg-primary/5" : "",
                                                isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                            )}
                                        >
                                            <div className="flex w-full items-center justify-between mb-1">
                                                <span className="font-semibold">{status.label}</span>
                                                {isDisabled && (
                                                    <span className="text-xs text-muted-foreground">Directeur uniquement</span>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground font-normal">
                                                {status.description}
                                            </span>
                                        </Label>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm font-medium">{task.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{task.project?.name}</div>
                        </div>

                        {assigneesToShow.map((assignee: any) => {
                            const existingEntry = existingHours.find(h => h.userId === assignee.id)
                            const isLogged = !!existingEntry

                            return (
                                <div key={assignee.id} className="p-4 border rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={assignee.avatar} />
                                                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{assignee.name}</span>
                                        </div>
                                        {isLogged && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                {Number(existingEntry.hours)}h déjà enregistrées
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Heures travaillées *</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                placeholder="0"
                                                value={hoursData[assignee.id]?.hours || ''}
                                                onChange={(e) => setHoursData(prev => ({
                                                    ...prev,
                                                    [assignee.id]: {
                                                        ...prev[assignee.id],
                                                        hours: parseFloat(e.target.value) || 0
                                                    }
                                                }))}
                                                disabled={isLogged && !isDirector}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Description (optionnel)</Label>
                                        <Textarea
                                            placeholder="Travail effectué..."
                                            className="resize-none h-16 text-sm"
                                            value={hoursData[assignee.id]?.description || ''}
                                            onChange={(e) => setHoursData(prev => ({
                                                ...prev,
                                                [assignee.id]: {
                                                    ...prev[assignee.id],
                                                    description: e.target.value
                                                }
                                            }))}
                                            disabled={isLogged && !isDirector}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => { setShowHoursForm(false); onOpenChange(false); }}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || (selectedStatus === task.status && !showHoursForm) || (showHoursForm && !canSubmitHours)}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {showHoursForm
                            ? (selectedStatus === 'REVIEW' ? 'Passer en Revue' : 'Terminer la Tâche')
                            : 'Enregistrer'
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
