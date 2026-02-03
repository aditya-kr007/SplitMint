"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { calculateNetBalances } from "@/lib/balance-engine";
import { useCurrency } from "@/lib/useCurrency";
import { Search, Plus, Users, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function DashboardPage() {
    const { formatCurrency } = useCurrency();
    const currentUser = useStore((state) => state.currentUser);
    const groups = useStore((state) => state.groups);
    const allExpenses = useStore((state) => state.expenses);
    const allParticipants = useStore((state) => state.participants);
    const createGroup = useStore((state) => state.createGroup);
    const addParticipant = useStore((state) => state.addParticipant);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    // Calculate accurate balances across all groups
    const balanceStats = useMemo(() => {
        let totalBalance = 0;  // Net balance (positive = owed to you, negative = you owe)
        let youOwe = 0;        // Total amount you owe to others
        let youAreOwed = 0;    // Total amount others owe you
        let totalSpent = 0;    // Your total share of expenses

        // Calculate per group
        groups.forEach(group => {
            const groupParticipants = allParticipants.filter(p => p.groupId === group.id);
            const groupExpenses = allExpenses.filter(e => e.groupId === group.id);

            if (groupExpenses.length === 0 || groupParticipants.length === 0) return;

            // Find the current user's participant record in this group
            const userParticipant = groupParticipants.find(p =>
                p.name === currentUser?.name || p.userId === currentUser?.id
            );

            if (!userParticipant) return;

            // Calculate net balances for this group
            const netBalances = calculateNetBalances(groupExpenses, groupParticipants);
            const userBalance = netBalances[userParticipant.id] || 0;

            // Accumulate total balance
            totalBalance += userBalance;

            // Calculate what user owes vs what user is owed
            if (userBalance < 0) {
                youOwe += Math.abs(userBalance);
            } else if (userBalance > 0) {
                youAreOwed += userBalance;
            }

            // Calculate user's total share of expenses (sum of their splits)
            groupExpenses.forEach(expense => {
                const userSplit = expense.splits.find(s => s.participantId === userParticipant.id);
                if (userSplit) {
                    totalSpent += userSplit.amount;
                }
            });
        });

        return {
            totalBalance: Math.round(totalBalance * 100) / 100,
            youOwe: Math.round(youOwe * 100) / 100,
            youAreOwed: Math.round(youAreOwed * 100) / 100,
            totalSpent: Math.round(totalSpent * 100) / 100
        };
    }, [groups, allExpenses, allParticipants, currentUser]);

    // Calculate per-group balance for display on cards
    const groupBalances = useMemo(() => {
        const balances: Record<string, number> = {};

        groups.forEach(group => {
            const groupParticipants = allParticipants.filter(p => p.groupId === group.id);
            const groupExpenses = allExpenses.filter(e => e.groupId === group.id);

            const userParticipant = groupParticipants.find(p =>
                p.name === currentUser?.name || p.userId === currentUser?.id
            );

            if (!userParticipant || groupExpenses.length === 0) {
                balances[group.id] = 0;
                return;
            }

            const netBalances = calculateNetBalances(groupExpenses, groupParticipants);
            balances[group.id] = Math.round((netBalances[userParticipant.id] || 0) * 100) / 100;
        });

        return balances;
    }, [groups, allExpenses, allParticipants, currentUser]);

    // Get participant count per group
    const groupParticipantCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        groups.forEach(group => {
            counts[group.id] = allParticipants.filter(p => p.groupId === group.id).length;
        });
        return counts;
    }, [groups, allParticipants]);

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim() || !currentUser) return;

        const group = createGroup(newGroupName, currentUser.id);

        // Add current user as first participant
        addParticipant(currentUser.name, group.id);

        setNewGroupName("");
        setIsCreateModalOpen(false);
    };

    const userGroups = groups;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
                    <p className="text-muted-foreground">Track your shared expenses</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Create Group
                </button>
            </div>

            {/* Summary Cards with Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Balance Card */}
                <div className={`p-6 rounded-2xl shadow-xl ${balanceStats.totalBalance >= 0
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-red-500 to-orange-600'
                    } text-white`}>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
                    <h3 className="text-3xl font-bold font-heading">
                        {balanceStats.totalBalance >= 0 ? '+' : ''}{formatCurrency(balanceStats.totalBalance)}
                    </h3>
                    <p className="text-white/80 text-sm mt-2">
                        {balanceStats.totalBalance >= 0 ? 'You are owed' : 'You owe overall'}
                    </p>
                </div>

                {/* You Owe Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <p className="text-muted-foreground text-sm font-medium mb-1">You Owe</p>
                    <h3 className={`text-3xl font-bold font-heading ${balanceStats.youOwe > 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                        {formatCurrency(balanceStats.youOwe)}
                    </h3>
                    <p className="text-muted-foreground text-xs mt-2">
                        {balanceStats.youOwe > 0 ? 'Pending settlements' : 'All settled up!'}
                    </p>
                </div>

                {/* Total Spent Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                    <p className="text-muted-foreground text-sm font-medium mb-1">Your Share</p>
                    <h3 className="text-3xl font-bold font-heading">{formatCurrency(balanceStats.totalSpent)}</h3>
                    <p className="text-muted-foreground text-xs mt-2">Total expenses on you</p>
                </div>
            </div>

            {/* Groups Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-heading">Active Groups</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:bg-background transition-colors"
                        />
                    </div>
                </div>

                {userGroups.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold">No groups yet</h3>
                        <p className="text-muted-foreground mb-6">Create a group to start splitting expenses.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-primary font-bold hover:underline"
                        >
                            Create your first group
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userGroups.map((group) => {
                            const balance = groupBalances[group.id] || 0;
                            const participantCount = groupParticipantCounts[group.id] || 0;

                            return (
                                <Link
                                    key={group.id}
                                    href={`/dashboard/groups/${group.id}`}
                                    className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="text-primary" />
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 mb-4 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                                        {group.name[0].toUpperCase()}
                                    </div>
                                    <h3 className="font-heading font-bold text-lg mb-1">{group.name}</h3>
                                    <p className="text-muted-foreground text-sm mb-2">
                                        {participantCount} {participantCount === 1 ? 'member' : 'members'}
                                    </p>
                                    <p className="text-sm">
                                        {balance > 0 ? (
                                            <span className="text-green-600 font-bold">You are owed {formatCurrency(balance)}</span>
                                        ) : balance < 0 ? (
                                            <span className="text-red-500 font-bold">You owe {formatCurrency(Math.abs(balance))}</span>
                                        ) : (
                                            <span className="text-muted-foreground">Settled up</span>
                                        )}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create a New Group"
            >
                <form onSubmit={handleCreateGroup} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Group Name</label>
                        <input
                            type="text"
                            required
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="e.g. Summer Trip 2024"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-muted-foreground font-medium hover:bg-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
                        >
                            Create Group
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

