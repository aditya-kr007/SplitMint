"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore, PARTICIPANT_COLORS, type Participant, type Expense } from "@/lib/store";
import { useCurrency } from "@/lib/useCurrency";
import {
    ArrowLeft,
    Plus,
    Users,
    Receipt,
    PieChart,
    Trash2,
    Pencil,
    Check,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { BalanceView } from "@/components/features/BalanceView";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { formatCurrency } = useCurrency();

    const groups = useStore((state) => state.groups);
    // Select full arrays from store to avoid infinite loop from filter creating new references
    const allExpenses = useStore((state) => state.expenses);
    const allParticipants = useStore((state) => state.participants);
    const currentUser = useStore((state) => state.currentUser);
    const addParticipant = useStore((state) => state.addParticipant);
    const deleteGroup = useStore((state) => state.deleteGroup);
    const updateGroup = useStore((state) => state.updateGroup);
    const updateParticipant = useStore((state) => state.updateParticipant);

    // Memoize filtered results to prevent unnecessary re-renders
    const expenses = useMemo(() => allExpenses.filter(e => e.groupId === id), [allExpenses, id]);
    const participants = useMemo(() => allParticipants.filter(p => p.groupId === id), [allParticipants, id]);

    const group = groups.find(g => g.id === id);

    const [activeTab, setActiveTab] = useState<'EXPENSES' | 'BALANCES' | 'MEMBERS'>('EXPENSES');
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [newMemberName, setNewMemberName] = useState("");
    const [memberToRemove, setMemberToRemove] = useState<Participant | null>(null);
    const removeParticipant = useStore((state) => state.removeParticipant);

    // Edit states
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editedMemberName, setEditedMemberName] = useState("");

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setIsAddExpenseOpen(true);
    };

    const handleRemoveMember = () => {
        if (memberToRemove) {
            removeParticipant(memberToRemove.id);
            setMemberToRemove(null);
        }
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        // Check max participants limit (4 total)
        if (participants.length >= 4) {
            alert("Maximum 4 participants allowed per group (including you)");
            return;
        }

        addParticipant(newMemberName, id);
        setNewMemberName("");
        setIsAddMemberOpen(false);
    };

    const handleDeleteGroup = () => {
        deleteGroup(id);
        router.push("/dashboard");
    };

    const handleSaveGroupName = () => {
        if (editedName.trim() && group) {
            updateGroup(id, { name: editedName.trim() });
        }
        setIsEditingName(false);
    };

    const handleSaveMemberName = (memberId: string) => {
        if (editedMemberName.trim()) {
            updateParticipant(memberId, { name: editedMemberName.trim() });
        }
        setEditingMemberId(null);
    };

    const handleChangeMemberColor = (memberId: string, color: string) => {
        updateParticipant(memberId, { color });
    };

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Group not found</h2>
                <Link href="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveGroupName();
                                        if (e.key === 'Escape') setIsEditingName(false);
                                    }}
                                    className="text-2xl font-bold font-heading bg-muted/50 border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    onClick={handleSaveGroupName}
                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsEditingName(false)}
                                    className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group/title">
                                <h1 className="text-3xl font-bold font-heading">{group.name}</h1>
                                <button
                                    onClick={() => {
                                        setEditedName(group.name);
                                        setIsEditingName(true);
                                    }}
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all opacity-0 group-hover/title:opacity-100"
                                    title="Edit group name"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Users className="w-3 h-3" />
                            {participants.length} member{participants.length !== 1 ? 's' : ''}
                            <span className="text-xs opacity-70">(max 4)</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="px-4 py-2 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-all border border-border"
                    >
                        Add Member
                    </button>
                    <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                    <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-all"
                        title="Delete Group"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted-foreground text-sm font-medium mb-1">Total Group Spend</p>
                    <h2 className="text-3xl font-bold font-heading">{formatCurrency(totalSpent)}</h2>
                </div>

                {/* Placeholder for user specific stat */}
                <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl">
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1">Your Share (Est.)</p>
                    <h2 className="text-3xl font-bold font-heading text-indigo-700 dark:text-indigo-300">
                        {formatCurrency(totalSpent / (participants.length || 1))}
                    </h2>
                </div>
            </div>

            {/* Tabs */}
            <div>
                <div className="flex items-center gap-6 border-b border-border mb-6">
                    <button
                        onClick={() => setActiveTab('EXPENSES')}
                        className={cn(
                            "pb-3 font-medium text-sm flex items-center gap-2 transition-all relative",
                            activeTab === 'EXPENSES' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Receipt className="w-4 h-4" />
                        Expenses
                        {activeTab === 'EXPENSES' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('BALANCES')}
                        className={cn(
                            "pb-3 font-medium text-sm flex items-center gap-2 transition-all relative",
                            activeTab === 'BALANCES' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <PieChart className="w-4 h-4" />
                        Balances
                        {activeTab === 'BALANCES' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('MEMBERS')}
                        className={cn(
                            "pb-3 font-medium text-sm flex items-center gap-2 transition-all relative",
                            activeTab === 'MEMBERS' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Members
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{participants.length}</span>
                        {activeTab === 'MEMBERS' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        )}
                    </button>
                </div>

                <div className="min-h-[300px]">
                    {activeTab === 'EXPENSES' ? (
                        <ExpenseList expenses={expenses} participants={participants} onEdit={handleEditExpense} />
                    ) : activeTab === 'BALANCES' ? (
                        <BalanceView expenses={expenses} participants={participants} />
                    ) : (
                        /* Members List */
                        <div className="space-y-3">
                            {participants.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 opacity-50" />
                                    </div>
                                    <p>No members yet. Add someone to get started!</p>
                                </div>
                            ) : (
                                participants.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar with color picker on click */}
                                            <div className="relative group/avatar">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer transition-transform hover:scale-105",
                                                        member.color || 'from-violet-400 to-purple-500'
                                                    )}
                                                    title="Click to change color"
                                                >
                                                    {member.name[0].toUpperCase()}
                                                </div>
                                                {/* Color picker dropdown */}
                                                <div className="absolute left-0 top-full mt-2 p-2 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all z-10 flex flex-wrap gap-1 w-[140px]">
                                                    {PARTICIPANT_COLORS.map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => handleChangeMemberColor(member.id, color)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full bg-gradient-to-br transition-transform hover:scale-110",
                                                                color,
                                                                member.color === color && "ring-2 ring-primary ring-offset-2"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Name with edit functionality */}
                                            <div>
                                                {editingMemberId === member.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            autoFocus
                                                            value={editedMemberName}
                                                            onChange={(e) => setEditedMemberName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveMemberName(member.id);
                                                                if (e.key === 'Escape') setEditingMemberId(null);
                                                            }}
                                                            className="font-bold bg-muted/50 border border-border rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-32"
                                                        />
                                                        <button
                                                            onClick={() => handleSaveMemberName(member.id)}
                                                            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMemberId(null)}
                                                            className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 group/name">
                                                        <h4 className="font-bold">{member.name}</h4>
                                                        <button
                                                            onClick={() => {
                                                                setEditedMemberName(member.name);
                                                                setEditingMemberId(member.id);
                                                            }}
                                                            className="p-1 text-muted-foreground hover:text-primary rounded opacity-0 group-hover/name:opacity-100 transition-all"
                                                            title="Edit name"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {member.name === currentUser?.name ? "You" : "Member"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setMemberToRemove(member)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remove Member"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}

                            {/* Add Member Button - disabled if max reached */}
                            {participants.length >= 4 ? (
                                <div className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground flex items-center justify-center gap-2 bg-muted/30">
                                    <Users className="w-4 h-4" />
                                    Maximum 4 members reached
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddMemberOpen(true)}
                                    className="w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New Member ({participants.length}/4)
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => {
                    setIsAddExpenseOpen(false);
                    setEditingExpense(undefined);
                }}
                groupId={id}
                existingExpense={editingExpense}
            />

            <Modal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                title="Add New Member"
            >
                <form onSubmit={handleAddMember} className="space-y-4">
                    <p className="text-sm text-muted-foreground">Add someone to split expenses with.</p>
                    <div>
                        <input
                            type="text"
                            required
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Name (e.g. John)"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAddMemberOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg"
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Group Confirmation Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete Group"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <p className="text-sm text-destructive font-medium">
                            ⚠️ This action cannot be undone!
                        </p>
                    </div>
                    <p className="text-muted-foreground">
                        Are you sure you want to delete <span className="font-bold text-foreground">{group?.name}</span>?
                        This will permanently remove all {expenses.length} expenses and {participants.length} members.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setIsDeleteOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteGroup}
                            className="px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Group
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Remove Participant Confirmation Modal */}
            <Modal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                title="Remove Member"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to remove <span className="font-bold text-foreground">{memberToRemove?.name}</span>?
                    </p>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl text-sm text-amber-600 dark:text-amber-400">
                        <p>This will remove them from all expenses. Expenses they paid for will be deleted.</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setMemberToRemove(null)}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemoveMember}
                            className="px-4 py-2 text-sm font-bold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                        >
                            Remove Member
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
