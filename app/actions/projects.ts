'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createNotification } from "./notifications"

const ProjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),

    // Client info
    clientName: z.string().min(1, "Client name is required"),
    clientContact: z.string().optional(),
    clientPhone: z.string().optional(),
    clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),

    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("PENDING"),
    type: z.enum(["JURIDIQUE", "FINANCIER", "FISCAL"]).default("JURIDIQUE"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),

    startDate: z.string().transform((str) => (str ? new Date(str) : undefined)).optional(),
    endDate: z.string().transform((str) => (str ? new Date(str) : undefined)).optional(),

    expertise: z.string().optional(),
    consultantIds: z.array(z.string()).optional(),
})

export async function getProjects(filters?: {
    status?: string
    search?: string
    consultantId?: string
}) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    const where: any = {}

    if (userRole === "CONSULTANT") {
        where.OR = [
            { managerId: userId },
            { consultants: { some: { id: userId } } }
        ]
    }

    if (filters?.status && filters.status !== "ALL") {
        where.status = filters.status
    }

    if (filters?.search) {
        where.OR = [
            ...(where.OR || []),
            { name: { contains: filters.search } },
            { clientName: { contains: filters.search } }
        ]
    }

    if (filters?.consultantId) {
        where.consultants = {
            some: {
                id: filters.consultantId
            }
        }
    }

    try {
        const projects = await prisma.project.findMany({
            where,
            include: {
                manager: {
                    select: { name: true, avatar: true, email: true }
                },
                consultants: {
                    select: { id: true, name: true, avatar: true }
                },
                tasks: {
                    select: {
                        id: true,
                        budget: true,
                        status: true
                    }
                },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })
        return { success: true, data: projects }
    } catch (error) {
        console.error("Failed to fetch projects:", error)
        return { success: false, error: "Failed to fetch projects" }
    }
}

export async function createProjectJson(data: z.infer<typeof ProjectSchema>) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const validated = ProjectSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten() }
    }

    const { consultantIds, ...projectData } = validated.data

    try {
        await prisma.project.create({
            data: {
                ...projectData,
                managerId: (session.user as any).id,
                consultants: consultantIds ? {
                    connect: consultantIds.map(id => ({ id }))
                } : undefined
            }
        })

        if (consultantIds && consultantIds.length > 0) {
            consultantIds.forEach(async (id) => {
                await createNotification({
                    userId: id,
                    type: "ASSIGNMENT",
                    title: "Nouveau Projet",
                    message: `Vous avez été assigné au projet "${projectData.name}"`,
                    link: "/projects"
                })
            })
        }

        revalidatePath("/projects")
        return { success: true }
    } catch (error) {
        console.error("Create project error:", error)
        return { success: false, error: "Failed to create project" }
    }
}

export async function updateProjectJson(id: string, data: z.infer<typeof ProjectSchema>) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const validated = ProjectSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten() }
    }

    const { consultantIds, ...projectData } = validated.data

    try {
        await prisma.project.update({
            where: { id },
            data: {
                ...projectData,
                consultants: consultantIds ? {
                    set: [], // Clear existing
                    connect: consultantIds.map(id => ({ id }))
                } : undefined
            }
        })

        revalidatePath("/projects")
        return { success: true }
    } catch (error) {
        console.error("Update project error:", error)
        return { success: false, error: "Failed to update project" }
    }
}

export async function updateProjectStatus(id: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD") {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        await prisma.project.update({
            where: { id },
            data: { status }
        })

        revalidatePath("/projects")
        return { success: true }
    } catch (error) {
        console.error("Update project status error:", error)
        return { success: false, error: "Failed to update status" }
    }
}

export async function getConsultants() {
    try {
        const consultants = await prisma.user.findMany({
            where: { role: "CONSULTANT" },
            select: { id: true, name: true, avatar: true }
        })
        return { success: true, data: consultants }
    } catch (error) {
        return { success: false, error: "Failed to fetch consultants" }
    }
}

export async function getProjectDetails(id: string) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                manager: { select: { id: true, name: true, avatar: true } },
                consultants: { select: { id: true, name: true, avatar: true } },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        assignees: {
                            select: { id: true, name: true, avatar: true }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            }
        })

        if (!project) return { success: false, error: "Project not found" }

        return { success: true, data: project }
    } catch (error) {
        console.error("Get project details error:", error)
        return { success: false, error: "Failed to fetch details" }
    }
}
