"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import {
    User,
    Mail,
    Calendar,
    Edit3,
    Save,
    X,
    Camera,
    Users,
    Receipt,
    TrendingUp,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { useCurrency } from "@/lib/useCurrency";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

export default function ProfilePage() {
    const { formatCurrency } = useCurrency();
    const currentUser = useStore((state) => state.currentUser);
    const groups = useStore((state) => state.groups);
    const expenses = useStore((state) => state.expenses);
    const participants = useStore((state) => state.participants);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(currentUser?.name || '');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate stats
    const totalGroups = groups.length;
    const totalExpenses = expenses.length;

    // Find how many expenses the user paid for
    const userParticipants = participants.filter(p => p.name === currentUser?.name);
    const userPaidExpenses = expenses.filter(e =>
        userParticipants.some(p => p.id === e.paidBy)
    );
    const totalPaidByUser = userPaidExpenses.reduce((sum, e) => sum + e.amount, 0);

    const handleSave = () => {
        // In a real app, we'd update the user name in the store
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target?.result as string);
                setIsImageModalOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const avatarColors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-red-500',
        'from-pink-500 to-rose-500',
    ];

    const [selectedAvatar, setSelectedAvatar] = useState(0);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-heading">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            {/* Profile Card - Redesigned */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                {/* Avatar & Info Section */}
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar with Upload */}
                        <div className="relative group">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-gray-800"
                                />
                            ) : (
                                <div className={cn(
                                    "w-28 h-28 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white dark:border-gray-800 bg-gradient-to-br",
                                    avatarColors[selectedAvatar]
                                )}>
                                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <button
                                onClick={() => setIsImageModalOpen(true)}
                                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setIsImageModalOpen(true)}>
                                <Camera className="w-5 h-5 text-primary-foreground" />
                            </div>
                        </div>

                        {/* Name & Email - Clear separation */}
                        <div className="flex-1 text-center sm:text-left">
                            {isEditing ? (
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="text-2xl font-bold font-heading bg-muted border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 w-full max-w-xs"
                                        autoFocus
                                    />
                                    <button onClick={handleSave} className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                        <Save className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-2 bg-muted rounded-xl text-muted-foreground hover:bg-muted/80 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                                    <h2 className="text-3xl font-bold font-heading text-foreground">{currentUser?.name}</h2>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 bg-muted/50 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground mt-2">
                                <Mail className="w-4 h-4" />
                                <span>{currentUser?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start text-muted-foreground mt-1">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Avatar Color Selection - Inside card */}
                <div className="p-6 bg-muted/30">
                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Avatar Color</h3>
                    <div className="flex gap-3">
                        {avatarColors.map((color, index) => (
                            <button
                                key={index}
                                onClick={() => { setSelectedAvatar(index); setProfileImage(null); }}
                                className={cn(
                                    "w-10 h-10 rounded-xl bg-gradient-to-br transition-all",
                                    color,
                                    selectedAvatar === index && !profileImage
                                        ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                                        : "opacity-70 hover:opacity-100 hover:scale-105"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-violet-600" />
                    </div>
                    <p className="text-2xl font-bold font-heading">{totalGroups}</p>
                    <p className="text-sm text-muted-foreground">Groups</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold font-heading">{totalExpenses}</p>
                    <p className="text-sm text-muted-foreground">Expenses</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold font-heading">{formatCurrency(totalPaidByUser)}</p>
                    <p className="text-sm text-muted-foreground">Paid by You</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold font-heading">
                        {new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    </p>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold font-heading mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                    <button className="p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-left group">
                        <p className="font-medium group-hover:text-primary transition-colors">Export Data</p>
                        <p className="text-sm text-muted-foreground">Download your expense history</p>
                    </button>
                    <button className="p-4 rounded-xl border border-border hover:bg-muted/50 hover:border-primary/30 transition-all text-left group">
                        <p className="font-medium group-hover:text-primary transition-colors">Invite Friends</p>
                        <p className="text-sm text-muted-foreground">Share SplitMint with others</p>
                    </button>
                </div>
            </div>

            {/* Image Upload Modal */}
            <Modal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="Update Profile Picture">
                <div className="space-y-6">
                    <div
                        className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-1">Click to upload</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG or GIF (max 5MB)</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">Or choose an avatar color</p>
                        <div className="flex gap-3 justify-center">
                            {avatarColors.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedAvatar(index);
                                        setProfileImage(null);
                                        setIsImageModalOpen(false);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-xl bg-gradient-to-br transition-all hover:scale-110",
                                        color
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

