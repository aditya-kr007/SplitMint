"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import {
    Receipt,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Search,
    TrendingUp,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
    const { formatCurrency, currency } = useCurrency();
    const allExpenses = useStore((state) => state.expenses);
    const allParticipants = useStore((state) => state.participants);
    const groups = useStore((state) => state.groups);
    const currentUser = useStore((state) => state.currentUser);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedParticipantName, setSelectedParticipantName] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
    const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Create activity feed from expenses
    const activityFeed = useMemo(() => {
        return allExpenses
            .map(expense => {
                const group = groups.find(g => g.id === expense.groupId);
                const paidByPerson = allParticipants.find(p => p.id === expense.paidBy);
                const splitWith = expense.splits.map(s =>
                    allParticipants.find(p => p.id === s.participantId)?.name
                ).filter(Boolean);
                const splitWithIds = expense.splits.map(s => s.participantId);

                return {
                    id: expense.id,
                    type: 'expense' as const,
                    description: expense.description,
                    amount: expense.amount,
                    date: expense.createdAt,
                    groupName: group?.name || 'Unknown Group',
                    groupId: expense.groupId,
                    paidBy: paidByPerson?.name || 'Unknown',
                    paidById: expense.paidBy,
                    splitWith: splitWith.join(', '),
                    splitWithNames: splitWith,
                    splitWithIds: splitWithIds,
                    splitCount: expense.splits.length
                };
            })
            .sort((a, b) => b.date - a.date);
    }, [allExpenses, allParticipants, groups]);

    const filteredActivityFeed = useMemo(() => {
        return activityFeed.filter(activity => {
            // Text Search
            const matchesSearch =
                activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.paidBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.groupName.toLowerCase().includes(searchQuery.toLowerCase());

            // Group Filter
            const matchesGroup = selectedGroupId ? activity.groupId === selectedGroupId : true;

            // Participant Filter (Paid by OR Split with)
            const matchesParticipant = selectedParticipantName
                ? (activity.paidBy === selectedParticipantName || activity.splitWithNames.includes(selectedParticipantName))
                : true;

            // Date Range Filter
            let matchesDate = true;
            if (dateRange.from) {
                matchesDate = matchesDate && activity.date >= new Date(dateRange.from).getTime();
            }
            if (dateRange.to) {
                // Add one day to include the end date fully
                const endDate = new Date(dateRange.to);
                endDate.setDate(endDate.getDate() + 1);
                matchesDate = matchesDate && activity.date < endDate.getTime();
            }

            // Amount Range Filter
            let matchesAmount = true;
            if (amountRange.min) {
                matchesAmount = matchesAmount && activity.amount >= parseFloat(amountRange.min);
            }
            if (amountRange.max) {
                matchesAmount = matchesAmount && activity.amount <= parseFloat(amountRange.max);
            }

            return matchesSearch && matchesGroup && matchesParticipant && matchesDate && matchesAmount;
        });
    }, [activityFeed, searchQuery, selectedGroupId, selectedParticipantName, dateRange, amountRange]);

    // Stats
    const thisMonthExpenses = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return allExpenses.filter(e => e.createdAt >= startOfMonth);
    }, [allExpenses]);

    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avgPerExpense = allExpenses.length > 0
        ? allExpenses.reduce((sum, e) => sum + e.amount, 0) / allExpenses.length
        : 0;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Activity</h1>
                    <p className="text-muted-foreground">Track all expenses across your groups</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 opacity-80" />
                        <p className="text-emerald-100 text-xs font-medium">This Month</p>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">{formatCurrency(thisMonthTotal)}</h3>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs font-medium">Total Transactions</p>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">{allExpenses.length}</h3>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs font-medium">This Month</p>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">{thisMonthExpenses.length}</h3>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs font-medium">Avg per Expense</p>
                    </div>
                    <h3 className="text-2xl font-bold font-heading">{formatCurrency(avgPerExpense)}</h3>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search expenses, people, or groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-muted transition-colors min-w-[100px] justify-between ${(selectedGroupId || selectedParticipantName || dateRange.from || dateRange.to || amountRange.min || amountRange.max)
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-card border-border'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="font-medium text-sm hidden sm:inline">Filters</span>
                        </div>
                    </button>

                    {isFilterOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden p-4 space-y-4">

                                {/* Group Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Group</label>
                                    <select
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={selectedGroupId || ""}
                                        onChange={(e) => setSelectedGroupId(e.target.value || null)}
                                    >
                                        <option value="">All Groups</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Participant Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Participant</label>
                                    <select
                                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={selectedParticipantName || ""}
                                        onChange={(e) => setSelectedParticipantName(e.target.value || null)}
                                    >
                                        <option value="">Anyone</option>
                                        {allParticipants
                                            // Deduplicate by name
                                            .filter((p, index, self) => index === self.findIndex(t => t.name === p.name))
                                            .map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">From</span>
                                            <input
                                                type="date"
                                                className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={dateRange.from}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground">To</span>
                                            <input
                                                type="date"
                                                className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={dateRange.to}
                                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Amount ({currency})</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={amountRange.min}
                                            onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            value={amountRange.max}
                                            onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <button
                                    onClick={() => {
                                        setSelectedGroupId(null);
                                        setSelectedParticipantName(null);
                                        setDateRange({ from: "", to: "" });
                                        setAmountRange({ min: "", max: "" });
                                        setIsFilterOpen(false);
                                    }}
                                    className="w-full py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold font-heading">Recent Activity</h2>

                {filteredActivityFeed.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-2xl">
                        <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold mb-1">No activities found</h3>
                        <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredActivityFeed.map((activity) => (
                            <div
                                key={activity.id}
                                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:border-primary/30"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                            <Receipt className="w-5 h-5" />
                                        </div>

                                        {/* Details */}
                                        <div>
                                            <h4 className="font-bold">{activity.description}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">{activity.paidBy}</span> paid • Split with {activity.splitCount} people
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-1 bg-muted rounded-full font-medium">
                                                    {activity.groupName}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(activity.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold font-heading text-primary">
                                            {formatCurrency(activity.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
