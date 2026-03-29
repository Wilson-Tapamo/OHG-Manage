import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Receipt,
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Send,
} from "lucide-react";

export default function InvoicesPage() {
    const invoices = [
        {
            id: "INV-001",
            client: "ABC Corporation",
            project: "Corporate Merger ABC",
            amount: "€15,000.00",
            status: "Paid",
            dueDate: "Dec 15, 2024",
            issuedDate: "Nov 15, 2024",
        },
        {
            id: "INV-002",
            client: "XYZ Holdings",
            project: "Due Diligence XYZ",
            amount: "€8,500.00",
            status: "Sent",
            dueDate: "Dec 20, 2024",
            issuedDate: "Nov 20, 2024",
        },
        {
            id: "INV-003",
            client: "GHI Partners",
            project: "Legal Audit GHI",
            amount: "€12,000.00",
            status: "Draft",
            dueDate: "Dec 25, 2024",
            issuedDate: "Nov 25, 2024",
        },
        {
            id: "INV-004",
            client: "DEF Industries",
            project: "Contract Review DEF",
            amount: "€5,500.00",
            status: "Overdue",
            dueDate: "Nov 30, 2024",
            issuedDate: "Oct 30, 2024",
        },
        {
            id: "INV-005",
            client: "MNO Financial",
            project: "Regulatory Compliance MNO",
            amount: "€22,000.00",
            status: "Sent",
            dueDate: "Jan 05, 2025",
            issuedDate: "Dec 05, 2024",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "Sent":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Draft":
                return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
            case "Overdue":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const summary = {
        total: "€63,000.00",
        paid: "€15,000.00",
        pending: "€30,500.00",
        overdue: "€5,500.00",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Invoices
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Create and manage client invoices
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4" />
                    New Invoice
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Total Invoiced</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {summary.total}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Paid</p>
                        <p className="text-2xl font-bold text-green-600">{summary.paid}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Search invoices..." className="pl-10" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4" />
                                Status
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4" />
                                Date Range
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Invoice
                                    </th>
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Client
                                    </th>
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Amount
                                    </th>
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Status
                                    </th>
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Due Date
                                    </th>
                                    <th className="text-left p-4 font-medium text-slate-500 text-sm">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {invoice.id}
                                                </p>
                                                <p className="text-xs text-slate-500">{invoice.project}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {invoice.client}
                                        </td>
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">
                                            {invoice.amount}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    invoice.status
                                                )}`}
                                            >
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500">{invoice.dueDate}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
