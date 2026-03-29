import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FinanceDirectorView } from "@/components/finance/finance-view"

export default async function FinancePage() {
    const session = await auth()
    if (!session) redirect("/login")

    // Only Directors can access Finance page
    if ((session.user as any)?.role !== "DIRECTOR") {
        redirect("/dashboard-consultant")
    }

    return (
        <div className="flex-1 space-y-4">
            <FinanceDirectorView />
        </div>
    )
}
