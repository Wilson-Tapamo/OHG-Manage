import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConsultants } from "@/app/actions/users";
import { ConsultantsView } from "@/components/consultants/consultants-view";

export default async function ConsultantsPage() {
    const session = await auth();

    // Cast user to any to access role field (or extend type properly)
    if ((session?.user as any)?.role !== "DIRECTOR") {
        redirect("/dashboard-consultant");
    }

    const { success, data, error } = await getConsultants();

    if (!success) {
        return (
            <div className="p-8 text-center text-red-500">
                Une erreur est survenue: {error}
            </div>
        )
    }

    // Serialize data to pass to client component (dates/decimals need serialization usually, but server actions might handle it or we do it manually)
    // Next.js server components to client components serialization
    const serializedConsultants = JSON.parse(JSON.stringify(data));

    return (
        <ConsultantsView consultants={serializedConsultants} />
    );
}
