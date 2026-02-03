"use client";

import { useStore } from "@/lib/store";
import { formatCurrency as formatCurrencyBase } from "@/lib/balance-engine";

/**
 * Hook to get currency formatting function with the user's default currency
 * This ensures all currency displays use the same currency setting
 */
export function useCurrency() {
    const defaultCurrency = useStore((state) => state.defaultCurrency);

    const formatCurrency = (amount: number) => {
        return formatCurrencyBase(amount, defaultCurrency);
    };

    return {
        currency: defaultCurrency,
        formatCurrency,
    };
}
