"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("splitmint-theme") as Theme | null;

        if (savedTheme) {
            setThemeState(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setThemeState("dark");
        }
    }, []);

    // Apply theme class to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("splitmint-theme", theme);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => prev === "dark" ? "light" : "dark");
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
