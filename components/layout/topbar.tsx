"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    Receipt,
    CreditCard,
    TrendingUp,
    FileBarChart,
    Scale,
    Menu,
    Settings,
    Bell,
    Search,
    LogOut,
    User
} from "lucide-react";
import { NotificationBell } from "./notification-bell";

interface TopbarProps {
    user: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        role?: string;
    };
}

export function Topbar({ user }: TopbarProps) {
    const pathname = usePathname();

    const navItems = [
        { title: "Dashboard Director", href: "/dashboard-director", icon: LayoutDashboard, roles: ["DIRECTOR"] },
        { title: "Dashboard Consultant", href: "/dashboard-consultant", icon: LayoutDashboard, roles: ["CONSULTANT"] },
        { title: "Projects", href: "/projects", icon: FolderKanban, roles: ["DIRECTOR", "CONSULTANT"] },
        { title: "Tasks", href: "/tasks", icon: CheckSquare, roles: ["DIRECTOR", "CONSULTANT"] },
        { title: "Consultants", href: "/consultants", icon: Users, roles: ["DIRECTOR"] },
        { title: "Finance", href: "/finance", icon: TrendingUp, roles: ["DIRECTOR"] },
        { title: "Reports", href: "/reports", icon: FileBarChart, roles: ["DIRECTOR"] },
        { title: "Settings", href: "/settings", icon: Settings, roles: ["DIRECTOR", "CONSULTANT"] },
    ];

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user.role as any)
    );

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 md:px-6 justify-between dark:border-slate-800/50 dark:bg-slate-900/80">
            {/* Mobile Menu */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <div className="flex items-center gap-3 p-6 border-b">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
                            <Scale className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">
                                Optimum
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Juridis Finance
                            </span>
                        </div>
                    </div>
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
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 flex-shrink-0",
                                            isActive && "text-indigo-600 dark:text-indigo-400"
                                        )}
                                    />
                                    <span>{item.title}</span>
                                    {isActive && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search projects, tasks, invoices..."
                        className="pl-10 bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-3 px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback>
                                    {getInitials(user.name || "User")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start text-left md:flex">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user.name || "User"}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {user.role?.toLowerCase()}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
