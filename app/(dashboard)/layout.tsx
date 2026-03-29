import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <DashboardLayout
            user={{
                name: session.user.name,
                email: session.user.email,
                avatar: (session.user as any).avatar,
                role: (session.user as any).role,
            }}
        >
            {children}
        </DashboardLayout>
    );
}
