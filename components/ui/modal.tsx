"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClick={handleBackdropClick}
            onClose={onClose}
            className={cn(
                // Base styles - centered on screen
                "fixed inset-0 m-auto",
                "bg-transparent p-0 rounded-2xl shadow-2xl",
                "max-h-[90vh] overflow-visible",
                // Backdrop styles
                "backdrop:bg-black/60 backdrop:backdrop-blur-md",
                // Animation - fade and scale from center
                "opacity-0 scale-95 translate-y-4",
                "open:opacity-100 open:scale-100 open:translate-y-0",
                "transition-all duration-300 ease-out",
                "backdrop:opacity-0 backdrop:transition-opacity backdrop:duration-300",
                "open:backdrop:opacity-100",
                className
            )}
            style={{
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" // Spring-like easing
            }}
        >
            <div className={cn(
                "bg-card text-card-foreground w-full max-w-md p-6 rounded-2xl border border-border relative",
                "shadow-2xl shadow-black/20"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold font-heading">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-all duration-200 text-muted-foreground hover:text-foreground hover:rotate-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}
