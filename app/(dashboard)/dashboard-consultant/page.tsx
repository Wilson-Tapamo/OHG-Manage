import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ConsultantDashboardClient } from "@/components/dashboard/consultant-dashboard"

export default async function ConsultantDashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if ((session.user as any)?.role !== "CONSULTANT") {
        redirect("/dashboard-director")
    }

    return (
        <div className="flex-1 space-y-4">
            <ConsultantDashboardClient userName={session.user.name || "Consultant"} />
        </div>
    )
}
