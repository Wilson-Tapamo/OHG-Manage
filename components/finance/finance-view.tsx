'use client'

import { useState, useEffect, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
    Send,
    Eye,
    Trash2,
    Loader2,
    Receipt,
    Edit,
    Calendar as CalendarIcon,
} from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    getFinanceDashboard,
    getFinanceEntries,
    createFinanceEntry,
    deleteFinanceEntry
} from "@/app/actions/finance"
import {
    getInvoices,
    getInvoiceById,
    validateInvoice,
    markInvoiceAsPaid,
    deleteInvoice,
    addInvoiceLine,
    updateInvoiceLine,
    deleteInvoiceLine
} from "@/app/actions/invoices"

export function FinanceDirectorView() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isPending, startTransition] = useTransition()

    // Dashboard state
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)

    // Date Filters
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Invoices state
    const [invoices, setInvoices] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false)
    const [isAddLineOpen, setIsAddLineOpen] = useState(false)

    // Load dashboard data
    useEffect(() => {
        loadDashboard()
        loadInvoices()
    }, [startDate, endDate]) // Reload when filter changes

    async function loadDashboard() {
        const filters: any = {}
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate

        const result = await getFinanceDashboard(filters)
        if (result.success) {
            setDashboardData(result.data)
        }
    }

    async function loadInvoices() {
        const result = await getInvoices()
        if (result.success) {
            setInvoices(result.data || [])
        }
    }

    async function openInvoiceDetail(id: string) {
        const result = await getInvoiceById(id)
        if (result.success) {
            setSelectedInvoice(result.data)
            setIsInvoiceDetailOpen(true)
        }
    }

    const generateDashboardPDF = () => {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(20)
        doc.text("Rapport Financier - Optimum Juridis", 14, 22)

        doc.setFontSize(10)
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30)
        if (startDate || endDate) {
            doc.text(`Période: ${startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Début'} au ${endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Fin'}`, 14, 36)
        }

        // Summary
        const summaryData = [
            ['Revenus', 'Dépenses', 'Solde Net'],
            [
                `${(dashboardData?.totalIncome || 0).toLocaleString('fr-FR')} FCFA`,
                `${(dashboardData?.totalExpenses || 0).toLocaleString('fr-FR')} FCFA`,
                `${(dashboardData?.balance || 0).toLocaleString('fr-FR')} FCFA`
            ]
        ]

        autoTable(doc, {
            head: [summaryData[0]],
            body: [summaryData[1]],
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        })

        // Entries
        doc.text("Détail des mouvements", 14, (doc as any).lastAutoTable.finalY + 10)

        const entriesData = dashboardData?.entries?.map((e: any) => [
            new Date(e.date).toLocaleDateString('fr-FR'),
            e.description,
            e.category || '-',
            e.type === 'INCOME' ? 'Revenu' : 'Dépense',
            `${Number(e.amount).toLocaleString('fr-FR')} FCFA`
        ]) || []

        autoTable(doc, {
            head: [['Date', 'Description', 'Catégorie', 'Type', 'Montant']],
            body: entriesData,
            startY: (doc as any).lastAutoTable.finalY + 15,
            theme: 'striped'
        })

        doc.save('rapport_financier.pdf')
    }

    const generateInvoicePDF = (invoice: any) => {
        if (!invoice) return
        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.text("FACTURE", 14, 20)

        doc.setFontSize(10)
        doc.text(`N° ${invoice.number}`, 14, 30)
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, 14, 36)
        doc.text(`Statut: ${invoice.status}`, 14, 42)

        // Client Info
        doc.setFontSize(12)
        doc.text("Client:", 120, 30)
        doc.setFontSize(10)
        doc.text(invoice.project?.clientName || "Client Inconnu", 120, 36)
        if (invoice.project?.clientEmail) doc.text(invoice.project?.clientEmail, 120, 42)
        if (invoice.project?.clientPhone) doc.text(invoice.project?.clientPhone, 120, 48)

        // Lines
        const tableData = invoice.lines.map((line: any) => [
            line.description,
            Number(line.quantity),
            Number(line.unitPrice).toLocaleString('fr-FR'),
            Number(line.amount).toLocaleString('fr-FR')
        ])

        autoTable(doc, {
            head: [['Description', 'Qté', 'Prix Unit.', 'Total']],
            body: tableData,
            startY: 60,
            theme: 'grid',
            styles: { halign: 'right' },
            columnStyles: { 0: { halign: 'left' } }
        })

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.text(`Sous-total: ${Number(invoice.subtotal).toLocaleString('fr-FR')} FCFA`, 140, finalY, { align: 'right' })
        doc.text(`TVA (${Number(invoice.taxRate)}%): ${Number(invoice.tax).toLocaleString('fr-FR')} FCFA`, 140, finalY + 6, { align: 'right' })
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text(`Total TTC: ${Number(invoice.total).toLocaleString('fr-FR')} FCFA`, 140, finalY + 14, { align: 'right' })

        doc.save(`facture_${invoice.number}.pdf`)
    }

    const maxChartValue = dashboardData?.monthlyData
        ? Math.max(...dashboardData.monthlyData.map((m: any) => Math.max(m.income, m.expense)))
        : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Finances
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gestion financière et facturation automatique
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 max-w-[90vw]">
                <TabsList className="w-full md:w-fit items-center rounded-md bg-muted p-1 text-muted-foreground flex flex-wrap justify-start h-auto gap-2">
                    <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
                    <TabsTrigger value="invoices">Facturation</TabsTrigger>
                </TabsList>

                {/* DASHBOARD TAB */}
                <TabsContent value="dashboard" className="space-y-6">
                    {/* Filters and Actions */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-950 p-4 rounded-lg border shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium">Période:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                                <span className="text-slate-400">-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate("") }} className="h-9">
                                    Effacer
                                </Button>
                            )}
                        </div>
                        <Button variant="outline" onClick={generateDashboardPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            Exporter le rapport
                        </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                                        <ArrowDownLeft className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Revenus</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {(dashboardData?.totalIncome || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Dépenses</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {(dashboardData?.totalExpenses || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={`border-l-4 ${(dashboardData?.balance || 0) >= 0 ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${(dashboardData?.balance || 0) >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                                        <DollarSign className={`h-6 w-6 ${(dashboardData?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Solde Net</p>
                                        <p className={`text-2xl font-bold ${(dashboardData?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {(dashboardData?.balance || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution Mensuelle</CardTitle>
                            <CardDescription>Revenus et dépenses par mois</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData?.monthlyData?.map((month: any) => (
                                    <div key={month.month} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="w-12 text-slate-500 font-medium">{month.month}</span>
                                            <span className="text-xs text-slate-400">
                                                +{month.income.toLocaleString()} / -{month.expense.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 h-5">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-l"
                                                style={{ width: maxChartValue > 0 ? `${(month.income / maxChartValue) * 45}%` : '0%' }}
                                            />
                                            <div
                                                className="bg-gradient-to-r from-red-400 to-rose-500 rounded-r"
                                                style={{ width: maxChartValue > 0 ? `${(month.expense / maxChartValue) * 45}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-gradient-to-r from-green-500 to-emerald-600" />
                                    <span className="text-slate-500">Revenus</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-gradient-to-r from-red-400 to-rose-500" />
                                    <span className="text-slate-500">Dépenses</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Entries Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Entrées & Sorties</CardTitle>
                                <CardDescription>Historique des mouvements financiers</CardDescription>
                            </div>
                            <Button onClick={() => setIsAddEntryOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData?.entries?.length > 0 ? (
                                    dashboardData.entries.map((entry: any) => (
                                        <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${entry.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                    {entry.type === 'INCOME' ? (
                                                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{entry.description}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {entry.category || '-'} • {entry.project?.name || 'Général'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                                                <div className="text-right">
                                                    <p className={`font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {entry.type === 'INCOME' ? '+' : '-'}{Number(entry.amount).toLocaleString()} FCFA
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0"
                                                    onClick={async () => {
                                                        await deleteFinanceEntry(entry.id)
                                                        loadDashboard()
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucune entrée enregistrée
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INVOICES TAB */}
                <TabsContent value="invoices" className="space-y-6">
                    {/* Invoice Summary */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Total Factures</p>
                                <p className="text-2xl font-bold">{invoices.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Brouillons</p>
                                <p className="text-2xl font-bold text-slate-600">
                                    {invoices.filter(i => i.status === 'DRAFT').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Envoyées</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {invoices.filter(i => i.status === 'SENT').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm text-slate-500">Payées</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {invoices.filter(i => i.status === 'PAID').length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filter */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input placeholder="Rechercher une facture..." className="pl-10" />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-1" />
                                        Statut
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices List */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Facture</th>
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Projet / Client</th>
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Montant</th>
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Statut</th>
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Lignes</th>
                                            <th className="text-left p-4 font-medium text-slate-500 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-medium">{invoice.number}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-medium">{invoice.project?.name || '-'}</p>
                                                    <p className="text-sm text-muted-foreground">{invoice.project?.clientName || '-'}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-bold">{Number(invoice.total).toLocaleString()} FCFA</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        TVA: {Number(invoice.tax).toLocaleString()} FCFA
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={
                                                        invoice.status === 'PAID' ? 'default' :
                                                            invoice.status === 'SENT' ? 'secondary' :
                                                                invoice.status === 'OVERDUE' ? 'destructive' :
                                                                    'outline'
                                                    }>
                                                        {invoice.status === 'DRAFT' && 'Brouillon'}
                                                        {invoice.status === 'SENT' && 'Envoyée'}
                                                        {invoice.status === 'PAID' && 'Payée'}
                                                        {invoice.status === 'OVERDUE' && 'En retard'}
                                                        {invoice.status === 'CANCELLED' && 'Annulée'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="font-medium">{invoice._count?.lines || 0}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => openInvoiceDetail(invoice.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {invoice.status === 'DRAFT' && (
                                                                    <DropdownMenuItem onClick={async () => {
                                                                        await validateInvoice(invoice.id)
                                                                        loadInvoices()
                                                                    }}>
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                        Valider & Envoyer
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {invoice.status === 'SENT' && (
                                                                    <DropdownMenuItem onClick={async () => {
                                                                        await markInvoiceAsPaid(invoice.id)
                                                                        loadInvoices()
                                                                        loadDashboard()
                                                                    }}>
                                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                        Marquer Payée
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => generateInvoicePDF(invoice)}>
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Télécharger PDF
                                                                </DropdownMenuItem>
                                                                {invoice.status === 'DRAFT' && (
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={async () => {
                                                                            await deleteInvoice(invoice.id)
                                                                            loadInvoices()
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Supprimer
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {invoices.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    Aucune facture. Les factures sont créées automatiquement lors de la complétion des tâches.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Entry Modal */}
            <AddEntryModal
                open={isAddEntryOpen}
                onOpenChange={setIsAddEntryOpen}
                onSuccess={() => {
                    loadDashboard()
                    setIsAddEntryOpen(false)
                }}
            />

            {/* Invoice Detail Modal */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                open={isInvoiceDetailOpen}
                onOpenChange={setIsInvoiceDetailOpen}
                onUpdate={() => {
                    loadInvoices()
                    if (selectedInvoice) openInvoiceDetail(selectedInvoice.id)
                }}
                onDownload={() => generateInvoicePDF(selectedInvoice)}
            />
        </div>
    )
}

// Add Entry Modal Component
function AddEntryModal({ open, onOpenChange, onSuccess }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await createFinanceEntry({
                type,
                amount: parseFloat(amount) || 0,
                description,
                category
            })
            if (result.success) {
                setAmount('')
                setDescription('')
                setCategory('')
                onSuccess()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter une Entrée Financière</DialogTitle>
                    <DialogDescription>
                        Enregistrez un revenu ou une dépense
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Entrée (Revenu)</SelectItem>
                                <SelectItem value="EXPENSE">Sortie (Dépense)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Montant (FCFA)</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="Description du mouvement"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Catégorie (optionnel)</Label>
                        <Input
                            placeholder="Ex: Fournitures, Transport..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || !amount || !description}>
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Invoice Detail Modal Component
function InvoiceDetailModal({ invoice, open, onOpenChange, onUpdate, onDownload }: {
    invoice: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
    onDownload: () => void
}) {
    if (!invoice) return null

    const isEditable = !invoice.validated

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        {invoice.number}
                        <Badge variant={invoice.validated ? 'default' : 'outline'}>
                            {invoice.validated ? 'Validée' : 'Brouillon'}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {invoice.project?.name || 'Facture générale'} - {invoice.project?.clientName || 'Client'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Client Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">{invoice.project?.clientName || '-'}</p>
                            <p className="text-sm">{invoice.project?.clientEmail || '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date d'émission</p>
                            <p className="font-medium">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
                            {invoice.dueDate && (
                                <>
                                    <p className="text-sm text-muted-foreground mt-2">Échéance</p>
                                    <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Invoice Lines */}
                    <div>
                        <h3 className="font-semibold mb-3">Lignes de facture</h3>
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 text-sm font-medium">Description</th>
                                        <th className="text-right p-3 text-sm font-medium w-24">Qté</th>
                                        <th className="text-right p-3 text-sm font-medium w-32">Prix Unit.</th>
                                        <th className="text-right p-3 text-sm font-medium w-32">Montant</th>
                                        {isEditable && <th className="w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lines?.map((line: any) => (
                                        <tr key={line.id} className="border-t">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {line.type}
                                                    </Badge>
                                                    <span>{line.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">{Number(line.quantity)}</td>
                                            <td className="p-3 text-right">{Number(line.unitPrice).toLocaleString()}</td>
                                            <td className="p-3 text-right font-medium">{Number(line.amount).toLocaleString()}</td>
                                            {isEditable && (
                                                <td className="p-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={async () => {
                                                            await deleteInvoiceLine(line.id)
                                                            onUpdate()
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {invoice.lines?.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                Aucune ligne
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sous-total HT</span>
                                <span>{Number(invoice.subtotal).toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">TVA ({Number(invoice.taxRate)}%)</span>
                                <span>{Number(invoice.tax).toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                <span>Total TTC</span>
                                <span className="text-primary">{Number(invoice.total).toLocaleString()} FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                    <Button variant="secondary" onClick={onDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                    </Button>
                    {isEditable && invoice.lines?.length > 0 && (
                        <Button onClick={async () => {
                            await validateInvoice(invoice.id)
                            onUpdate()
                            onOpenChange(false)
                        }}>
                            <Send className="h-4 w-4 mr-2" />
                            Valider & Envoyer
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
