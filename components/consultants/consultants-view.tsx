'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
    Plus,
    Search,
    Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConsultantCard } from "./consultant-card"
import { ConsultantForm } from "./consultant-form"
import { ConsultantDetailsModal } from "./consultant-details-modal"

interface ConsultantsViewProps {
    consultants: any[]
}

export function ConsultantsView({ consultants: initialConsultants }: ConsultantsViewProps) {
    const [search, setSearch] = useState("")
    const [levelFilter, setLevelFilter] = useState("ALL")
    const [skillFilter, setSkillFilter] = useState("ALL")
    const [sortBy, setSortBy] = useState("name_asc")

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [viewConsultant, setViewConsultant] = useState<any>(null)
    const [editConsultant, setEditConsultant] = useState<any>(null)

    const router = useRouter()

    // Extract all unique skills from consultants
    const allSkills = useMemo(() => {
        const skills = new Set<string>()
        initialConsultants.forEach(c => {
            if (Array.isArray(c.skills)) {
                c.skills.forEach((skill: string) => skills.add(skill))
            }
        })
        return Array.from(skills).sort()
    }, [initialConsultants])

    // Client side filtering
    const filteredConsultants = initialConsultants.filter(c => {
        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.title?.toLowerCase().includes(search.toLowerCase())

        const matchLevel = levelFilter === "ALL" || c.level === levelFilter

        const matchSkill = skillFilter === "ALL" ||
            (Array.isArray(c.skills) && c.skills.includes(skillFilter))

        return matchSearch && matchLevel && matchSkill
    }).sort((a, b) => {
        if (sortBy === 'rate_desc') return Number(b.hourlyRate) - Number(a.hourlyRate)
        if (sortBy === 'rate_asc') return Number(a.hourlyRate) - Number(b.hourlyRate)
        if (sortBy === 'rating_desc') return b.rating - a.rating
        if (sortBy === 'projects_desc') return (b._count?.consultingProjects || 0) - (a._count?.consultingProjects || 0)
        return a.name.localeCompare(b.name)
    })

    const handleCreate = () => {
        setEditConsultant(null)
        setIsFormOpen(true)
    }

    const handleEdit = (consultant: any) => {
        setEditConsultant(consultant)
        setIsFormOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez votre équipe de consultants, leurs compétences et tarifs.
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un Consultant
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-2 flex-1 flex-wrap">
                            <div className="relative flex-1 w-full sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par nom, email, titre..."
                                    className="pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tous les niveaux</SelectItem>
                                    <SelectItem value="JUNIOR">Junior</SelectItem>
                                    <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                                    <SelectItem value="SENIOR">Senior</SelectItem>
                                    <SelectItem value="DIRECTOR">Directeur</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={skillFilter} onValueChange={setSkillFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Compétence" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Toutes compétences</SelectItem>
                                    {allSkills.map(skill => (
                                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                                    <SelectItem value="rate_desc">Taux (Décroissant)</SelectItem>
                                    <SelectItem value="rate_asc">Taux (Croissant)</SelectItem>
                                    <SelectItem value="rating_desc">Note (Décroissante)</SelectItem>
                                    <SelectItem value="projects_desc">Projets (Décroissant)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredConsultants.map(consultant => (
                    <ConsultantCard
                        key={consultant.id}
                        consultant={consultant}
                        onEdit={handleEdit}
                        onView={setViewConsultant}
                    // onDelete={handleDelete} // Optional
                    />
                ))}
            </div>

            {filteredConsultants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    Aucun consultant trouvé
                </div>
            )}

            <ConsultantForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                consultant={editConsultant}
            />

            <ConsultantDetailsModal
                open={!!viewConsultant}
                onOpenChange={(open) => !open && setViewConsultant(null)}
                consultant={viewConsultant}
            />
        </div>
    )
}
