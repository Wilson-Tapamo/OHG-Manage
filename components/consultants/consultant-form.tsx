'use client'

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ConsultantSchema, ConsultantInput } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createConsultant, updateConsultant } from "@/app/actions/users"
import { Plus, Trash, X } from "lucide-react"

interface ConsultantFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    consultant?: any
}

export function ConsultantForm({ open, onOpenChange, consultant }: ConsultantFormProps) {
    const isEditing = !!consultant

    // Parse JSON fields if they come from DB as strings/JSON
    const defaultValues: Partial<ConsultantInput> = {
        name: consultant?.name || "",
        email: consultant?.email || "",
        phone: consultant?.phone || "",
        title: consultant?.title || "",
        description: consultant?.description || "",
        hourlyRate: Number(consultant?.hourlyRate) || 0,
        level: consultant?.level || "JUNIOR",
        rating: Number(consultant?.rating) || 0,
        skills: Array.isArray(consultant?.skills) ? consultant.skills : [],
        education: Array.isArray(consultant?.education) ? consultant.education : [],
        experience: Array.isArray(consultant?.experience) ? consultant.experience : [],
    }

    const form = useForm<ConsultantInput>({
        resolver: zodResolver(ConsultantSchema),
        defaultValues: defaultValues as any,
    })

    // Reset form when consultant changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                name: consultant?.name || "",
                email: consultant?.email || "",
                phone: consultant?.phone || "",
                title: consultant?.title || "",
                description: consultant?.description || "",
                hourlyRate: Number(consultant?.hourlyRate) || 0,
                level: consultant?.level || "JUNIOR",
                rating: Number(consultant?.rating) || 0,
                skills: Array.isArray(consultant?.skills) ? consultant.skills : [],
                education: Array.isArray(consultant?.education) ? consultant.education : [],
                experience: Array.isArray(consultant?.experience) ? consultant.experience : [],
            })
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
                title: "",
                description: "",
                hourlyRate: 0,
                level: "JUNIOR",
                rating: 0,
                skills: [],
                education: [],
                experience: [],
            })
        }
    }, [consultant, open, form])

    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
        control: form.control,
        name: "education"
    })

    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
        control: form.control,
        name: "experience"
    })

    const [newSkill, setNewSkill] = useState("")

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault()
            const currentSkills = form.getValues("skills") || []
            if (!currentSkills.includes(newSkill.trim())) {
                form.setValue("skills", [...currentSkills, newSkill.trim()])
            }
            setNewSkill("")
        }
    }

    const removeSkill = (skill: string) => {
        const currentSkills = form.getValues("skills") || []
        form.setValue("skills", currentSkills.filter(s => s !== skill))
    }

    async function onSubmit(data: ConsultantInput) {
        let res
        if (isEditing) {
            res = await updateConsultant(consultant.id, data)
        } else {
            res = await createConsultant(data)
        }

        if (res.success) {
            onOpenChange(false)
            form.reset()
        } else {
            console.error(res.error)
            // Show toast error
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Modifier le consultant" : "Ajouter un consultant"}</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations du profil consultant.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="general">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="general">Général</TabsTrigger>
                                <TabsTrigger value="details">Bio & Compétences</TabsTrigger>
                                <TabsTrigger value="history">Parcours</TabsTrigger>
                            </TabsList>

                            {/* General Tab */}
                            <TabsContent value="general" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom complet</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input {...field} type="email" disabled={isEditing} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Titre du poste</FormLabel>
                                            <FormControl><Input {...field} placeholder="ex: Senior Legal Advisor" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                {!isEditing && (
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe temporaire</FormLabel>
                                            <FormControl><Input {...field} type="password" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField control={form.control} name="level" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Niveau</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="JUNIOR">Junior</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                                                    <SelectItem value="SENIOR">Senior</SelectItem>
                                                    <SelectItem value="DIRECTOR">Directeur</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taux Horaire (FCFA)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="rating" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Note (0-5)</FormLabel>
                                            <FormControl><Input type="number" step="0.1" min="0" max="5" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </TabsContent>

                            {/* Bio & Skills Tab */}
                            <TabsContent value="details" className="space-y-4 py-4">
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Biographie / Description</FormLabel>
                                        <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div>
                                    <FormLabel>Compétences</FormLabel>
                                    <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md min-h-[40px] bg-muted/20">
                                        {form.watch("skills")?.map((skill, index) => (
                                            <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                        <Input
                                            className="border-none shadow-none focus-visible:ring-0 w-[150px] h-6 p-0 bg-transparent text-sm"
                                            placeholder="Ajouter + Entrée"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={handleAddSkill}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Appuyez sur Entrée pour ajouter une compétence</p>
                                </div>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="space-y-6 py-4">
                                {/* Education */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold">Formation</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ degree: "", school: "", year: "" })}>
                                            <Plus className="h-3 w-3 mr-1" /> Ajouter
                                        </Button>
                                    </div>
                                    {eduFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-3 gap-2 items-end border p-2 rounded-md bg-muted/10 relative group">
                                            <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">Diplôme</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`education.${index}.school`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">École</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`education.${index}.year`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">Année</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeEdu(index)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Experience */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold">Expérience Pro</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: "", company: "", duration: "", description: "" })}>
                                            <Plus className="h-3 w-3 mr-1" /> Ajouter
                                        </Button>
                                    </div>
                                    {expFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-3 gap-2 items-end border p-2 rounded-md bg-muted/10 relative group">
                                            <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">Poste</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">Entreprise</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`experience.${index}.duration`} render={({ field }) => (
                                                <FormItem><FormLabel className="text-[10px]">Durée</FormLabel><FormControl><Input {...field} className="h-8 text-xs" /></FormControl></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExp(index)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
