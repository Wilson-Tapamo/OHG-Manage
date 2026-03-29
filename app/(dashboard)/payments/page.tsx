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
    CreditCard,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";

export default function PaymentsPage() {
    const payments = [
        {
            id: "PAY-001",
            reference: "Wire Transfer #TRF123",
            invoice: "INV-001",
            client: "ABC Corporation",
            amount: "€15,000.00",
            status: "Completed",
            method: "Bank Transfer",
            date: "Dec 10, 2024",
            type: "incoming",
        },
        {
            id: "PAY-002",
            reference: "Card Payment #CRD456",
            invoice: "INV-002",
            client: "XYZ Holdings",
            amount: "€8,500.00",
            status: "Pending",
            method: "Credit Card",
            date: "Dec 18, 2024",
            type: "incoming",
        },
        {
            id: "PAY-003",
            reference: "Supplier Payment",
            invoice: "EXP-001",
            client: "Office Supplies Co.",
            amount: "€1,200.00",
            status: "Completed",
            method: "Bank Transfer",
            date: "Dec 05, 2024",
            type: "outgoing",
        },
        {
            id: "PAY-004",
            reference: "Wire Transfer #TRF789",
            invoice: "INV-004",
            client: "DEF Industries",
            amount: "€5,500.00",
            status: "Failed",
            method: "Bank Transfer",
            date: "Dec 01, 2024",
            type: "incoming",
        },
        {
            id: "PAY-005",
            reference: "Consultant Fee",
            invoice: "EXP-002",
            client: "John Doe",
            amount: "€3,500.00",
            status: "Completed",
            method: "Bank Transfer",
            date: "Dec 01, 2024",
            type: "outgoing",
        },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Completed":
                return { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle2 };
            case "Pending":
                return { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock };
            case "Failed":
                return { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle };
            default:
                return { color: "text-slate-600", bg: "bg-slate-100", icon: Clock };
        }
    };

    const summary = {
        totalReceived: "€23,500.00",
        totalPaid: "€4,700.00",
        pending: "€8,500.00",
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Payments
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track incoming and outgoing payments
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4" />
                    Record Payment
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Received</p>
                                <p className="text-xl font-bold text-green-600">
                                    {summary.totalReceived}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Paid</p>
                                <p className="text-xl font-bold text-red-600">
                                    {summary.totalPaid}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pending</p>
                                <p className="text-xl font-bold text-amber-600">
                                    {summary.pending}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Search payments..." className="pl-10" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4" />
                                Type
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4" />
                                Status
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments List */}
            <div className="space-y-3">
                {payments.map((payment) => {
                    const statusStyle = getStatusStyle(payment.status);
                    return (
                        <Card
                            key={payment.id}
                            className="hover:shadow-lg transition-all duration-300"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${payment.type === "incoming"
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : "bg-red-100 dark:bg-red-900/30"
                                            }`}
                                    >
                                        {payment.type === "incoming" ? (
                                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {payment.reference}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {payment.client} • {payment.invoice}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`font-bold ${payment.type === "incoming"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {payment.type === "incoming" ? "+" : "-"}
                                            {payment.amount}
                                        </p>
                                        <p className="text-xs text-slate-500">{payment.method}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}
                                        >
                                            {payment.status}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-400">{payment.date}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
