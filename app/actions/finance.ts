'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Get finance dashboard data
export async function getFinanceDashboard(filters?: { startDate?: string, endDate?: string }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const whereDate: any = {}
        if (filters?.startDate) whereDate.gte = new Date(filters.startDate)
        if (filters?.endDate) whereDate.lte = new Date(filters.endDate)

        // Get finance entries filtered by date
        const entries = await prisma.financeEntry.findMany({
            where: Object.keys(whereDate).length > 0 ? { date: whereDate } : undefined,
            include: {
                project: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
                invoice: { select: { id: true, number: true } },
                createdBy: { select: { id: true, name: true } }
            },
            orderBy: { date: 'desc' }
        })

        // Get paid invoices for income (also filtered by date)
        const paidInvoices = await prisma.invoice.findMany({
            where: {
                status: 'PAID',
                paidDate: Object.keys(whereDate).length > 0 ? whereDate : undefined
            },
            select: { total: true, paidDate: true }
        })

        // Calculate totals
        const totalIncome = entries
            .filter((e: any) => e.type === 'INCOME')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0) +
            paidInvoices.reduce((sum: number, i: any) => sum + Number(i.total), 0)

        const totalExpenses = entries
            .filter((e: any) => e.type === 'EXPENSE')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

        const balance = totalIncome - totalExpenses

        // Monthly data for chart
        // If specific range selected, use that range's months. If not, use current year.
        const start = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 0, 1)
        const end = filters?.endDate ? new Date(filters.endDate) : new Date(new Date().getFullYear(), 11, 31)

        const monthlyData = []
        let current = new Date(start.getFullYear(), start.getMonth(), 1)

        while (current <= end) {
            const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
            const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

            const monthIncome = entries
                .filter((e: any) => e.type === 'INCOME' &&
                    new Date(e.date) >= monthStart &&
                    new Date(e.date) <= monthEnd)
                .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

            const monthExpense = entries
                .filter((e: any) => e.type === 'EXPENSE' &&
                    new Date(e.date) >= monthStart &&
                    new Date(e.date) <= monthEnd)
                .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

            monthlyData.push({
                month: monthStart.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
                income: monthIncome,
                expense: monthExpense
            })

            current.setMonth(current.getMonth() + 1)
        }

        return {
            success: true,
            data: {
                totalIncome,
                totalExpenses,
                balance: Number(balance),
                entries: JSON.parse(JSON.stringify(entries.slice(0, 50))),
                monthlyData
            }
        }
    } catch (error) {
        console.error("Finance dashboard error:", error)
        return { success: false, error: "Erreur lors du chargement" }
    }
}

// Get all finance entries with filters
export async function getFinanceEntries(filters?: {
    type?: 'INCOME' | 'EXPENSE'
    projectId?: string
    startDate?: string
    endDate?: string
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    const where: any = {}

    if (filters?.type) where.type = filters.type
    if (filters?.projectId) where.projectId = filters.projectId
    if (filters?.startDate || filters?.endDate) {
        where.date = {}
        if (filters.startDate) where.date.gte = new Date(filters.startDate)
        if (filters.endDate) where.date.lte = new Date(filters.endDate)
    }

    try {
        const entries = await prisma.financeEntry.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
                createdBy: { select: { id: true, name: true } }
            },
            orderBy: { date: 'desc' }
        })

        return { success: true, data: JSON.parse(JSON.stringify(entries)) }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Create finance entry
export async function createFinanceEntry(data: {
    type: 'INCOME' | 'EXPENSE'
    amount: number
    description: string
    category?: string
    date?: string
    projectId?: string
    taskId?: string
    invoiceId?: string
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        await prisma.financeEntry.create({
            data: {
                type: data.type,
                amount: data.amount,
                description: data.description,
                category: data.category,
                date: data.date ? new Date(data.date) : new Date(),
                projectId: data.projectId || null,
                taskId: data.taskId || null,
                invoiceId: data.invoiceId || null,
                createdById: (session.user as any).id
            }
        })

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        console.error("Create entry error:", error)
        return { success: false, error: "Erreur lors de la création" }
    }
}

// Delete finance entry
export async function deleteFinanceEntry(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        await prisma.financeEntry.delete({ where: { id } })
        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" }
    }
}
