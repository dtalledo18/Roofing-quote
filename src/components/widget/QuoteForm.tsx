"use client";
// components/widget/QuoteForm.tsx
// Muestra el precio en vivo. Al hacer click en "Get My Quote"
// se reemplaza por el LeadForm.

import { useState, useEffect } from "react";
import { useRoofCalculator } from "@/hooks/useRoofCalculator";
import { RoofMaterial, RoofPitch } from "@/types/roofing";
import { LeadForm } from "./LeadForm";
import { ConfirmationScreen } from "./ConfirmationScreen";

interface QuoteFormProps {
    initialArea: number;
    initialPitch: RoofPitch;
    liveArea?: number;
    address?: string;
}

type Step = "quote" | "lead" | "confirmation";

export const QuoteForm = ({ initialArea, initialPitch, liveArea, address = "" }: QuoteFormProps) => {
    const { calculateQuote } = useRoofCalculator();
    const [step, setStep] = useState<Step>("quote");

    const [sqft, setSqft] = useState(initialArea);
    const [pitch, setPitch] = useState<RoofPitch>(initialPitch);
    const [material, setMaterial] = useState<RoofMaterial>("asphalt_shingle");
    const [layers, setLayers] = useState(1);

    // Sincroniza área desde el mapa sin destruir el resto del estado
    useEffect(() => {
        if (liveArea !== undefined && liveArea !== sqft) {
            setSqft(liveArea);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveArea]);

    const result = calculateQuote({
        address,
        squareFeet: sqft,
        material,
        pitch,
        layersToRemove: layers,
    });

    // Datos para pasar al LeadForm y al PDF
    const quoteSummary = {
        address,
        sqft,
        material,
        pitch,
        layers,
        materialCost: result.materialCost,
        laborCost: result.laborCost,
        removalCost: result.removalCost,
        total: result.total,
    };

    if (step === "lead") {
        return (
            <LeadForm
                quote={quoteSummary}
                onSuccess={() => setStep("confirmation")}
                onBack={() => setStep("quote")}
            />
        );
    }

    if (step === "confirmation") {
        return <ConfirmationScreen total={result.total} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">

            {/* ── Controles ──────────────────────────────────────────────── */}
            <div className="space-y-6 text-black">
                <h3 className="text-xl font-bold text-blue-900 border-b pb-2">Roof Details</h3>

                {/* Área detectada */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-0.5">
                        Detected Roof Area
                    </p>
                    <p className="text-2xl font-black text-blue-700">
                        {sqft.toLocaleString()} <span className="text-base font-semibold">sq ft</span>
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1">
                        Drag polygon vertices on the map to adjust
                    </p>
                </div>

                {/* Material */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                    <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value as RoofMaterial)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-black"
                    >
                        <option value="asphalt_shingle">Asphalt Shingles (Standard)</option>
                        <option value="metal">Premium Metal</option>
                        <option value="flat_tpo">Flat Roof (TPO)</option>
                        <option value="slate">Natural Slate</option>
                    </select>
                </div>

                {/* Pitch */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Roof Pitch (Steepness)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {(["flat", "low", "medium", "steep"] as RoofPitch[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPitch(p)}
                                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all ${
                                    pitch === p
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                                }`}
                            >
                                <span className="text-[10px] uppercase font-black tracking-wider">{p}</span>
                                {initialPitch === p && (
                                    <span className="text-[8px] mt-1 bg-blue-100 text-blue-600 px-1 rounded">
                                        Suggested
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Layers */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Existing Layers to Remove
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                onClick={() => setLayers(n)}
                                className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                                    layers === n
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                                }`}
                            >
                                {n} {n === 1 ? "layer" : "layers"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Resumen de precio ───────────────────────────────────────── */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Estimate Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Materials:</span>
                            <span className="font-bold text-gray-900">${result.materialCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Labor & Pitch Adjustment:</span>
                            <span className="font-bold text-gray-900">${result.laborCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tear-off & Disposal:</span>
                            <span className="font-bold text-gray-900">${result.removalCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-blue-900 font-black text-xl uppercase italic">Total Estimate</span>
                        <span className="text-4xl font-black text-blue-600 tracking-tight">
                            ${result.total.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={() => setStep("lead")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wide"
                    >
                        Get My Quote →
                    </button>

                    <p className="text-[10px] text-gray-400 mt-4 italic text-center">
                        *Automated estimate for Chicago area. Final price subject to on-site inspection.
                    </p>
                </div>
            </div>
        </div>
    );
};