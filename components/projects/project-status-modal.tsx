'use client'

import { useState } from "react"
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
import { Loader2 } from "lucide-react"
import { updateProjectStatus } from "@/app/actions/projects"
import { cn } from "@/lib/utils"

interface ProjectStatusModalProps {
    project: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

const statuses = [
    { value: "PENDING", label: "En attente", description: "Le dossier est créé mais pas encore démarré.", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { value: "IN_PROGRESS", label: "En cours", description: "Travail actif en cours sur ce dossier.", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { value: "ON_HOLD", label: "En pause", description: "Le projet est temporairement suspendu.", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { value: "COMPLETED", label: "Terminé", description: "Le dossier est finalisé et clôturé.", color: "bg-green-500/10 text-green-500 border-green-500/20" },
]

export function ProjectStatusModal({ project, open, onOpenChange }: ProjectStatusModalProps) {
    const [isPending, setIsPending] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>(project?.status || "PENDING")

    // Update local state if project changes
    if (project && project.status !== selectedStatus) {
        // This causes infinite loop if we don't check prev
        // Better to use key on dialog in parent
    }

    async function handleSubmit() {
        if (!project) return
        setIsPending(true)
        try {
            const result = await updateProjectStatus(project.id, selectedStatus as any)
            if (result.success) {
                onOpenChange(false)
            } else {
                console.error(result.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsPending(false)
        }
    }

    if (!project) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Changer le statut</DialogTitle>
                    <DialogDescription>
                        Sélectionnez le nouveau statut pour le dossier <strong>{project.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="grid grid-cols-1 gap-3">
                        {statuses.map((status) => (
                            <div key={status.value}>
                                <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" />
                                <Label
                                    htmlFor={status.value}
                                    className={cn(
                                        "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                                        selectedStatus === status.value ? "border-primary bg-primary/5" : ""
                                    )}
                                >
                                    <div className="flex w-full items-center justify-between mb-1">
                                        <span className="font-semibold">{status.label}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground font-normal">
                                        {status.description}
                                    </span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isPending || selectedStatus === project.status}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
