"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ArrowRight, Receipt, Users, BrainCircuit } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);

  useEffect(() => {
    // If we mount and user is logged in, push to dashboard
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  if (currentUser) return null; // Or a loading spinner while redirecting

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-heading font-bold text-2xl text-primary">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            S
          </div>
          SplitMint
        </div>
        <Link
          href="/login"
          className="px-6 py-2 rounded-full border border-border hover:bg-muted transition-colors font-medium text-sm"
        >
          Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col pt-12 md:pt-24 px-6 items-center text-center max-w-5xl mx-auto w-full">
        <div className="-rotate-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-lg">
          Gateway to Karbon
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Split expenses, <br /> not friendships.
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The most elegant way to track shared expenses, balances, and settlements.
          Powered by MintSense AI for effortless organization.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-card border border-border text-foreground rounded-full font-bold text-lg hover:border-primary/50 transition-all shadow-lg flex items-center justify-center"
          >
            Live Demo
          </Link>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Group Splitting</h3>
            <p className="text-muted-foreground">Manage expenses for trips, housemates, and events with ease.</p>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Smart Balances</h3>
            <p className="text-muted-foreground">Our engine minimizes transactions so you settle debts efficiently.</p>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">MintSense AI</h3>
            <p className="text-muted-foreground">Add expenses with natural language. "Lunch was $40 paid by me."</p>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-sm mt-12 border-t border-border">
        © {new Date().getFullYear()} SplitMint. All rights reserved.
      </footer>
    </div>
  );
}
