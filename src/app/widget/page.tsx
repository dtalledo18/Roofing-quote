"use client";
// app/widget/page.tsx
// Vista standalone del QuoteForm para embed via iframe.
// Sin chrome, sin navegación — solo el formulario.

import { QuoteForm } from "@/components/widget/QuoteForm";

export default function WidgetPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-transparent">
            <div className="w-full max-w-2xl">
                <QuoteForm
                    initialArea={1500}
                    initialPitch="shallow"
                    address=""
                />
            </div>
        </main>
    );
}