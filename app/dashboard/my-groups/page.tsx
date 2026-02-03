"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import {
    Users,
    ArrowRight,
    Plus,
    TrendingUp,
    Calendar
} from "lucide-react";

export default function MyGroupsPage() {
    const { formatCurrency } = useCurrency();
    const currentUser = useStore((state) => state.currentUser);
    const groups = useStore((state) => state.groups);
    const allParticipants = useStore((state) => state.participants);
    const allExpenses = useStore((state) => state.expenses);

    // Calculate stats for each group
    const groupsWithStats = useMemo(() => {
        return groups.map(group => {
            const participants = allParticipants.filter(p => p.groupId === group.id);
            const expenses = allExpenses.filter(e => e.groupId === group.id);
            const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
            const recentActivity = expenses.length > 0
                ? new Date(Math.max(...expenses.map(e => e.createdAt))).toLocaleDateString()
                : 'No activity';

            return {
                ...group,
                participantCount: participants.length,
                totalSpent,
                expenseCount: expenses.length,
                recentActivity
            };
        });
    }, [groups, allParticipants, allExpenses]);

    const totalGroups = groups.length;
    const totalExpenses = allExpenses.length;
    const overallSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">My Groups</h1>
                    <p className="text-muted-foreground">Manage all your expense groups</p>
                </div>
                <Link
                    href="/dashboard"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-95 w-fit"
                >
                    <Plus className="w-5 h-5" /> Create Group
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 opacity-80" />
                        <p className="text-violet-100 text-sm font-medium">Total Groups</p>
                    </div>
                    <h3 className="text-4xl font-bold font-heading">{totalGroups}</h3>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm font-medium">Total Expenses</p>
                    </div>
                    <h3 className="text-4xl font-bold font-heading">{totalExpenses}</h3>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm font-medium">Overall Spent</p>
                    </div>
                    <h3 className="text-4xl font-bold font-heading">{formatCurrency(overallSpent)}</h3>
                </div>
            </div>

            {/* Groups Grid */}
            {groupsWithStats.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold">No groups yet</h3>
                    <p className="text-muted-foreground mb-6">Create a group to start splitting expenses.</p>
                    <Link href="/dashboard" className="text-primary font-bold hover:underline">
                        Create your first group
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupsWithStats.map((group) => (
                        <Link
                            key={group.id}
                            href={`/dashboard/groups/${group.id}`}
                            className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="text-primary" />
                            </div>

                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                                {group.name[0].toUpperCase()}
                            </div>

                            {/* Info */}
                            <h3 className="font-heading font-bold text-lg mb-1">{group.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.participantCount} members
                            </p>

                            {/* Stats */}
                            <div className="pt-4 border-t border-border space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Spent</span>
                                    <span className="font-bold">{formatCurrency(group.totalSpent)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Expenses</span>
                                    <span className="font-medium">{group.expenseCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Last Activity</span>
                                    <span className="font-medium text-xs">{group.recentActivity}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
