import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    TrendingDown,
    Users,
    FolderKanban,
    Receipt,
    DollarSign,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Bell
} from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDirectorDashboardData } from "@/app/actions/dashboard";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function DirectorDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if ((session.user as any)?.role !== "DIRECTOR") {
        redirect("/dashboard-consultant");
    }

    const { success, data } = await getDirectorDashboardData();

    if (!success || !data) {
        return <div className="p-8">Erreur de chargement des données.</div>;
    }

    const stats = [
        {
            title: "Revenus (Ce mois)",
            value: `${data.finance.income.toLocaleString('fr-FR')} FCFA`,
            change: "vs Dépenses: " + data.finance.expenses.toLocaleString('fr-FR'),
            trend: data.finance.income >= data.finance.expenses ? "up" : "down",
            icon: DollarSign,
            color: "from-emerald-500 to-teal-600",
        },
        {
            title: "Projets Actifs",
            value: data.counts.projects.toString(),
            change: "En cours",
            trend: "neutral",
            icon: FolderKanban,
            color: "from-blue-500 to-indigo-600",
        },
        {
            title: "Tâches Urgentes",
            value: data.counts.urgentTasks.toString(),
            change: "Priorité Haute",
            trend: "down", // Warning style usually
            icon: AlertCircle,
            color: "from-amber-500 to-orange-600",
        },
        {
            title: "Paiements En Attente",
            value: data.counts.pendingPayments.toString(), // Count of unpaid invoices
            change: `${data.counts.pendingRevenue.toLocaleString('fr-FR')} FCFA`,
            trend: "neutral",
            icon: Receipt,
            color: "from-purple-500 to-violet-600",
        },
    ];

    return (
        <div className="space-y-6 md:p-6 max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Tableau de Bord
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Bienvenue, {session?.user?.name}. Voici un aperçu de votre cabinet.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link href="/projects" className="flex-1 md:flex-none">
                        <Button className="w-full">
                            <FolderKanban className="h-4 w-4 mr-2" />
                            Gérer Projets
                        </Button>
                    </Link>
                    <Link href="/reports" className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Rapports
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
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 truncate">
                                        {stat.value}
                                    </p>
                                    <p className={`text-xs mt-1 flex items-center gap-1 text-slate-500 truncate`}>
                                        {stat.change}
                                    </p>
                                </div>
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ml-2`}
                                >
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Consultants Performance */}
                <Card className="col-span-1 overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg">Performance Consultants</CardTitle>
                            <CardDescription>Top performeurs par tâches complétées</CardDescription>
                        </div>
                        <Link href="/consultants">
                            <Button variant="ghost" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                                Voir Tout
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="space-y-4 min-w-[300px]">
                            {data.consultants.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="shrink-0">
                                            <AvatarImage src={c.avatar} />
                                            <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{c.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{c.completedTasks} tâches terminées</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 text-amber-500 font-medium text-sm ml-2">
                                        ★ {c.rating}/5
                                    </div>
                                </div>
                            ))}
                            {data.consultants.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Aucun consultant trouvé.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications / Activity */}
                <Card className="col-span-1 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Notifications Récentes</CardTitle>
                            <CardDescription>Dernières activités du système</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <div className="space-y-4 min-w-[300px]">
                            {data.notifications.map((notif: any) => (
                                <div key={notif.id} className={`flex items-start gap-4 p-3 rounded-lg border-l-4 transition-colors ${notif.read ? 'border-slate-200 bg-slate-50' : 'border-blue-500 bg-blue-50/50'
                                    }`}>
                                    <div className="mt-1 shrink-0">
                                        <Bell className={`h-4 w-4 ${notif.read ? 'text-slate-400' : 'text-blue-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-slate-900 truncate">{notif.title}</p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">{notif.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {new Date(notif.createdAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {data.notifications.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Aucune notification récente.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
