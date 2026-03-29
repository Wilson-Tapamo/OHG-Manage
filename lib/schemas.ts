import { z } from "zod"

export const TaskSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),
    projectId: z.string().min(1, "Le projet est requis"),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).default("TODO"),
    priority: z.coerce.number().min(1).max(3).default(1),

    // Budget
    budgetDebours: z.coerce.number().optional().default(0),
    budgetPerdiem: z.coerce.number().optional().default(0),
    budgetTransport: z.coerce.number().optional().default(0),

    dueDate: z.date().optional(),

    assigneeIds: z.array(z.string()).optional(),

    // Initial subtasks (optional)
    initialSubtasks: z.array(z.string()).optional(),
})

export type TaskInput = z.infer<typeof TaskSchema>

export const ConsultantSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().optional(), // Optional for update
    phone: z.string().optional(),

    title: z.string().optional(),
    description: z.string().optional(),
    hourlyRate: z.coerce.number().min(0).default(0),
    level: z.enum(["JUNIOR", "INTERMEDIATE", "SENIOR", "DIRECTOR"]).default("JUNIOR"),
    rating: z.coerce.number().min(0).max(5).default(0),

    skills: z.array(z.string()).optional(),
    education: z.array(z.object({
        degree: z.string(),
        school: z.string(),
        year: z.string()
    })).optional(),
    experience: z.array(z.object({
        title: z.string(),
        company: z.string(),
        duration: z.string(),
        description: z.string().optional()
    })).optional(),
})

export type ConsultantInput = z.infer<typeof ConsultantSchema>
