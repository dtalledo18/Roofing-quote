"use client";
// components/widget/LeadForm.tsx
// Reemplaza al QuoteForm tras click en "Get My Quote"
// Recopila datos de contacto y dispara el envío del lead + PDF opcional

import { useState } from "react";

interface QuoteSummary {
    address: string;
    sqft: number;
    material: string;
    pitch: string;
    layers: number;
    materialCost: number;
    laborCost: number;
    removalCost: number;
    total: number;
}

interface LeadFormProps {
    quote: QuoteSummary;
    onSuccess: () => void;
    onBack: () => void;
}

export const LeadForm = ({ quote, onSuccess, onBack }: LeadFormProps) => {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: quote.address,
        sendPdf: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === "phone") {
            // Auto-formato (XXX) XXX-XXXX mientras el usuario escribe
            const digits = value.replace(/\D/g, "").slice(0, 10);
            let formatted = digits;
            if (digits.length > 6) {
                formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
            } else if (digits.length > 3) {
                formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
            } else if (digits.length > 0) {
                formatted = `(${digits}`;
            }
            setForm(prev => ({ ...prev, phone: formatted }));
            return;
        }
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        // Validación básica
        if (!form.firstName || !form.email || !form.phone) {
            setError("Please fill in all required fields.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setError("Please enter a valid email address.");
            return;
        }
        // Validar teléfono US: acepta (312) 555-0000, 312-555-0000, 3125550000, +13125550000
        const phoneDigits = form.phone.replace(/\D/g, "");
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            setError("Please enter a valid US phone number (e.g. (312) 555-0000).");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/send-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, quote }),
            });

            if (!res.ok) throw new Error("Failed to send");
            onSuccess();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const materialLabels: Record<string, string> = {
        asphalt_shingle: "Asphalt Shingles",
        metal: "Premium Metal",
        flat_tpo: "Flat Roof (TPO)",
        slate: "Natural Slate",
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">

                {/* ── Columna izquierda: formulario ─────────────────────────── */}
                <div className="space-y-5">
                    <div>
                        <button
                            onClick={onBack}
                            className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mb-4 transition-colors"
                        >
                            ← Back to estimate
                        </button>
                        <h3 className="text-xl font-bold text-blue-900">Get Your Free Quote</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            A specialist will contact you within 24 hours.
                        </p>
                    </div>

                    {/* Nombre */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                First Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Last Name
                            </label>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Smith"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="john@email.com"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Cell Phone <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="(312) 555-0000"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Property Address
                        </label>
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="123 Main St, Chicago, IL"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                        />
                    </div>

                    {/* Checkbox PDF */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            name="sendPdf"
                            checked={form.sendPdf}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                            Send me a PDF copy of this estimate to my email
                        </span>
                    </label>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* ── Columna derecha: resumen del presupuesto ──────────────── */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-1">Your Estimate Summary</h3>
                        <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                                <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
                            </svg>
                            {quote.address || "Chicago Area"}
                        </div>

                        <div className="space-y-2 text-sm mb-6">
                            <div className="flex justify-between text-gray-500">
                                <span>Roof Size:</span>
                                <span className="font-semibold text-gray-800">{quote.sqft.toLocaleString()} sq ft</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Material:</span>
                                <span className="font-semibold text-gray-800">{materialLabels[quote.material] ?? quote.material}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Pitch:</span>
                                <span className="font-semibold text-gray-800 capitalize">{quote.pitch}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-3 mt-3 space-y-2">
                                <div className="flex justify-between text-gray-500">
                                    <span>Materials:</span>
                                    <span className="font-bold text-gray-800">${quote.materialCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Labor:</span>
                                    <span className="font-bold text-gray-800">${quote.laborCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Tear-off:</span>
                                    <span className="font-bold text-gray-800">${quote.removalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-t border-blue-200 pt-4 gap-1">
                            <span className="text-blue-900 font-black text-lg uppercase italic">Total Estimate</span>
                            <span className="text-4xl font-black text-blue-600 tracking-tight">
                                ${quote.total.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            <>
                                Submit & Get My Quote
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                        No spam. A real specialist will reach out within 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
};