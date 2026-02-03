
// Helper functions for expense splitting logic

export interface SplitResult {
    participantId: string;
    amount: number;
    percentage?: number;
}

/**
 * Distributes a total amount equally among participants, handling rounding differences.
 * Remainder cents are distributed 1-by-1 to the first participants in the list.
 */
export function distributeEqualSplits(totalAmount: number, participantIds: string[]): SplitResult[] {
    if (participantIds.length === 0) return [];

    const count = participantIds.length;
    // Calculate base share per person (rounded down to 2 decimals)
    const baseAmount = Math.floor((totalAmount / count) * 100) / 100;

    // Calculate total distributed so far
    const totalDistributed = baseAmount * count;

    // Calculate remaining cents
    let remainder = Math.round((totalAmount - totalDistributed) * 100);

    return participantIds.map((id, index) => {
        let amount = baseAmount;
        if (remainder > 0) {
            amount = Math.round((amount + 0.01) * 100) / 100;
            remainder--;
        }
        return { participantId: id, amount };
    });
}

/**
 * Validates that exact split amounts sum up to the total amount.
 */
export function validateExactSplits(totalAmount: number, splits: { participantId: string; amount: number }[]): boolean {
    const sum = splits.reduce((acc, curr) => acc + curr.amount, 0);
    // Allow for tiny floating point differences
    return Math.abs(totalAmount - sum) < 0.01;
}

/**
 * Validates that percentage splits sum up to 100%.
 */
export function validatePercentageSplits(splits: { participantId: string; percentage: number }[]): boolean {
    const sum = splits.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.abs(100 - sum) < 0.01;
}

/**
 * Calculates amounts from percentages.
 * Note: This might result in a sum that is slightly off due to rounding, 
 * so specific adjustment logic might be needed if exact total matching is required.
 * For this implementation, we will use a simple percentage calculation and adjust the last person.
 */
export function calculatePercentageSplits(totalAmount: number, splits: { participantId: string; percentage: number }[]): SplitResult[] {
    let remainingAmount = totalAmount;

    const results = splits.map((split, index) => {
        // If it's the last one, give them the remainder to ensure exact total match
        if (index === splits.length - 1) {
            return {
                participantId: split.participantId,
                amount: Math.round(remainingAmount * 100) / 100,
                percentage: split.percentage
            };
        }

        const amount = Math.round((totalAmount * (split.percentage / 100)) * 100) / 100;
        remainingAmount -= amount;

        return {
            participantId: split.participantId,
            amount,
            percentage: split.percentage
        };
    });

    return results;
}
