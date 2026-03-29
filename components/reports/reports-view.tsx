'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { getMonthlySummary, getFinancialReport, getTaskReport, getConsultantReport } from "@/app/actions/reports"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { cn } from "@/lib/utils"

export default function ReportsView() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)
    const [currentTab, setCurrentTab] = useState("summary")
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    })

    const handleGenerate = async () => {
        setLoading(true)
        try {
            let result
            if (currentTab === 'summary') result = await getMonthlySummary(dateRange)
            else if (currentTab === 'financial') result = await getFinancialReport(dateRange)
            else if (currentTab === 'tasks') result = await getTaskReport(dateRange)
            else if (currentTab === 'consultants') result = await getConsultantReport(dateRange)

            if (result?.success) setData(result.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportPDF = () => {
        if (!data) return

        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.setTextColor(41, 128, 185) // Blue color
        doc.text("Optimum Juridis Finance", 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Rapport: ${currentTab === 'summary' ? 'Résumé Mensuel' :
            currentTab === 'financial' ? 'Rapport Financier' :
                currentTab === 'tasks' ? 'Rapport des Tâches' :
                    'Performance Consultants'
            }`, 14, 30)

        doc.text(`Période: ${dateRange.startDate} au ${dateRange.endDate}`, 14, 35)

        doc.setDrawColor(200)
        doc.line(14, 38, 196, 38)

        // Content
        if (currentTab === 'summary') {
            doc.setFontSize(12)
            doc.setTextColor(0)
            doc.text("Aperçu Financier", 14, 50)

            autoTable(doc, {
                startY: 55,
                head: [['Métrique', 'Valeur', 'Devise']],
                body: [
                    ['Revenus Totaux', data.income.toLocaleString('fr-FR'), 'FCFA'],
                    ['Dépenses Totales', data.expenses.toLocaleString('fr-FR'), 'FCFA'],
                    ['Résultat Net', data.net.toLocaleString('fr-FR'), 'FCFA'],
                ],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            })

            doc.text("Activité", 14, (doc as any).lastAutoTable.finalY + 15)
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Métrique', 'Quantité']],
                body: [
                    ['Projets Actifs', data.activeProjects],
                    ['Nouveaux Projets', data.newProjects],
                    ['Tâches Complétées', data.completedTasks],
                ],
                theme: 'striped',
                headStyles: { fillColor: [52, 73, 94] }
            })

        } else if (currentTab === 'financial') {
            autoTable(doc, {
                startY: 45,
                head: [['Date', 'Type', 'Description', 'Montant (FCFA)', 'Catégorie']],
                body: data.map((entry: any) => [
                    new Date(entry.date).toLocaleDateString('fr-FR'),
                    entry.type === 'INCOME' ? 'Revenu' : 'Dépense',
                    entry.description,
                    Number(entry.amount).toLocaleString('fr-FR'),
                    entry.category || '-'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            })

        } else if (currentTab === 'tasks') {
            // Stats
            doc.text(`Total: ${data.stats.total} | Complétées: ${data.stats.completed} | En cours: ${data.stats.inProgress} | En retard: ${data.stats.overdue}`, 14, 45)

            autoTable(doc, {
                startY: 50,
                head: [['Titre', 'Projet', 'Status', 'Assigné à', 'Date Limite']],
                body: data.tasks.map((task: any) => [
                    task.title,
                    task.project?.name || '-',
                    task.status,
                    task.assignees?.map((a: any) => a.name).join(', ') || '-',
                    task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '-'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            })

        } else if (currentTab === 'consultants') {
            autoTable(doc, {
                startY: 45,
                head: [['Nom', 'Niveau', 'Tâches Complétées', 'Projets Actifs', 'Heures Total', 'Note']],
                body: data.map((c: any) => [
                    c.name,
                    c.level,
                    c.completedTasks,
                    c.activeProjects,
                    c.totalHours,
                    c.rating + '/5'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            })
        }

        doc.save(`rapport_${currentTab}_${dateRange.startDate}.pdf`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 bg-slate-50 p-4 rounded-lg border">
                <div className="grid gap-1 flex-1 md:flex-none">
                    <label className="text-xs font-medium">Date début</label>
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    />
                </div>
                <div className="grid gap-1 flex-1 md:flex-none">
                    <label className="text-xs font-medium">Date fin</label>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    />
                </div>
                <div className="flex items-end pt-0 md:pt-5 w-full md:w-auto">
                    <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Générer Rapport
                    </Button>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                <TabsList className="flex flex-wrap h-auto">
                    <TabsTrigger value="summary" className="flex-1">Résumé Mensuel</TabsTrigger>
                    <TabsTrigger value="financial" className="flex-1">Finance</TabsTrigger>
                    <TabsTrigger value="tasks" className="flex-1">Tâches</TabsTrigger>
                    <TabsTrigger value="consultants" className="flex-1">Consultants</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                    {data && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {data.income?.toLocaleString('fr-FR')} FCFA
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {data.expenses?.toLocaleString('fr-FR')} FCFA
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${data.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {data.net?.toLocaleString('fr-FR')} FCFA
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data.activeProjects}</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="financial">
                    {data && Array.isArray(data) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Détail Financier</CardTitle>
                                <CardDescription>Liste des entrées et sorties sur la période.</CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <div className="space-y-2 min-w-[500px]">
                                    {data.slice(0, 10).map((entry: any) => (
                                        <div key={entry.id} className="flex justify-between items-center p-2 border-b">
                                            <div>
                                                <div className="font-medium">{entry.description}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString('fr-FR')}</div>
                                            </div>
                                            <div className={`font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                {entry.type === 'INCOME' ? '+' : '-'} {Number(entry.amount).toLocaleString('fr-FR')} FCFA
                                            </div>
                                        </div>
                                    ))}
                                    {data.length > 10 && <div className="text-center text-sm text-muted-foreground pt-2">Et {data.length - 10} autres... Exportez le PDF pour voir tout.</div>}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="tasks">
                    {data && data.stats && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">{data.stats.total}</div>
                                        <p className="text-xs text-muted-foreground">Total Tâches</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-green-600">{data.stats.completed}</div>
                                        <p className="text-xs text-muted-foreground">Complétées</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-blue-600">{data.stats.inProgress}</div>
                                        <p className="text-xs text-muted-foreground">En cours</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold text-red-600">{data.stats.overdue}</div>
                                        <p className="text-xs text-muted-foreground">En retard</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="consultants">
                    {data && Array.isArray(data) && (
                        <Card>
                            <CardContent className="pt-6 overflow-x-auto">
                                <div className="space-y-4 min-w-[500px]">
                                    {data.map((c: any) => (
                                        <div key={c.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-semibold">{c.name}</div>
                                                <div className="text-xs text-muted-foreground">{c.level}</div>
                                            </div>
                                            <div className="flex space-x-6 text-sm">
                                                <div className="text-center">
                                                    <div className="font-bold">{c.completedTasks}</div>
                                                    <div className="text-xs text-muted-foreground">Tâches</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold">{c.totalHours}</div>
                                                    <div className="text-xs text-muted-foreground">Heures</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-amber-600">{c.rating}/5</div>
                                                    <div className="text-xs text-muted-foreground">Note</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {data && (
                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={exportPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter en PDF
                    </Button>
                </div>
            )}
        </div>
    )
}
