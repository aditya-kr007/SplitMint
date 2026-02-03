import { Expense, Participant, Split } from "./store";

// Represents a debt relationship: "from" owes "to" "amount"
export type Debt = {
    from: string;
    to: string;
    amount: number;
};

// Returns a Map of participantId -> Net Balance (positive means they are owed, negative means they owe)
export function calculateNetBalances(expenses: Expense[], participants: Participant[]): Record<string, number> {
    const balances: Record<string, number> = {};

    // Initialize all to 0
    participants.forEach(p => {
        balances[p.id] = 0;
    });

    expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        const amount = expense.amount;

        // Payer gets positive balance (they are owed this amount back effectively, until subtracted by their share)
        // Actually simpler: 
        // Payer PAID amount. 
        // Splits determine COST per person.
        // Net = PAID - COST.

        // Add paid amount
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        // Subtract split amounts
        expense.splits.forEach(split => {
            balances[split.participantId] = (balances[split.participantId] || 0) - split.amount;
        });
    });

    return balances;
}

// Simplify debts to minimize transactions
export function suggestSettlements(netBalances: Record<string, number>): Debt[] {
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(netBalances).forEach(([id, amount]) => {
        // Round to 2 decimals to avoid floating point issues
        const val = Math.round(amount * 100) / 100;
        if (val < -0.01) debtors.push({ id, amount: -val }); // Store positive amount they owe
        if (val > 0.01) creditors.push({ id, amount: val });
    });

    // Sort by amount (descending) to optimize greedy matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: Debt[] = [];
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        // Add settlement
        if (amount > 0) {
            debts.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round(amount * 100) / 100
            });
        }

        // Update remaining amounts
        debtor.amount -= amount;
        creditor.amount -= amount;

        // If settled, move to next
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
}

export function formatCurrency(amount: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
