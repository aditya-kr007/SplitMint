"use client";

import { useStore, Participant, Expense } from "@/lib/store";
import { calculateNetBalances, suggestSettlements } from "@/lib/balance-engine";
import { useCurrency } from "@/lib/useCurrency";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceViewProps {
    expenses: Expense[];
    participants: Participant[];
}

export function BalanceView({ expenses, participants }: BalanceViewProps) {
    const { formatCurrency } = useCurrency();
    const netBalances = calculateNetBalances(expenses, participants);
    const settlements = suggestSettlements(netBalances);

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Add expenses to see balances.</p>
            </div>
        );
    }

    if (settlements.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">You are all settled up!</h3>
                <p className="text-muted-foreground">No one owes anything.</p>
            </div>
        );
    }

    const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
    const maxSpend = Math.max(...participants.map(p =>
        expenses.filter(e => e.paidBy === p.id).reduce((sum, e) => sum + e.amount, 0)
    ), 1); // Avoid div by zero

    return (
        <div className="space-y-8">
            {/* Spending Summary (Contributions) */}
            <div>
                <h3 className="font-bold font-heading text-lg mb-4">Total Contributions</h3>
                <div className="space-y-3">
                    {participants.map(p => {
                        const totalPaid = expenses
                            .filter(e => e.paidBy === p.id)
                            .reduce((sum, e) => sum + e.amount, 0);
                        const percentage = Math.round((totalPaid / (totalGroupSpend || 1)) * 100);

                        return (
                            <div key={p.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-muted-foreground">
                                        {formatCurrency(totalPaid)} ({percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/80 rounded-full transition-all duration-500"
                                        style={{ width: `${(totalPaid / maxSpend) * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Visual Graph (Simplistic List for now) */}
            <div className="grid gap-4">
                <h3 className="font-bold font-heading text-lg">Settlements</h3>
                {settlements.map((debt, idx) => {
                    const from = participants.find(p => p.id === debt.from);
                    const to = participants.find(p => p.id === debt.to);

                    return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center font-bold text-sm">
                                    {from?.name?.[0]}
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">{from?.name}</span>
                                    <span className="text-muted-foreground"> owes </span>
                                    <span className="font-bold">{to?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-bold font-heading text-lg text-primary">
                                    {formatCurrency(debt.amount)}
                                </span>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center font-bold text-sm">
                                    {to?.name?.[0]}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Net Balances Table */}
            <div className="mt-8">
                <h3 className="font-bold font-heading text-lg mb-4">Net Balances</h3>
                <div className="space-y-2">
                    {participants.map(p => {
                        const balance = netBalances[p.id] || 0;
                        const isPositive = balance > 0;
                        const isZero = Math.abs(balance) < 0.01;

                        return (
                            <div key={p.id} className="flex justify-between items-center py-2 px-3 hover:bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                        {p.name[0]}
                                    </div>
                                    <span>{p.name}</span>
                                </div>
                                <span className={cn(
                                    "font-bold font-heading",
                                    isZero ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-500"
                                )}>
                                    {isZero ? "-" : (isPositive ? "+" : "") + formatCurrency(balance)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
