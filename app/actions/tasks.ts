'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { TaskSchema, TaskInput } from "@/lib/schemas"
import { createNotification } from "./notifications"

// Actions

export async function getTasks(filters?: {
    projectId?: string
    assigneeId?: string
    status?: string
    search?: string
}) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    const where: any = {}

    // Implement role-based access if needed (Consultant only sees assigned? Or all?)
    // For now, let's assume Director sees all, Consultant sees assigned OR project tasks they are part of.
    // Simplifying to: everyone sees all tasks they have access to via Project.

    if (filters?.projectId) where.projectId = filters.projectId
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.assigneeId && filters.assigneeId !== "ALL") {
        where.assignees = { some: { id: filters.assigneeId } }
    }

    if (filters?.search) {
        where.OR = [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } }
        ]
    }

    try {
        const tasks = await prisma.task.findMany({
            where,
            include: {
                project: { select: { id: true, name: true, clientName: true } },
                assignees: { select: { id: true, name: true, avatar: true } },
                subtasks: { orderBy: { id: 'asc' } },
                creator: { select: { id: true, name: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { updatedAt: 'desc' }
        })
        return { success: true, data: tasks }
    } catch (error) {
        console.error("Get tasks error:", error)
        return { success: false, error: "Erreur lors de la récupération des tâches" }
    }
}

export async function createTask(data: TaskInput) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    const validated = TaskSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.flatten() }

    const { assigneeIds, initialSubtasks, budgetDebours, budgetPerdiem, budgetTransport, ...taskData } = validated.data

    // Calculate total budget
    const budget = (budgetDebours || 0) + (budgetPerdiem || 0) + (budgetTransport || 0)

    try {
        await prisma.task.create({
            data: {
                ...taskData,
                budget,
                budgetDebours,
                budgetPerdiem,
                budgetTransport,
                creatorId: session.user.id,
                assignees: assigneeIds ? {
                    connect: assigneeIds.map(id => ({ id }))
                } : undefined,
                subtasks: initialSubtasks ? {
                    create: initialSubtasks.map(title => ({ title }))
                } : undefined
            }
        })

        if (assigneeIds && assigneeIds.length > 0) {
            assigneeIds.forEach(async (id) => {
                await createNotification({
                    userId: id,
                    type: "ASSIGNMENT",
                    title: "Nouvelle Tâche",
                    message: `Vous avez été assigné à la tâche "${taskData.title}"`,
                    link: "/tasks"
                })
            })
        }

        revalidatePath("/tasks")
        revalidatePath("/projects")
        return { success: true }
    } catch (error) {
        console.error("Create task error:", error)
        return { success: false, error: "Erreur lors de la création de la tâche" }
    }
}

export async function updateTask(id: string, data: Partial<TaskInput>) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    // Manual partial validation could be done here, or rely on schema partial

    try {
        const { assigneeIds, budgetDebours, budgetPerdiem, budgetTransport, ...rest } = data

        const updateData: any = { ...rest }

        // Recalculate budget if any component changes (this logic might need full object or fetch existing)
        // For simplicity, we assume the form sends all budget fields or we handle it in frontend. 
        // Let's assume the frontend sends all 3 if one changes.
        if (budgetDebours !== undefined || budgetPerdiem !== undefined || budgetTransport !== undefined) {
            updateData.budgetDebours = budgetDebours
            updateData.budgetPerdiem = budgetPerdiem
            updateData.budgetTransport = budgetTransport
            updateData.budget = (Number(budgetDebours) || 0) + (Number(budgetPerdiem) || 0) + (Number(budgetTransport) || 0)
        }

        if (assigneeIds) {
            updateData.assignees = {
                set: [],
                connect: assigneeIds.map(userId => ({ id: userId }))
            }
        }

        await prisma.task.update({
            where: { id },
            data: updateData
        })

        revalidatePath("/tasks")
        revalidatePath("/projects")
        return { success: true }
    } catch (error) {
        console.error("Update task error:", error)
        return { success: false, error: "Erreur lors de la mise à jour" }
    }
}

