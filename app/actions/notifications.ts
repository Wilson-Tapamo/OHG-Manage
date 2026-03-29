'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Create a new notification (Internal function to be used by other actions)
export async function createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    link?: string
}) {
    try {
        await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Failed to create notification:", error)
        return { success: false, error: "Failed to create notification" }
    }
}

// Get notifications for the current user
export async function getNotifications(limit = 20) {
    const session = await auth()
    if (!session || !session.user) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: (session.user as any).id,
                read: false
            }
        })

        return { success: true, data: notifications, unreadCount }
    } catch (error) {
        return { success: false, error: "Failed to fetch notifications" }
    }
}

// Mark a notification as read
export async function markAsRead(id: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Unauthorized" }

    try {
        await prisma.notification.update({
            where: { id, userId: (session.user as any).id },
            data: { read: true }
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to mark as read" }
    }
}

// Mark all notifications as read
export async function markAllAsRead() {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Unauthorized" }

    try {
        await prisma.notification.updateMany({
            where: { userId: (session.user as any).id, read: false },
            data: { read: true }
        })
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to mark all as read" }
    }
}
