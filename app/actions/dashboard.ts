'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"

export async function getDirectorDashboardData() {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        // 1. KPI Counters
        const totalProjects = await prisma.project.count({
            where: { status: { not: 'COMPLETED' } } // Active projects usually
        })

        const totalTasks = await prisma.task.count({
            where: { status: { not: 'COMPLETED' } }
        })

        const urgentTasks = await prisma.task.count({
            where: {
                status: { not: 'COMPLETED' },
                priority: 3  // 3 = HIGH
            }
        })

        const pendingPayments = await prisma.invoice.count({
            where: { status: 'SENT' } // Sent but not paid
        })

        const pendingRevenue = await prisma.invoice.aggregate({
            where: { status: 'SENT' },
            _sum: { total: true }
        })

        // 2. Finance Summary (This Month)
        const incomeEntries = await prisma.financeEntry.aggregate({
            where: {
                type: 'INCOME',
                date: { gte: firstDayOfMonth, lte: lastDayOfMonth }
            },
            _sum: { amount: true }
        })

        const expenseEntries = await prisma.financeEntry.aggregate({
            where: {
                type: 'EXPENSE',
                date: { gte: firstDayOfMonth, lte: lastDayOfMonth }
            },
            _sum: { amount: true }
        })

        const financeSummary = {
            income: Number(incomeEntries._sum.amount || 0),
            expenses: Number(expenseEntries._sum.amount || 0),
        }

        // 3. Consultant Performance (Top 5 by completed tasks this month or overall)
        const consultants = await prisma.user.findMany({
            where: { role: 'CONSULTANT' },
            select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                _count: {
                    select: { assignedTasks: { where: { status: 'COMPLETED' } } }
                }
            },
            take: 5,
            orderBy: {
                assignedTasks: { _count: 'desc' }
            }
        })

        // 4. Recent Notifications
        const recentNotifications = await prisma.notification.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return {
            success: true,
            data: {
                counts: {
                    projects: totalProjects,
                    tasks: totalTasks,
                    urgentTasks: urgentTasks,
                    pendingPayments: pendingPayments,
                    pendingRevenue: Number(pendingRevenue._sum.total || 0)
                },
                finance: financeSummary,
                consultants: consultants.map((c: any) => ({
                    ...c,
                    completedTasks: c._count.assignedTasks
                })),
                notifications: recentNotifications
            }
        }
    } catch (error) {
        console.error("Dashboard data error:", error)
        return { success: false, error: "Erreur de chargement" }
    }
}

export async function getConsultantDashboardData() {
    const session = await auth()
    if (!session?.user) {
        return { success: false, error: "Non autorisé" }
    }

    const userId = (session.user as any).id

    try {
        const now = new Date()

        // 1. Tasks in Progress
        const tasksInProgress = await prisma.task.findMany({
            where: {
                assignees: { some: { id: userId } },
                status: 'IN_PROGRESS'
            },
            include: {
                project: { select: { name: true } }
            },
            orderBy: { dueDate: 'asc' },
            take: 5
        })

        // 2. Overdue Tasks
        const overdueTasks = await prisma.task.findMany({
            where: {
                assignees: { some: { id: userId } },
                status: { not: 'COMPLETED' },
                dueDate: { lt: now }
            },
            include: {
                project: { select: { name: true } }
            },
            orderBy: { dueDate: 'asc' },
            take: 5
        })

        // 3. Pending Payments (Completed tasks awaiting payment - based on project invoices)
        const completedTasksWithPendingInvoices = await prisma.task.findMany({
            where: {
                assignees: { some: { id: userId } },
                status: 'COMPLETED',
                project: {
                    invoices: {
                        some: { status: 'SENT' }
                    }
                }
            },
            include: {
                project: {
                    select: {
                        name: true,
                        invoices: {
                            where: { status: 'SENT' },
                            select: { total: true }
                        }
                    }
                }
            },
            take: 5
        })

        // 4. Assigned Projects
        const assignedProjects = await prisma.project.findMany({
            where: {
                tasks: { some: { assignees: { some: { id: userId } } } }
            },
            select: {
                id: true,
                name: true,
                status: true,
                clientName: true,
                _count: {
                    select: {
                        tasks: { where: { assignees: { some: { id: userId } } } }
                    }
                }
            },
            take: 6
        })

        // 5. User Performance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                rating: true,
                level: true,
                _count: {
                    select: {
                        assignedTasks: { where: { status: 'COMPLETED' } }
                    }
                }
            }
        })

        // 6. Activity Timeline (Recent notifications for this user)
        const activityTimeline = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        // 7. Stats
        const totalAssignedTasks = await prisma.task.count({
            where: { assignees: { some: { id: userId } } }
        })
        const completedTasksCount = await prisma.task.count({
            where: { assignees: { some: { id: userId } }, status: 'COMPLETED' }
        })

        // Hours logged this month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const hoursThisMonth = await prisma.taskHours.aggregate({
            where: {
                userId,
                createdAt: { gte: firstDayOfMonth }
            },
            _sum: { hours: true }
        })

        return {
            success: true,
            data: {
                stats: {
                    totalTasks: totalAssignedTasks,
                    completedTasks: completedTasksCount,
                    inProgressCount: tasksInProgress.length,
                    overdueCount: overdueTasks.length,
                    hoursThisMonth: Number(hoursThisMonth._sum.hours || 0),
                    rating: user?.rating || 0,
                    level: user?.level || 'JUNIOR'
                },
                tasksInProgress,
                overdueTasks,
                pendingPayments: completedTasksWithPendingInvoices,
                assignedProjects: assignedProjects.map((p: any) => ({
                    ...p,
                    taskCount: p._count.tasks
                })),
                activityTimeline
            }
        }
    } catch (error) {
        console.error("Consultant Dashboard error:", error)
        return { success: false, error: "Erreur de chargement" }
    }
}

