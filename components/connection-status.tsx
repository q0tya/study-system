"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export function ConnectionStatus() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Placeholder for future status indicator */}
        </div>
    );
}
