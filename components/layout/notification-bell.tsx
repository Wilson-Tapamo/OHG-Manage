'use client'

import { useState, useEffect, useTransition } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Loader2 } from "lucide-react"
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        // Initial fetch
        loadNotifications()

        // Polling every 30s
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    async function loadNotifications() {
        const result = await getNotifications()
        if (result.success && result.data) {
            setNotifications(result.data)
            setUnreadCount(result.unreadCount || 0)
        }
    }

    const handleRead = (id: string, link?: string) => {
        startTransition(async () => {
            await markAsRead(id)
            loadNotifications()
            if (link) router.push(link)
        })
    }

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllAsRead()
            loadNotifications()
        })
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={handleMarkAllRead}
                            disabled={isPending}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.read ? 'bg-muted/50 font-medium' : ''}`}
                                onClick={() => handleRead(notif.id, notif.link)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-semibold text-primary">{notif.type}</span>
                                    {!notif.read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                </div>
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notif.createdAt).toLocaleString('fr-FR')}
                                </p>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Aucune notification
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
