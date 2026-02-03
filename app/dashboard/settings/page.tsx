"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import {
    User,
    Bell,
    Moon,
    Sun,
    Palette,
    Shield,
    CreditCard,
    HelpCircle,
    ChevronRight,
    Check,
    Globe,
    Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSection = 'appearance' | 'notifications' | 'privacy' | 'billing' | 'help';

export default function SettingsPage() {
    const currentUser = useStore((state) => state.currentUser);
    const defaultCurrency = useStore((state) => state.defaultCurrency);
    const setDefaultCurrency = useStore((state) => state.setDefaultCurrency);
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
    const [notifications, setNotifications] = useState({
        expenses: true,
        settlements: true,
        reminders: false,
        marketing: false
    });

    const isDarkMode = theme === "dark";

    const settingsSections = [
        { id: 'appearance' as const, name: 'Appearance', icon: Palette, description: 'Customize your experience' },
        { id: 'notifications' as const, name: 'Notifications', icon: Bell, description: 'Manage alerts and emails' },
        { id: 'privacy' as const, name: 'Privacy & Security', icon: Shield, description: 'Protect your account' },
        { id: 'billing' as const, name: 'Billing', icon: CreditCard, description: 'Manage subscription' },
        { id: 'help' as const, name: 'Help & Support', icon: HelpCircle, description: 'Get assistance' },
    ];

    const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF', 'SGD'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-heading">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences and account</p>
            </div>

            <div className="grid md:grid-cols-[280px,1fr] gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left",
                                activeSection === section.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <section.icon className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="font-medium">{section.name}</p>
                                <p className={cn(
                                    "text-xs",
                                    activeSection === section.id ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                    {section.description}
                                </p>
                            </div>
                            <ChevronRight className={cn(
                                "w-4 h-4 transition-transform",
                                activeSection === section.id && "rotate-90"
                            )} />
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-card border border-border rounded-2xl p-6 min-h-[500px]">
                    {activeSection === 'appearance' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-1">Appearance</h2>
                                <p className="text-muted-foreground text-sm">Customize how SplitMint looks on your device</p>
                            </div>

                            {/* Theme Toggle */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Theme</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                                            !isDarkMode ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Sun className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Light</p>
                                            <p className="text-xs text-muted-foreground">Bright and clean</p>
                                        </div>
                                        {!isDarkMode && <Check className="w-5 h-5 text-primary ml-auto" />}
                                    </button>

                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                                            isDarkMode ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                            <Moon className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium">Dark</p>
                                            <p className="text-xs text-muted-foreground">Easy on the eyes</p>
                                        </div>
                                        {isDarkMode && <Check className="w-5 h-5 text-primary ml-auto" />}
                                    </button>
                                </div>
                            </div>

                            {/* Currency */}
                            <div className="space-y-4">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Default Currency
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {currencies.map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setDefaultCurrency(curr)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                                defaultCurrency === curr
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                            )}
                                        >
                                            {curr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-1">Notifications</h2>
                                <p className="text-muted-foreground text-sm">Choose what you want to be notified about</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'expenses', label: 'New Expenses', desc: 'When someone adds an expense to your groups' },
                                    { key: 'settlements', label: 'Settlement Requests', desc: 'When someone requests a settlement' },
                                    { key: 'reminders', label: 'Payment Reminders', desc: 'Reminders to settle your balances' },
                                    { key: 'marketing', label: 'Product Updates', desc: 'News and feature announcements' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(prev => ({
                                                ...prev,
                                                [item.key]: !prev[item.key as keyof typeof notifications]
                                            }))}
                                            className={cn(
                                                "w-12 h-7 rounded-full transition-all relative",
                                                notifications[item.key as keyof typeof notifications]
                                                    ? "bg-primary"
                                                    : "bg-muted-foreground/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all",
                                                notifications[item.key as keyof typeof notifications] ? "left-6" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-1">Privacy & Security</h2>
                                <p className="text-muted-foreground text-sm">Manage your account security</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Your account is secure</p>
                                            <p className="text-sm text-muted-foreground">All data is encrypted end-to-end</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">Coming Soon</span>
                                </button>

                                <button className="w-full p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left">
                                    <p className="font-medium">Download Your Data</p>
                                    <p className="text-sm text-muted-foreground">Get a copy of your expense data</p>
                                </button>

                                <button className="w-full p-4 rounded-xl border border-destructive/50 hover:bg-destructive/10 transition-colors text-left text-destructive">
                                    <p className="font-medium">Delete Account</p>
                                    <p className="text-sm opacity-70">Permanently delete your account and data</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'billing' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-1">Billing</h2>
                                <p className="text-muted-foreground text-sm">Manage your subscription and payments</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                <p className="text-violet-100 text-sm font-medium mb-1">Current Plan</p>
                                <h3 className="text-3xl font-bold font-heading mb-2">Free</h3>
                                <p className="text-violet-100 text-sm">Unlimited groups • Basic features</p>
                            </div>

                            <div className="p-6 rounded-xl border border-primary/50 bg-primary/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg">SplitMint Pro</h4>
                                        <p className="text-muted-foreground text-sm">Unlock all premium features</p>
                                    </div>
                                    <p className="font-bold text-xl">$4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                </div>
                                <ul className="space-y-2 text-sm mb-4">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced analytics</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Receipt scanning</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority support</li>
                                </ul>
                                <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'help' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold font-heading mb-1">Help & Support</h2>
                                <p className="text-muted-foreground text-sm">Get help with SplitMint</p>
                            </div>

                            <div className="grid gap-4">
                                <a href="#" className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Documentation</p>
                                        <p className="text-sm text-muted-foreground">Learn how to use SplitMint</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </a>

                                <a href="#" className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">FAQs</p>
                                        <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </a>

                                <a href="#" className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Contact Support</p>
                                        <p className="text-sm text-muted-foreground">We're here to help</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </a>
                            </div>

                            <div className="text-center pt-4 border-t border-border">
                                <p className="text-muted-foreground text-sm">SplitMint v1.0.0</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
