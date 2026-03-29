'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    LayoutGrid,
    List,
    Plus,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ProjectCard } from "./project-card"
import { ProjectRow } from "./project-row"
import { NewProjectModal } from "./new-project-modal"
import { ViewProjectModal } from "./view-project-modal"
import { ProjectStatusModal } from "./project-status-modal"

interface ProjectsViewProps {
    initialProjects: any[]
    consultants: any[]
    currentUserRole?: string
}

export function ProjectsView({ initialProjects, consultants, currentUserRole }: ProjectsViewProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<any>(null)

    // New state for update/status
    const [editingProject, setEditingProject] = useState<any>(null)
    const [statusProject, setStatusProject] = useState<any>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    // ... search handlers ...

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set("search", term)
        } else {
            params.delete("search")
        }
        router.replace(`/projects?${params.toString()}`)
    }

    const handleStatusfilter = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (status && status !== "ALL") {
            params.set("status", status)
        } else {
            params.delete("status")
        }
        router.replace(`/projects?${params.toString()}`)
    }

    // Actions passed down to children
    const handleEdit = (project: any) => {
        setEditingProject(project)
    }

    const handleStatusChange = (project: any) => {
        setStatusProject(project)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez et suivez tous vos dossiers juridiques
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsNewProjectOpen(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Projet
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                            <div className="relative flex-1 w-full sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher projets, clients..."
                                    className="pl-10"
                                    defaultValue={searchParams.get("search")?.toString()}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                defaultValue={searchParams.get("status") || "ALL"}
                                onValueChange={handleStatusfilter}
                            >
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                                    <SelectItem value="PENDING">En attente</SelectItem>
                                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                                    <SelectItem value="COMPLETED">Terminé</SelectItem>
                                    <SelectItem value="ON_HOLD">En pause</SelectItem>
                                </SelectContent>
                            </Select>
                            {currentUserRole === 'DIRECTOR' && (
                                <Select onValueChange={(val) => {
                                    // Filter by consultant (Director only) logic
                                    const params = new URLSearchParams(searchParams.toString())
                                    if (val === 'ALL') params.delete('consultantId')
                                    else params.set('consultantId', val)
                                    router.replace(`/projects?${params.toString()}`)
                                }}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Consultant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les consultants</SelectItem>
                                        {consultants.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="hidden md:flex border rounded-md bg-muted/50 p-1">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {initialProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => setSelectedProject(project)}
                            onEdit={() => handleEdit(project)}
                            onStatusChange={() => handleStatusChange(project)}
                        />
                    ))}
                    {initialProjects.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            Aucun projet trouvé.
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Projet / Client</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Priorité</TableHead>
                                <TableHead>Progression</TableHead>
                                <TableHead>Équipe</TableHead>
                                <TableHead>Date limite</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialProjects.map((project) => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    onClick={() => setSelectedProject(project)}
                                    onEdit={() => handleEdit(project)}
                                    onStatusChange={() => handleStatusChange(project)}
                                />
                            ))}
                            {initialProjects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center">
                                        Aucun projet trouvé.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Modal */}
            <NewProjectModal
                open={isNewProjectOpen}
                onOpenChange={setIsNewProjectOpen}
                consultants={consultants}
            />

            {/* Edit Modal (reuses NewProjectModal) */}
            <NewProjectModal
                key={editingProject?.id} // Force re-mount when project changes
                project={editingProject}
                open={!!editingProject}
                onOpenChange={(open) => !open && setEditingProject(null)}
                consultants={consultants}
            />

            {/* Status Modal */}
            <ProjectStatusModal
                key={statusProject?.id}
                project={statusProject}
                open={!!statusProject}
                onOpenChange={(open) => !open && setStatusProject(null)}
            />

            {/* View Modal */}
            <ViewProjectModal
                project={selectedProject}
                open={!!selectedProject}
                onOpenChange={(open) => !open && setSelectedProject(null)}
                // We should probably pass edit/status handlers here too if we want actions inside the modal to work
                onEdit={() => {
                    setEditingProject(selectedProject)
                    // Keep view modal open? Or close? User usually expects to edit ON TOP of view or switch.
                    // Taskora behavior: usually opens edit modal OVER view modal.
                }}
                onStatusChange={() => {
                    setStatusProject(selectedProject)
                }}
            />
        </div>
    )
}
