"use client";

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export function StoreHydration() {
    useEffect(() => {
        // Trigger hydration on client-side mount
        useStore.persist.rehydrate();
    }, []);

    return null;
}
