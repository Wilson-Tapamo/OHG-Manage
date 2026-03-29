'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"

// Generate invoice number
function generateInvoiceNumber() {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `FAC-${year}-${random}`
}

// Get all invoices
export async function getInvoices(filters?: {
    status?: string
    projectId?: string
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    const where: any = {}
    if (filters?.status && filters.status !== 'ALL') where.status = filters.status
    if (filters?.projectId) where.projectId = filters.projectId

    try {
        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                project: { select: { id: true, name: true, clientName: true } },
                lines: true,
                payments: true,
                _count: { select: { lines: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, data: JSON.parse(JSON.stringify(invoices)) }
    } catch (error) {
        console.error("Get invoices error:", error)
        return { success: false, error: "Erreur" }
    }
}

// Get invoice by ID with full details
export async function getInvoiceById(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        clientName: true,
                        clientEmail: true,
                        clientPhone: true,
                        clientContact: true
                    }
                },
                lines: {
                    include: {
                        task: { select: { id: true, title: true } }
                    },
                    orderBy: { type: 'asc' }
                },
                payments: true,
                user: { select: { id: true, name: true } }
            }
        })

        return { success: true, data: JSON.parse(JSON.stringify(invoice)) }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Create invoice for project (auto or manual)
export async function createInvoiceForProject(projectId: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        // Check if project already has a draft invoice
        const existingDraft = await prisma.invoice.findFirst({
            where: { projectId, status: 'DRAFT' }
        })

        if (existingDraft) {
            return { success: true, data: existingDraft }
        }

        // Create new invoice
        const invoice = await prisma.invoice.create({
            data: {
                number: generateInvoiceNumber(),
                projectId,
                userId: (session.user as any).id,
                subtotal: 0,
                taxRate: 19.25,
                tax: 0,
                total: 0
            }
        })

        revalidatePath("/finance")
        return { success: true, data: invoice }
    } catch (error) {
        console.error("Create invoice error:", error)
        return { success: false, error: "Erreur lors de la création" }
    }
}

// Add line to invoice
export async function addInvoiceLine(invoiceId: string, data: {
    type: 'HOURS' | 'PERDIEM' | 'DEBOURS' | 'TRANSPORT' | 'OTHER'
    description: string
    quantity: number
    unitPrice: number
    taskId?: string
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const amount = data.quantity * data.unitPrice

        await prisma.invoiceLine.create({
            data: {
                invoiceId,
                type: data.type,
                description: data.description,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                amount,
                taskId: data.taskId
            }
        })

        // Recalculate invoice totals
        await recalculateInvoice(invoiceId)

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        console.error("Add line error:", error)
        return { success: false, error: "Erreur" }
    }
}

// Update invoice line
export async function updateInvoiceLine(lineId: string, data: {
    description?: string
    quantity?: number
    unitPrice?: number
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const line = await prisma.invoiceLine.findUnique({ where: { id: lineId } })
        if (!line) return { success: false, error: "Ligne introuvable" }

        // Check if invoice is validated
        const invoice = await prisma.invoice.findUnique({ where: { id: line.invoiceId } })
        if (invoice?.validated) {
            return { success: false, error: "Facture déjà validée" }
        }

        const quantity = data.quantity ?? Number(line.quantity)
        const unitPrice = data.unitPrice ?? Number(line.unitPrice)
        const amount = quantity * unitPrice

        await prisma.invoiceLine.update({
            where: { id: lineId },
            data: {
                description: data.description,
                quantity,
                unitPrice,
                amount
            }
        })

        // Recalculate invoice totals
        await recalculateInvoice(line.invoiceId)

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Delete invoice line
export async function deleteInvoiceLine(lineId: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const line = await prisma.invoiceLine.findUnique({ where: { id: lineId } })
        if (!line) return { success: false, error: "Ligne introuvable" }

        const invoice = await prisma.invoice.findUnique({ where: { id: line.invoiceId } })
        if (invoice?.validated) {
            return { success: false, error: "Facture déjà validée" }
        }

        await prisma.invoiceLine.delete({ where: { id: lineId } })
        await recalculateInvoice(line.invoiceId)

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Recalculate invoice totals
async function recalculateInvoice(invoiceId: string) {
    const lines = await prisma.invoiceLine.findMany({
        where: { invoiceId }
    })

    const subtotal = lines.reduce((sum: number, line: any) => sum + Number(line.amount), 0)

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    const taxRate = Number(invoice?.taxRate || 19.25)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { subtotal, tax, total }
    })
}

// Validate invoice (lock it)
export async function validateInvoice(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { lines: true }
        })

        if (!invoice) return { success: false, error: "Facture introuvable" }
        if (invoice.validated) return { success: false, error: "Déjà validée" }
        if (invoice.lines.length === 0) {
            return { success: false, error: "Ajoutez au moins une ligne" }
        }

        await prisma.invoice.update({
            where: { id },
            data: {
                validated: true,
                status: 'SENT',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        })

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Mark invoice as paid
export async function markInvoiceAsPaid(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: 'PAID',
                paidDate: new Date()
            },
            include: { project: true }
        })

        if (invoice.project?.managerId) {
            await createNotification({
                userId: invoice.project.managerId,
                type: "PAYMENT",
                title: "Facture Payée",
                message: `La facture ${invoice.number} pour le projet "${invoice.project.name}" a été payée.`,
                link: "/finance"
            })
        }

        // Create income entry
        await prisma.financeEntry.create({
            data: {
                type: 'INCOME',
                amount: Number(invoice.total),
                description: `Paiement facture ${invoice.number}`,
                category: 'Paiement Client',
                projectId: invoice.projectId,
                invoiceId: id,
                createdById: (session.user as any).id
            }
        })

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Delete invoice (only drafts)
export async function deleteInvoice(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
        return { success: false, error: "Non autorisé" }
    }

    try {
        const invoice = await prisma.invoice.findUnique({ where: { id } })
        if (invoice?.validated) {
            return { success: false, error: "Impossible de supprimer une facture validée" }
        }

        await prisma.invoice.delete({ where: { id } })
        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erreur" }
    }
}

