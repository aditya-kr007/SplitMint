"use client";

import { useStore, Expense, Participant } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import { Receipt, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

interface ExpenseListProps {
    expenses: Expense[];
    participants: Participant[];
    onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, participants, onEdit }: ExpenseListProps) {
    const { formatCurrency } = useCurrency();
    const deleteExpense = useStore((state) => state.deleteExpense);
    const currentUser = useStore((state) => state.currentUser);

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Receipt className="w-6 h-6 opacity-50" />
                </div>
                <p>No expenses yet. Add one to get started!</p>
            </div>
        );
    }

    // Sort by date desc
    // Using date field if available, fallback to createdAt
    const sortedExpenses = [...expenses].sort((a, b) => (b.date || b.createdAt) - (a.date || a.createdAt));

    return (
        <div className="space-y-4">
            {sortedExpenses.map((expense) => {
                const payer = participants.find(p => p.id === expense.paidBy);
                const date = format(new Date(expense.date || expense.createdAt), 'MMM d');

                return (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex flex-col items-center justify-center text-xs font-bold leading-none">
                                <span className="uppercase">{date.split(' ')[0]}</span>
                                <span className="text-sm">{date.split(' ')[1]}</span>
                            </div>

                            <div>
                                <h4 className="font-bold text-base">{expense.description}</h4>
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{payer?.name || 'Unknown'}</span> paid {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                {/* Logic to show lending/borrowing details could go here */}
                                {/* For now just amount */}
                                <span className="font-bold font-heading">{formatCurrency(expense.amount)}</span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => onEdit(expense)}
                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    title="Edit Expense"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                                    title="Delete Expense"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
