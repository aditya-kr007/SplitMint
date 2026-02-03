"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Settings,
    Users,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MintSenseWidget } from "@/components/ai/MintSenseChat";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const logout = useStore((state) => state.logout);
    const currentUser = useStore((state) => state.currentUser);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Protected route check
    if (!currentUser) {
        // In a real app we'd redirect here, but we'll handle it in useEffect usually.
        // Since this is client component, we can return null or a loading state.
        // Ideally we redirect if checking auth in useEffect.
        // For now, let's assume the page.tsx handles redirect or we just show nothing.
    }

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Groups", href: "/dashboard/my-groups", icon: Users },
        { name: "Activity", href: "/dashboard/activity", icon: CreditCard },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm fixed inset-y-0 z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 font-heading font-bold text-2xl text-primary">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            S
                        </div>
                        SplitMint
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl hover:bg-muted transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {currentUser?.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{currentUser?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 font-heading font-bold text-xl text-primary">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
                        S
                    </div>
                    SplitMint
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-background pt-20 px-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium hover:bg-muted"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-4 text-lg text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 pt-24 md:pt-10 transition-all">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            <MintSenseWidget />
        </div>
    );
}