// Add invoice lines from completed task (auto-invoicing)
export async function addTaskToInvoice(taskId: string) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Non autorisé" }

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
                workedHours: {
                    include: {
                        user: { select: { id: true, name: true, hourlyRate: true } }
                    }
                }
            }
        })

        if (!task) return { success: false, error: "Tâche introuvable" }

        // Find or create draft invoice for project
        let invoice = await prisma.invoice.findFirst({
            where: { projectId: task.projectId, status: 'DRAFT' }
        })

        if (!invoice) {
            invoice = await prisma.invoice.create({
                data: {
                    number: generateInvoiceNumber(),
                    projectId: task.projectId,
                    userId: (session.user as any).id,
                    subtotal: 0,
                    taxRate: 19.25,
                    tax: 0,
                    total: 0
                }
            })
        }

        // Add lines for worked hours (per consultant)
        for (const wh of task.workedHours) {
            await prisma.invoiceLine.create({
                data: {
                    invoiceId: invoice.id,
                    taskId: task.id,
                    type: 'HOURS',
                    description: `Heures - ${wh.user.name || 'Consultant'} - ${task.title}`,
                    quantity: Number(wh.hours),
                    unitPrice: Number(wh.user.hourlyRate || 0),
                    amount: Number(wh.hours) * Number(wh.user.hourlyRate || 0)
                }
            })

            // Create expense entry for consultant payment
            await prisma.financeEntry.create({
                data: {
                    type: 'EXPENSE',
                    amount: Number(wh.hours) * Number(wh.user.hourlyRate || 0),
                    description: `Paiement ${wh.user.name} - ${task.title}`,
                    category: 'Honoraires Consultants',
                    projectId: task.projectId,
                    taskId: task.id,
                    invoiceId: invoice.id,
                    createdById: (session.user as any).id
                }
            })
        }

        // Add perdiem line if > 0
        if (Number(task.budgetPerdiem) > 0) {
            await prisma.invoiceLine.create({
                data: {
                    invoiceId: invoice.id,
                    taskId: task.id,
                    type: 'PERDIEM',
                    description: `Per diem - ${task.title}`,
                    quantity: 1,
                    unitPrice: Number(task.budgetPerdiem),
                    amount: Number(task.budgetPerdiem)
                }
            })

            await prisma.financeEntry.create({
                data: {
                    type: 'EXPENSE',
                    amount: Number(task.budgetPerdiem),
                    description: `Per diem - ${task.title}`,
                    category: 'Per Diem',
                    projectId: task.projectId,
                    taskId: task.id,
                    createdById: (session.user as any).id
                }
            })
        }

        // Add debours line if > 0
        if (Number(task.budgetDebours) > 0) {
            await prisma.invoiceLine.create({
                data: {
                    invoiceId: invoice.id,
                    taskId: task.id,
                    type: 'DEBOURS',
                    description: `Débours - ${task.title}`,
                    quantity: 1,
                    unitPrice: Number(task.budgetDebours),
                    amount: Number(task.budgetDebours)
                }
            })

            await prisma.financeEntry.create({
                data: {
                    type: 'EXPENSE',
                    amount: Number(task.budgetDebours),
                    description: `Débours - ${task.title}`,
                    category: 'Débours',
                    projectId: task.projectId,
                    taskId: task.id,
                    createdById: (session.user as any).id
                }
            })
        }

        // Add transport line if > 0
        if (Number(task.budgetTransport) > 0) {
            await prisma.invoiceLine.create({
                data: {
                    invoiceId: invoice.id,
                    taskId: task.id,
                    type: 'TRANSPORT',
                    description: `Transport - ${task.title}`,
                    quantity: 1,
                    unitPrice: Number(task.budgetTransport),
                    amount: Number(task.budgetTransport)
                }
            })

            await prisma.financeEntry.create({
                data: {
                    type: 'EXPENSE',
                    amount: Number(task.budgetTransport),
                    description: `Transport - ${task.title}`,
                    category: 'Transport',
                    projectId: task.projectId,
                    taskId: task.id,
                    createdById: (session.user as any).id
                }
            })
        }

        // Recalculate invoice
        await recalculateInvoice(invoice.id)

        // Notify Invoice Owner (Director)
        if (invoice.userId !== (session.user as any).id) {
            await createNotification({
                userId: invoice.userId,
                type: "INVOICE",
                title: "Facture Mise à jour",
                message: `Lignes ajoutées auto. suite à la tâche "${task.title}"`,
                link: `/finance` // Or deep link to invoice
            })
        }

        revalidatePath("/finance")
        return { success: true }
    } catch (error) {
        console.error("Add task to invoice error:", error)
        return { success: false, error: "Erreur" }
    }
}
