"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { BrainCircuit, Send, X, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function MintSenseWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Hi! I'm MintSense. Tell me something like 'Lunch was $50 paid by me' and I'll help you track it." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const groups = useStore((state) => state.groups);
    const currentUser = useStore((state) => state.currentUser);
    const addExpense = useStore((state) => state.addExpense);
    const participants = useStore((state) => state.participants);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI Processing
        setTimeout(() => {
            const response = processCommand(userText);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
            setIsTyping(false);
        }, 1500);
    };

    const processCommand = (text: string): string => {
        const lower = text.toLowerCase();

        // Very basic 'regex' AI for demo purposes
        // Pattern: "X was $Y paid by Z"

        const amountMatch = text.match(/\$(\d+(\.\d{1,2})?)/) || text.match(/(\d+(\.\d{1,2})?)/);

        if (!amountMatch) {
            return "I couldn't find an amount in that message. Try mentioning a price like '$20'.";
        }

        const amount = parseFloat(amountMatch[1]);

        // Attempt to guess context
        let description = "Expense";
        if (lower.includes("lunch")) description = "Lunch";
        else if (lower.includes("dinner")) description = "Dinner";
        else if (lower.includes("uber") || lower.includes("taxi")) description = "Transport";
        else if (lower.includes("groceries")) description = "Groceries";
        else {
            // Simple fallback extraction: words before "was" or first few words
            const wasIndex = lower.indexOf(" was ");
            if (wasIndex > 0) description = text.substring(0, wasIndex);
            else description = text.split(" ").slice(0, 3).join(" ");
        }

        // Attempt to find group
        // For simplicity, just use the first group the user is in
        const activeGroup = groups[0];

        if (!activeGroup) {
            return "You don't have any groups yet! Create one first so I can add expenses to it.";
        }

        // Simulate adding expense
        // In a real agent, we would confirm "Add $X for Y to Group Z?"
        // Here we'll just say we would do it.

        // Actually, let's try to add it really if we can match self
        const groupParticipants = participants.filter(p => p.groupId === activeGroup.id);
        const self = groupParticipants.find(p => p.name === currentUser?.name);

        if (self) {
            addExpense({
                groupId: activeGroup.id,
                description: description,
                amount: amount,
                paidBy: self.id,
                date: Date.now(),
                splitType: "EQUAL",
                splits: groupParticipants.map(p => ({ participantId: p.id, amount: amount / groupParticipants.length }))
            });
            return `Done! I've added "${description}" for $${amount} to group "${activeGroup.name}". Paid by you, split equally.`;
        }

        return `I understood: ${description} for $${amount}. But I'm not sure which group to add it to. (Mock AI Limitation)`;
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110 active:scale-95",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse-slow"
                )}
            >
                {isOpen ? <X className="text-white w-6 h-6" /> : <BrainCircuit className="text-white w-6 h-6" />}
            </button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[60vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all origin-bottom-right duration-300",
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none translate-y-10"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-border bg-muted/30 rounded-t-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold font-heading">MintSense AI</h3>
                        <p className="text-xs text-muted-foreground">Gateway Assistant</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted text-foreground rounded-bl-none"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-muted p-3 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </>
    );
}
