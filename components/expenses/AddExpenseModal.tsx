"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore, Participant, ExpenseSplitType, Expense } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import { Modal } from "@/components/ui/modal";
import { Check, User, Calendar as CalendarIcon, DollarSign, Percent, Divide } from "lucide-react";
import { cn } from "@/lib/utils";
import { distributeEqualSplits, validateExactSplits, validatePercentageSplits, calculatePercentageSplits, SplitResult } from "@/lib/split-utils";
import { format } from "date-fns";

// Currency symbol mapping
const currencySymbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$',
    AUD: 'A$', JPY: '¥', CNY: '¥', CHF: 'CHF', SGD: 'S$',
};

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    existingExpense?: Expense;
}

export function AddExpenseModal({ isOpen, onClose, groupId, existingExpense }: AddExpenseModalProps) {
    const { currency, formatCurrency } = useCurrency();
    const currentUser = useStore((state) => state.currentUser);
    const allParticipants = useStore((state) => state.participants);
    const addExpense = useStore((state) => state.addExpense);
    const editExpense = useStore((state) => state.editExpense);

    const currencySymbol = currencySymbols[currency] || currency;
    const participants = useMemo(() => allParticipants.filter(p => p.groupId === groupId), [allParticipants, groupId]);

    // Form Stats
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [date, setDate] = useState("");
    const [splitType, setSplitType] = useState<ExpenseSplitType>("EQUAL");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    // Advanced Split State
    const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
    const [percentages, setPercentages] = useState<Record<string, string>>({});

    // Reset or Load existing data
    useEffect(() => {
        if (isOpen) {
            if (existingExpense) {
                // Edit Mode
                setDescription(existingExpense.description);
                setAmount(existingExpense.amount.toString());
                setPaidBy(existingExpense.paidBy);
                setDate(format(new Date(existingExpense.date), 'yyyy-MM-dd'));
                setSplitType(existingExpense.splitType);

                const participantIds = existingExpense.splits.map(s => s.participantId);
                setSelectedParticipants(participantIds);

                if (existingExpense.splitType === 'EXACT') {
                    const amounts: Record<string, string> = {};
                    existingExpense.splits.forEach(s => amounts[s.participantId] = s.amount.toString());
                    setExactAmounts(amounts);
                } else if (existingExpense.splitType === 'PERCENTAGE') {
                    const percs: Record<string, string> = {};
                    existingExpense.splits.forEach(s => percs[s.participantId] = (s.percentage || 0).toString());
                    setPercentages(percs);
                }
            } else {
                // Create Mode
                setDescription("");
                setAmount("");
                setDate(format(new Date(), 'yyyy-MM-dd'));
                const meInGroup = participants.find(p => p.name === currentUser?.name);
                setPaidBy(meInGroup?.id || participants[0]?.id || "");
                setSelectedParticipants(participants.map(p => p.id));
                setSplitType("EQUAL");
                setExactAmounts({});
                setPercentages({});
            }
        }
    }, [isOpen, existingExpense, participants, currentUser]);

    // Validation Helpers
    const totalAmount = parseFloat(amount) || 0;

    const currentExactTotal = Object.entries(exactAmounts)
        .filter(([id]) => selectedParticipants.includes(id))
        .reduce((sum, [_, val]) => sum + (parseFloat(val) || 0), 0);

    const remainingExact = totalAmount - currentExactTotal;

    const currentPercentageTotal = Object.entries(percentages)
        .filter(([id]) => selectedParticipants.includes(id))
        .reduce((sum, [_, val]) => sum + (parseFloat(val) || 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);

        if (!description || !amount || !paidBy || selectedParticipants.length === 0 || !date) return;

        let splits: SplitResult[] = [];

        if (splitType === "EQUAL") {
            splits = distributeEqualSplits(numAmount, selectedParticipants);
        } else if (splitType === "EXACT") {
            const exactSplits = selectedParticipants.map(id => ({
                participantId: id,
                amount: parseFloat(exactAmounts[id] || "0")
            }));

            if (!validateExactSplits(numAmount, exactSplits)) {
                alert(`Exact amounts must sum to ${currencySymbol}${numAmount}. Currently: ${currencySymbol}${currentExactTotal.toFixed(2)}`);
                return;
            }
            splits = exactSplits;
        } else if (splitType === "PERCENTAGE") {
            const percSplits = selectedParticipants.map(id => ({
                participantId: id,
                percentage: parseFloat(percentages[id] || "0")
            }));

            if (!validatePercentageSplits(percSplits)) {
                alert(`Percentages must sum to 100%. Currently: ${currentPercentageTotal.toFixed(1)}%`);
                return;
            }
            splits = calculatePercentageSplits(numAmount, percSplits);
        }

        const expenseData = {
            groupId,
            description,
            amount: numAmount,
            paidBy,
            date: new Date(date).getTime(),
            splitType,
            splits,
        } as Expense;

        if (existingExpense) {
            editExpense(existingExpense.id, expenseData);
        } else {
            addExpense(expenseData);
        }

        onClose();
    };

    const toggleParticipant = (id: string) => {
        if (selectedParticipants.includes(id)) {
            if (selectedParticipants.length > 1) {
                setSelectedParticipants(prev => prev.filter(p => p !== id));
            }
        } else {
            setSelectedParticipants(prev => [...prev, id]);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingExpense ? "Edit Expense" : "Add Expense"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description, Amount, Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. Dinner at Mario's"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                {currencySymbol}
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                style={{ colorScheme: "light dark" }} // Ensures icons visible in dark mode
                            />
                        </div>
                    </div>
                </div>

                {/* Payer */}
                <div>
                    <label className="block text-sm font-medium mb-2">Paid By</label>
                    <div className="flex flex-wrap gap-2">
                        {participants.map(p => (
                            <button
                                type="button"
                                key={p.id}
                                onClick={() => setPaidBy(p.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                                    paidBy === p.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-card border-border hover:border-primary/50"
                                )}
                            >
                                {paidBy === p.id && <Check className="w-3 h-3" />}
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Split Type Selector */}
                <div className="flex p-1 bg-muted/50 rounded-xl">
                    {(['EQUAL', 'EXACT', 'PERCENTAGE'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setSplitType(type)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
                                splitType === type
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {type === 'EQUAL' && <Divide className="w-4 h-4" />}
                            {type === 'EXACT' && <DollarSign className="w-4 h-4" />}
                            {type === 'PERCENTAGE' && <Percent className="w-4 h-4" />}
                            <span className="capitalize">{type.toLowerCase()}</span>
                        </button>
                    ))}
                </div>

                {/* Split With / Split Details */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Split Details</label>
                        {splitType === 'EQUAL' && (
                            <button
                                type="button"
                                onClick={() => setSelectedParticipants(participants.map(p => p.id))}
                                className="text-xs text-primary font-medium hover:underline"
                            >
                                Select All
                            </button>
                        )}
                        {splitType === 'EXACT' && (
                            <span className={cn("text-xs font-medium", Math.abs(remainingExact) < 0.01 ? "text-emerald-500" : "text-amber-500")}>
                                Remaining: {formatCurrency(remainingExact, currency)}
                            </span>
                        )}
                        {splitType === 'PERCENTAGE' && (
                            <span className={cn("text-xs font-medium", Math.abs(100 - currentPercentageTotal) < 0.01 ? "text-emerald-500" : "text-amber-500")}>
                                Total: {currentPercentageTotal.toFixed(1)}%
                            </span>
                        )}
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {participants.map(p => {
                            const isSelected = selectedParticipants.includes(p.id);

                            // For advanced modes, we always show all participants but values can be 0 (meaning implicitly 0 share)
                            // Or we only show selected. Let's stick to showing all for Exact/Percentage to be clearer, 
                            // or allow selecting who is involved.
                            // To keep it simple: Only show selected for Equal. For Exact/Perc, show all (or selected) and let user input.
                            // Better UX: Allow selecting participants for all modes.

                            return (
                                <div key={p.id} className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    isSelected ? "bg-card border-primary/20" : "opacity-60 border-transparent bg-muted/20"
                                )}>
                                    <button
                                        type="button"
                                        onClick={() => toggleParticipant(p.id)}
                                        className={cn(
                                            "w-5 h-5 rounded-full flex items-center justify-center border flex-shrink-0",
                                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                        )}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                    </button>

                                    <div className="flex-1 font-medium text-sm truncate">{p.name}</div>

                                    {isSelected && (
                                        <div className="w-[120px]">
                                            {splitType === 'EQUAL' && (
                                                <div className="text-right text-sm text-muted-foreground">
                                                    {/* Show approx amount */}
                                                    {formatCurrency(totalAmount / selectedParticipants.length, currency)}
                                                </div>
                                            )}
                                            {splitType === 'EXACT' && (
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{currencySymbol}</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-full bg-muted border border-border rounded-lg pl-6 pr-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="0.00"
                                                        value={exactAmounts[p.id] || ''}
                                                        onChange={(e) => setExactAmounts(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                    />
                                                </div>
                                            )}
                                            {splitType === 'PERCENTAGE' && (
                                                <div className="relative">
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-muted border border-border rounded-lg pl-2 pr-6 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                                        placeholder="0"
                                                        value={percentages[p.id] || ''}
                                                        onChange={(e) => setPercentages(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action */}
                <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                >
                    {existingExpense ? "Update Expense" : "Save Expense"}
                </button>
            </form>
        </Modal >
    );
}
