'use client'

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    CheckSquare,
    FolderKanban,
    Clock,
    AlertTriangle,
    Star,
    Activity,
    ArrowRight,
    Wallet,
    TrendingUp,
    Bell,
    Calendar,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import { getConsultantDashboardData } from "@/app/actions/dashboard"

export function ConsultantDashboardClient({ userName }: { userName: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const result = await getConsultantDashboardData()
            if (result.success) {
                setData(result.data)
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const stats = [
        {
            title: "Mes Tâches",
            value: data?.stats?.totalTasks || 0,
            subtitle: `${data?.stats?.inProgressCount || 0} en cours`,
            icon: CheckSquare,
            color: "from-blue-500 to-indigo-600",
        },
        {
            title: "Projets Assignés",
            value: data?.assignedProjects?.length || 0,
            subtitle: "Actifs",
            icon: FolderKanban,
            color: "from-purple-500 to-violet-600",
        },
        {
            title: "Heures ce Mois",
            value: data?.stats?.hoursThisMonth?.toFixed(1) || "0",
            subtitle: "heures loguées",
            icon: Clock,
            color: "from-emerald-500 to-teal-600",
        },
        {
            title: "En Retard",
            value: data?.stats?.overdueCount || 0,
            subtitle: "tâches urgentes",
            icon: AlertTriangle,
            color: data?.stats?.overdueCount > 0 ? "from-red-500 to-rose-600" : "from-slate-400 to-slate-500",
        },
    ]

    const getPriorityColor = (priority: number) => {
        if (priority === 3) return "bg-red-100 text-red-700 dark:bg-red-900/30"
        if (priority === 2) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
        return "bg-green-100 text-green-700 dark:bg-green-900/30"
    }

    const getPriorityLabel = (priority: number) => {
        if (priority === 3) return "Haute"
        if (priority === 2) return "Moyenne"
        return "Basse"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500'
            case 'IN_PROGRESS': return 'bg-blue-500'
            case 'ON_HOLD': return 'bg-amber-500'
            default: return 'bg-slate-400'
        }
    }

    return (
        <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Mon Tableau de Bord
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Bienvenue, {userName}! Voici votre aperçu du jour.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Performance Rating */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                            {data?.stats?.rating?.toFixed(1) || "0.0"}/5
                        </span>
                        <span className="text-xs text-amber-600 dark:text-amber-500">
                            ({data?.stats?.level || 'JUNIOR'})
                        </span>
                    </div>
                    <Link href="/tasks">
                        <Button className="w-full md:w-auto">
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Mes Tâches
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card
                        key={index}
                        className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                        {stat.title}
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1 truncate">{stat.subtitle}</p>
                                </div>
                                <div
                                    className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ml-2`}
                                >
                                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Tasks in Progress */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Tâches en Cours
                            </CardTitle>
                            <CardDescription>Vos tâches actives</CardDescription>
                        </div>
                        <Link href="/tasks?status=IN_PROGRESS">
                            <Button variant="ghost" size="sm">
                                Voir Tout
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="space-y-3 min-w-[350px]">
                            {data?.tasksInProgress?.length > 0 ? (
                                data.tasksInProgress.map((task: any) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">{task.project?.name}</p>
                                        </div>
                                        <Badge className={getPriorityColor(task.priority)}>
                                            {getPriorityLabel(task.priority)}
                                        </Badge>
                                        {task.dueDate && (
                                            <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                                                {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune tâche en cours. 🎉
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Overdue Tasks */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            En Retard
                        </CardTitle>
                        <CardDescription>Tâches dépassant l'échéance</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="space-y-3 min-w-[280px]">
                            {data?.overdueTasks?.length > 0 ? (
                                data.overdueTasks.map((task: any) => (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold">
                                            !
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{task.project?.name}</p>
                                            <p className="text-xs text-red-600 mt-1">
                                                Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune tâche en retard! ✅
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row: Projects & Activity */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Assigned Projects */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FolderKanban className="h-5 w-5 text-purple-500" />
                                Mes Projets
                            </CardTitle>
                            <CardDescription>Projets auxquels vous êtes assigné</CardDescription>
                        </div>
                        <Link href="/projects">
                            <Button variant="ghost" size="sm">
                                Voir Tout
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 min-w-[300px]">
                            {data?.assignedProjects?.length > 0 ? (
                                data.assignedProjects.map((project: any) => (
                                    <div
                                        key={project.id}
                                        className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate flex-1">
                                                {project.name}
                                            </p>
                                            <div className={`h-2 w-2 rounded-full ${getStatusColor(project.status)} shrink-0 ml-2`} />
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{project.clientName || 'Client inconnu'}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <Badge variant="outline" className="text-xs">
                                                {project.taskCount} tâches
                                            </Badge>
                                            <span className="text-xs text-slate-400">{project.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm col-span-2">
                                    Aucun projet assigné.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5 text-indigo-500" />
                            Activité Récente
                        </CardTitle>
                        <CardDescription>Dernières notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="space-y-4 min-w-[280px]">
                            {data?.activityTimeline?.length > 0 ? (
                                data.activityTimeline.slice(0, 6).map((activity: any) => (
                                    <div
                                        key={activity.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${activity.read ? 'border-slate-200 bg-slate-50 dark:bg-slate-800/30' : 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                            }`}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            <Activity className={`h-4 w-4 ${activity.read ? 'text-slate-400' : 'text-indigo-500'}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                                                {activity.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                {activity.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {new Date(activity.createdAt).toLocaleString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune activité récente.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Payments */}
            {data?.pendingPayments?.length > 0 && (
                <Card className="overflow-hidden border-amber-200 dark:border-amber-800">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-amber-600" />
                            Paiements en Attente
                        </CardTitle>
                        <CardDescription>Tâches complétées avec factures en attente de paiement</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto pt-4">
                        <div className="space-y-3 min-w-[350px]">
                            {data.pendingPayments.map((task: any) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <Wallet className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                                            <p className="text-sm text-slate-500 truncate">{task.project?.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400 shrink-0 ml-2">
                                        En attente
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