export async function updateTaskStatus(
    id: string,
    status: string,
    hoursData?: { userId: string, hours: number, description?: string }[]
) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    try {
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                assignees: { select: { id: true } },
                workedHours: true
            }
        })

        if (!task) return { success: false, error: "Tâche introuvable" }

        const userRole = (session.user as any)?.role

        // Only Director can change to COMPLETED
        if (status === 'COMPLETED' && userRole !== 'DIRECTOR') {
            return { success: false, error: "Seul le directeur peut terminer une tâche" }
        }

        // If going to COMPLETED, check if all assignees have hours logged
        if (status === 'COMPLETED') {
            const assigneeIds = task.assignees.map(a => a.id)
            const loggedUserIds = task.workedHours.map(wh => wh.userId)
            const missingHours = assigneeIds.filter(id => !loggedUserIds.includes(id))

            // If hours data provided, log missing hours
            if (hoursData && hoursData.length > 0) {
                for (const hd of hoursData) {
                    await prisma.taskHours.upsert({
                        where: { taskId_userId: { taskId: id, userId: hd.userId } },
                        create: {
                            taskId: id,
                            userId: hd.userId,
                            hours: hd.hours,
                            description: hd.description
                        },
                        update: {
                            hours: hd.hours,
                            description: hd.description
                        }
                    })
                }
            } else if (missingHours.length > 0) {
                return {
                    success: false,
                    error: "HOURS_REQUIRED",
                    missingUsers: missingHours
                }
            }
        }

        // If Consultant going to REVIEW, they should log their own hours
        if (status === 'REVIEW' && userRole === 'CONSULTANT') {
            const hasLogged = task.workedHours.some(wh => wh.userId === session.user!.id)
            if (!hasLogged && hoursData) {
                const myHours = hoursData.find(h => h.userId === session.user!.id)
                if (myHours) {
                    await prisma.taskHours.create({
                        data: {
                            taskId: id,
                            userId: session.user!.id,
                            hours: myHours.hours,
                            description: myHours.description
                        }
                    })
                }
            } else if (!hasLogged) {
                return {
                    success: false,
                    error: "HOURS_REQUIRED_SELF"
                }
            }
        }

        await prisma.task.update({
            where: { id },
            data: { status: status as any }
        })

        // Auto-invoice when task is completed
        if (status === 'COMPLETED') {
            const { addTaskToInvoice } = await import('./invoices')
            await addTaskToInvoice(id)
        }

        revalidatePath("/tasks")
        revalidatePath("/consultants")
        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        console.error("Update status error:", error)
        return { success: false, error: "Erreur status" }
    }
}

// Task Hours
export async function logTaskHours(taskId: string, hours: number, description?: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    try {
        await prisma.taskHours.upsert({
            where: { taskId_userId: { taskId, userId: session.user.id } },
            create: {
                taskId,
                userId: session.user.id,
                hours,
                description
            },
            update: {
                hours,
                description
            }
        })

        revalidatePath("/tasks")
        return { success: true }
    } catch (error) {
        console.error("Log hours error:", error)
        return { success: false, error: "Erreur lors de l'enregistrement des heures" }
    }
}

export async function getTaskHours(taskId: string) {
    try {
        const hours = await prisma.taskHours.findMany({
            where: { taskId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true, hourlyRate: true }
                }
            }
        })
        return { success: true, data: hours }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Subtasks
export async function addSubtask(taskId: string, title: string) {
    try {
        await prisma.subTask.create({
            data: { taskId, title }
        })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) { return { success: false, error: "Erreur" } }
}

export async function toggleSubtask(id: string, completed: boolean) {
    try {
        await prisma.subTask.update({
            where: { id },
            data: { completed }
        })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) { return { success: false, error: "Erreur" } }
}

export async function deleteSubtask(id: string) {
    try {
        await prisma.subTask.delete({ where: { id } })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) { return { success: false, error: "Erreur" } }
}

// Comments
export async function getComments(taskId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: { user: { select: { id: true, name: true, avatar: true } } },
            orderBy: { createdAt: 'asc' }
        })
        return { success: true, data: comments }
    } catch (error) { return { success: false, error: "Erreur" } }
}

export async function addComment(taskId: string, content: string, attachments?: any) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    try {
        await prisma.comment.create({
            data: {
                taskId,
                userId: session.user.id,
                content,
                attachments
            }
        })
        revalidatePath("/tasks")

        // Notify Assignees and Creator
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignees: true, creator: true }
        })

        if (task) {
            const recipients = new Set([...task.assignees.map(a => a.id), task.creatorId])
            recipients.forEach(async (uid) => {
                if (uid !== session.user.id) {
                    await createNotification({
                        userId: uid,
                        type: "COMMENT",
                        title: "Nouveau commentaire",
                        message: `Nouveau commentaire sur la tâche "${task.title}"`,
                        link: `/tasks?id=${taskId}`
                    })
                }
            })
        }

        return { success: true }
    } catch (error) { return { success: false, error: "Erreur" } }
}

export async function deleteTask(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non autorisé" }

    try {
        await prisma.task.delete({ where: { id } })
        revalidatePath("/tasks")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur lors de la suppression" }
    }
}
