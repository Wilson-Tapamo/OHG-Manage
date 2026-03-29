'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"

export async function getMonthlySummary(filters?: { startDate?: string, endDate?: string }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const start = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const end = filters?.endDate ? new Date(filters.endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

        // Financials
        const entries = await prisma.financeEntry.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            }
        })

        const income = entries
            .filter((e: any) => e.type === 'INCOME')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

        const expenses = entries
            .filter((e: any) => e.type === 'EXPENSE')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

        // Projects
        const activeProjects = await prisma.project.count({
            where: {
                status: 'IN_PROGRESS',
                updatedAt: { gte: start, lte: end } // Approximation for activity
            }
        })

        const newProjects = await prisma.project.count({
            where: {
                createdAt: { gte: start, lte: end }
            }
        })

        // Tasks
        const completedTasks = await prisma.task.count({
            where: {
                status: 'COMPLETED',
                updatedAt: { gte: start, lte: end }
            }
        })

        return {
            success: true,
            data: {
                income,
                expenses,
                net: income - expenses,
                activeProjects,
                newProjects,
                completedTasks
            }
        }
    } catch (error) {
        console.error("Summary error:", error)
        return { success: false, error: "Erreur" }
    }
}

export async function getFinancialReport(filters?: { startDate?: string, endDate?: string }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const whereDate: any = {}
        if (filters?.startDate) whereDate.gte = new Date(filters.startDate)
        if (filters?.endDate) whereDate.lte = new Date(filters.endDate)

        const entries = await prisma.financeEntry.findMany({
            where: Object.keys(whereDate).length > 0 ? { date: whereDate } : undefined,
            include: {
                project: { select: { name: true } },
                invoice: { select: { number: true } }
            },
            orderBy: { date: 'desc' }
        })

        return { success: true, data: JSON.parse(JSON.stringify(entries)) }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

export async function getTaskReport(filters?: { startDate?: string, endDate?: string, projectId?: string }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const where: any = {}
        if (filters?.startDate) where.createdAt = { gte: new Date(filters.startDate) }
        if (filters?.endDate) where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) }
        if (filters?.projectId && filters.projectId !== 'ALL') where.projectId = filters.projectId

        const tasks = await prisma.task.findMany({
            where,
            include: {
                project: { select: { name: true } },
                assignees: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Aggregate stats
        const stats = {
            total: tasks.length,
            completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
            inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
            overdue: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length
        }

        return { success: true, data: { tasks: JSON.parse(JSON.stringify(tasks)), stats } }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

export async function getConsultantReport(filters?: { startDate?: string, endDate?: string }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const consultants = await prisma.user.findMany({
            where: { role: 'CONSULTANT' },
            include: {
                _count: {
                    select: {
                        assignedTasks: { where: { status: 'COMPLETED' } }, // Approximate completion count
                        consultingProjects: true
                    }
                }
            }
        })

        // For more detailed Hours reporting, we'd need to aggregate TaskHours
        // Let's fetch that separately
        const hoursWhere: any = {}
        if (filters?.startDate) hoursWhere.createdAt = { gte: new Date(filters.startDate) }
        if (filters?.endDate) hoursWhere.createdAt = { ...hoursWhere.createdAt, lte: new Date(filters.endDate) }

        const hoursLogs = await prisma.taskHours.groupBy({
            by: ['userId'],
            _sum: { hours: true },
            where: hoursWhere
        })

        const data = consultants.map((c: any) => {
            const hoursLog = hoursLogs.find((h: any) => h.userId === c.id)
            return {
                id: c.id,
                name: c.name,
                email: c.email,
                level: c.level,
                completedTasks: c._count.assignedTasks,
                activeProjects: c._count.consultingProjects,
                totalHours: Number(hoursLog?._sum?.hours || 0),
                rating: c.rating || 0
            }
        })

        return { success: true, data: JSON.parse(JSON.stringify(data)) }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}
