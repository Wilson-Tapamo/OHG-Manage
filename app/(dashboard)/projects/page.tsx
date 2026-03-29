import { auth } from "@/lib/auth";
import { getProjects, getConsultants } from "@/app/actions/projects";
import { ProjectsView } from "@/components/projects/projects-view";
import { redirect } from "next/navigation";

// Next.js 15: searchParams is a Promise
export default async function ProjectsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/");
    }

    const resolvedSearchParams = await searchParams;
    const filters = {
        search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
        status: typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined,
        consultantId: typeof resolvedSearchParams.consultantId === 'string' ? resolvedSearchParams.consultantId : undefined,
    };

    // Fetch projects
    const projectsResult = await getProjects(filters);
    const projects = projectsResult.success ? projectsResult.data : [];

    // Fetch consultants (for modal)
    const consultantsResult = await getConsultants();
    const consultants = consultantsResult.success ? consultantsResult.data : [];

    const currentUserRole = (session.user as any).role; // Type cast if needed

    // Serialize to plain objects (converts Decimals to strings/numbers)
    const serializedProjects = JSON.parse(JSON.stringify(projects))
    const serializedConsultants = JSON.parse(JSON.stringify(consultants))

    return (
        <ProjectsView
            initialProjects={serializedProjects}
            consultants={serializedConsultants}
            currentUserRole={currentUserRole}
        />
    );
}
