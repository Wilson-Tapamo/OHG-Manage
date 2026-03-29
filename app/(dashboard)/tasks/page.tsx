import { auth } from "@/lib/auth"
import { getTasks } from "@/app/actions/tasks"
import { getProjects, getConsultants } from "@/app/actions/projects"
import { TasksView } from "@/components/tasks/tasks-view"
import { redirect } from "next/navigation"

export default async function TasksPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const resolvedSearchParams = await searchParams

    // Parse filters
    const filters = {
        status: typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined,
        assigneeId: typeof resolvedSearchParams.assigneeId === 'string' ? resolvedSearchParams.assigneeId : undefined,
        search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
        projectId: typeof resolvedSearchParams.projectId === 'string' ? resolvedSearchParams.projectId : undefined,
    }

    const [tasksRes, projectsRes, consultantsRes] = await Promise.all([
        getTasks(filters),
        getProjects(),
        getConsultants()
    ])

    const tasks = tasksRes.success ? tasksRes.data : []
    const projects = projectsRes.success ? projectsRes.data : []
    const consultants = consultantsRes.success ? consultantsRes.data : []

    const serializedTasks = JSON.parse(JSON.stringify(tasks))
    const serializedProjects = JSON.parse(JSON.stringify(projects))
    const serializedConsultants = JSON.parse(JSON.stringify(consultants))

    return (
        <div className="flex-1 space-y-4">
            <TasksView
                initialTasks={serializedTasks}
                projects={serializedProjects}
                consultants={serializedConsultants}
                currentUser={session.user}
            />
        </div>
    )
}
