"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Receipt,
    CreditCard,
    TrendingUp,
    FileBarChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
    userRole: "DIRECTOR" | "CONSULTANT";
}

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    roles: ("DIRECTOR" | "CONSULTANT")[];
}

const navItems: NavItem[] = [
    {
        title: "Tableau de Bord",
        href: "/dashboard-director",
        icon: LayoutDashboard,
        roles: ["DIRECTOR"],
    },
    {
        title: "Mon Espace",
        href: "/dashboard-consultant",
        icon: LayoutDashboard,
        roles: ["CONSULTANT"],
    },
    {
        title: "Projets",
        href: "/projects",
        icon: FolderKanban,
        roles: ["DIRECTOR", "CONSULTANT"],
    },
    {
        title: "Tâches",
        href: "/tasks",
        icon: CheckSquare,
        roles: ["DIRECTOR", "CONSULTANT"],
    },
    {
        title: "Consultants",
        href: "/consultants",
        icon: Users,
        roles: ["DIRECTOR"],
    },
    {
        title: "Finances",
        href: "/finance",
        icon: TrendingUp,
        roles: ["DIRECTOR"],
    },
    {
        title: "Rapports",
        href: "/reports",
        icon: FileBarChart,
        roles: ["DIRECTOR", "CONSULTANT"],
    },
    {
        title: "Paramètres",
        href: "/settings",
        icon: Settings,
        roles: ["DIRECTOR", "CONSULTANT"],
    },
];

export function Sidebar({ userRole }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(userRole)
    );

    return (
        <aside
            className={cn(
                "hidden md:flex h-screen sticky top-0 flex-col border-r border-slate-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/50 dark:bg-slate-900/80",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
                    <Scale className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">
                            Optimum
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Juridis Finance
                        </span>
                    </div>
                )}
            </div>

            <Separator className="mx-4" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    isActive && "text-indigo-600 dark:text-indigo-400"
                                )}
                            />
                            {!collapsed && <span>{item.title}</span>}
                            {isActive && !collapsed && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full"
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </aside>
    );
}
