import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ReportsView from "@/components/reports/reports-view"

export default async function ReportsPage() {
    const session = await auth()

    // Strict Director check
    if ((session?.user as any)?.role !== "DIRECTOR") {
        redirect("/dashboard")
    }

    return (
        <div className="flex-1 space-y-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Rapports & Statistiques</h2>
            </div>

            <ReportsView />
        </div>
    )
}
