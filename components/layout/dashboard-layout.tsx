import React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface DashboardLayoutProps {
    children: React.ReactNode;
    user: {
        name?: string | null;
        email?: string | null;
        avatar?: string | null;
        role: "DIRECTOR" | "CONSULTANT";
    };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Sidebar userRole={user.role} />
            <div className="flex flex-1 flex-col">
                <Topbar user={user} />
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
