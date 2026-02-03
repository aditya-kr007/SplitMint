import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- Types ---

export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string; // Optional URL or color code
};

// Predefined color palette for participants
export const PARTICIPANT_COLORS = [
    'from-violet-400 to-purple-500',
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-pink-500',
    'from-rose-400 to-red-500',
    'from-cyan-400 to-blue-500',
    'from-amber-400 to-orange-500',
    'from-fuchsia-400 to-purple-500',
];

export type Participant = {
    id: string;
    name: string;
    avatar?: string;
    color?: string; // Gradient color class
    groupId: string;
    // If linked to a registered user
    userId?: string;
};

export type Group = {
    id: string;
    name: string;
    createdBy: string; // User ID
    createdAt: number;
    currency: string;
};

export type ExpenseSplitType = 'EQUAL' | 'PERCENTAGE' | 'EXACT';

export type Split = {
    participantId: string;
    amount: number; // For EXACT
    percentage?: number; // For PERCENTAGE
};

export type Expense = {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: string; // Participant ID
    date: number;
    splitType: ExpenseSplitType;
    splits: Split[];
    createdAt: number;
};

interface AppState {
    // Auth
    currentUser: User | null;
    users: User[]; // Mock Users DB
    registerUser: (name: string, email: string) => User;
    loginUser: (email: string) => User | undefined;
    logout: () => void;

    // Settings
    defaultCurrency: string;
    setDefaultCurrency: (currency: string) => void;

    // Groups
    groups: Group[];
    createGroup: (name: string, createdBy: string) => Group;
    deleteGroup: (groupId: string) => void;
    updateGroup: (groupId: string, data: Partial<Group>) => void;

    // Participants
    participants: Participant[];
    addParticipant: (name: string, groupId: string) => Participant;
    removeParticipant: (participantId: string) => void;
    updateParticipant: (participantId: string, data: Partial<Participant>) => void;

    // Expenses
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
    deleteExpense: (expenseId: string) => void;
    editExpense: (expenseId: string, data: Partial<Expense>) => void;
}

// --- Store ---

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            users: [],

            registerUser: (name, email) => {
                const newUser = { id: crypto.randomUUID(), name, email };
                set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
                return newUser;
            },

            loginUser: (email) => {
                const user = get().users.find(u => u.email === email);
                if (user) {
                    set({ currentUser: user });
                }
                return user;
            },

            logout: () => set({ currentUser: null }),

            // Settings
            defaultCurrency: 'USD',
            setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

            groups: [],
            createGroup: (name, createdBy) => {
                const newGroup = {
                    id: crypto.randomUUID(),
                    name,
                    createdBy,
                    createdAt: Date.now(),
                    currency: 'USD'
                };
                set((state) => ({ groups: [...state.groups, newGroup] }));
                return newGroup;
            },

            deleteGroup: (groupId) => set((state) => ({
                groups: state.groups.filter(g => g.id !== groupId),
                // Cascade delete participants and expenses
                participants: state.participants.filter(p => p.groupId !== groupId),
                expenses: state.expenses.filter(e => e.groupId !== groupId),
            })),

            updateGroup: (groupId, data) => set((state) => ({
                groups: state.groups.map(g => g.id === groupId ? { ...g, ...data } : g)
            })),

            participants: [],
            addParticipant: (name, groupId) => {
                const state = get();
                const existingParticipants = state.participants.filter(p => p.groupId === groupId);

                // Max 4 participants per group (primary user + 3 others)
                if (existingParticipants.length >= 4) {
                    return null as unknown as Participant; // Return null if limit reached
                }

                // Assign a color based on participant index
                const colorIndex = existingParticipants.length % PARTICIPANT_COLORS.length;
                const color = PARTICIPANT_COLORS[colorIndex];

                const newPart: Participant = {
                    id: crypto.randomUUID(),
                    name,
                    groupId,
                    color
                };
                set((state) => ({ participants: [...state.participants, newPart] }));
                return newPart;
            },

            removeParticipant: (id) => set((state) => {
                // Find expenses where this participant is involved
                const updatedExpenses = state.expenses
                    .filter(expense => {
                        // Remove expenses where this participant was the only payer
                        if (expense.paidBy === id) {
                            return false; // Remove this expense entirely
                        }
                        return true;
                    })
                    .map(expense => {
                        // Remove this participant from splits
                        const updatedSplits = expense.splits.filter(s => s.participantId !== id);

                        // If no splits remain, this expense should be removed
                        if (updatedSplits.length === 0) {
                            return null;
                        }

                        // Recalculate split amounts for equal splits
                        if (expense.splitType === 'EQUAL' && updatedSplits.length > 0) {
                            const amountPerPerson = expense.amount / updatedSplits.length;
                            return {
                                ...expense,
                                splits: updatedSplits.map(s => ({
                                    ...s,
                                    amount: amountPerPerson
                                }))
                            };
                        }

                        return {
                            ...expense,
                            splits: updatedSplits
                        };
                    })
                    .filter(Boolean) as typeof state.expenses;

                return {
                    participants: state.participants.filter(p => p.id !== id),
                    expenses: updatedExpenses
                };
            }),

            updateParticipant: (id, data) => set((state) => ({
                participants: state.participants.map(p => p.id === id ? { ...p, ...data } : p)
            })),

            expenses: [],
            addExpense: (expense) => set((state) => ({
                expenses: [...state.expenses, { ...expense, id: crypto.randomUUID(), createdAt: Date.now() }]
            })),

            deleteExpense: (id) => set((state) => ({
                expenses: state.expenses.filter(e => e.id !== id)
            })),

            editExpense: (id, data) => set((state) => ({
                expenses: state.expenses.map(e => e.id === id ? { ...e, ...data } : e)
            })),
        }),
        {
            name: 'splitmint-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
        }
    )
);
