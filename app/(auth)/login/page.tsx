"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const loginUser = useStore((state) => state.loginUser);

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate network delay for premium feel
        setTimeout(() => {
            const user = loginUser(email);

            if (user) {
                router.push("/dashboard");
            } else {
                setError("User not found. Please register first.");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-heading mb-2">Welcome Back</h1>
                <p className="text-white/60">Enter your email to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 pl-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full bg-white text-purple-600 font-bold font-heading py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]",
                        isLoading && "opacity-80 cursor-wait"
                    )}
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <>
                            Login to SplitMint <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-white/60">
                Don't have an account?{" "}
                <Link href="/register" className="text-white font-medium hover:underline">
                    Create one
                </Link>
            </div>
        </div>
    );
}
