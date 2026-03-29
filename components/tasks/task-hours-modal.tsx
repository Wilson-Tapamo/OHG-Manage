'use client'

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Loader2, Clock } from "lucide-react"

interface HoursEntry {
    userId: string
    userName: string
    avatar?: string
    hours: number
    description?: string
    hourlyRate?: number
    logged?: boolean
}

interface TaskHoursModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: any
    assignees: HoursEntry[]
    currentUserId: string
    isDirector: boolean
    targetStatus: 'REVIEW' | 'COMPLETED'
    onSubmit: (hoursData: { userId: string, hours: number, description?: string }[]) => Promise<{ success: boolean, error?: string }>
}

export function TaskHoursModal({
    open,
    onOpenChange,
    task,
    assignees,
    currentUserId,
    isDirector,
    targetStatus,
    onSubmit
}: TaskHoursModalProps) {
    const [isPending, startTransition] = useTransition()
    const [hours, setHours] = useState<{ [userId: string]: { hours: number, description: string } }>(() => {
        const initial: { [key: string]: { hours: number, description: string } } = {}
        assignees.forEach(a => {
            initial[a.userId] = { hours: a.hours || 0, description: a.description || '' }
        })
        return initial
    })

    const handleSubmit = () => {
        startTransition(async () => {
            const hoursData = Object.entries(hours)
                .filter(([_, v]) => v.hours > 0)
                .map(([userId, v]) => ({
                    userId,
                    hours: v.hours,
                    description: v.description || undefined
                }))

            const result = await onSubmit(hoursData)
            if (result.success) {
                onOpenChange(false)
            }
        })
    }

    // For consultant going to REVIEW, only show their own entry
    const displayAssignees = isDirector || targetStatus === 'COMPLETED'
        ? assignees
        : assignees.filter(a => a.userId === currentUserId)

    const missingAssignees = displayAssignees.filter(a => !a.logged && (!hours[a.userId] || hours[a.userId].hours <= 0))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Enregistrer les Heures
                    </DialogTitle>
                    <DialogDescription>
                        {targetStatus === 'REVIEW'
                            ? "Renseignez le nombre d'heures que vous avez passées sur cette tâche."
                            : "Vérifiez ou renseignez les heures de chaque consultant avant de terminer la tâche."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-sm font-medium">{task?.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{task?.project?.name}</div>
                    </div>

                    <div className="space-y-4">
                        {displayAssignees.map(assignee => (
                            <div key={assignee.userId} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={assignee.avatar} />
                                            <AvatarFallback>{getInitials(assignee.userName)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm">{assignee.userName}</div>
                                            {assignee.hourlyRate && (
                                                <div className="text-xs text-muted-foreground">
                                                    {Number(assignee.hourlyRate).toLocaleString()} FCFA/h
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {assignee.logged && (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            Déjà renseigné
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`hours-${assignee.userId}`} className="text-xs">
                                            Heures travaillées *
                                        </Label>
                                        <Input
                                            id={`hours-${assignee.userId}`}
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="0"
                                            value={hours[assignee.userId]?.hours || ''}
                                            onChange={(e) => setHours(prev => ({
                                                ...prev,
                                                [assignee.userId]: {
                                                    ...prev[assignee.userId],
                                                    hours: parseFloat(e.target.value) || 0
                                                }
                                            }))}
                                            disabled={assignee.logged && !isDirector}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Montant estimé</Label>
                                        <div className="h-9 flex items-center text-sm font-medium text-primary">
                                            {((hours[assignee.userId]?.hours || 0) * Number(assignee.hourlyRate || 0)).toLocaleString()} FCFA
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor={`desc-${assignee.userId}`} className="text-xs">
                                        Description (optionnel)
                                    </Label>
                                    <Textarea
                                        id={`desc-${assignee.userId}`}
                                        placeholder="Travail effectué..."
                                        className="resize-none h-16 text-sm"
                                        value={hours[assignee.userId]?.description || ''}
                                        onChange={(e) => setHours(prev => ({
                                            ...prev,
                                            [assignee.userId]: {
                                                ...prev[assignee.userId],
                                                description: e.target.value
                                            }
                                        }))}
                                        disabled={assignee.logged && !isDirector}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {isDirector && targetStatus === 'COMPLETED' && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Total Heures</span>
                                <span className="text-lg font-bold">
                                    {Object.values(hours).reduce((sum, h) => sum + (h.hours || 0), 0)}h
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Montant Total</span>
                                <span className="text-lg font-bold text-primary">
                                    {displayAssignees.reduce((sum, a) =>
                                        sum + ((hours[a.userId]?.hours || 0) * Number(a.hourlyRate || 0)), 0
                                    ).toLocaleString()} FCFA
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || missingAssignees.length > 0}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {targetStatus === 'REVIEW' ? 'Passer en Revue' : 'Terminer la Tâche'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
