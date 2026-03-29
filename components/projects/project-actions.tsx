"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Pencil, Trash, CheckCircle2 } from "lucide-react"
import { useState } from "react"
// We might need server actions for status change, or passed handlers
// For now, let's accept handlers or expose simple actions

interface ProjectActionsProps {
    project: any
    onView?: () => void
    onEdit?: () => void
    onStatusChange?: () => void
    // onDelete?: () => void
}

export function ProjectActions({ project, onView, onEdit, onStatusChange }: ProjectActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onStatusChange}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Changer statut
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
