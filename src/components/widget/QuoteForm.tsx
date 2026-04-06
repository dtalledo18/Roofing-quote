"use client";

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

// Pitches disponibles para asphalt — TPO no usa pitch
const ASPHALT_PITCHES: { value: RoofPitch; label: string; range: string }[] = [
    { value: "flat",       label: "Flat",       range: "0/12"        },
    { value: "shallow",    label: "Shallow",    range: "4/12–6/12"   },
    { value: "medium",     label: "Medium",     range: "7/12–8/12"   },
    { value: "steep",      label: "Steep",      range: "9/12–11/12"  },
    { value: "high_steep", label: "High Steep", range: "12/12"       },
];

export const QuoteForm = ({ initialArea, initialPitch, liveArea, address = "" }: QuoteFormProps) => {
    const { calculateQuote } = useRoofCalculator();
    const [step, setStep] = useState<Step>("quote");
    const [sqft, setSqft] = useState(initialArea);
    const [pitch, setPitch] = useState<RoofPitch>(initialPitch);
    const [material, setMaterial] = useState<RoofMaterial>("asphalt_shingle");
    const [layers, setLayers] = useState(1);

    const isTPO = material === "flat_tpo";

    useEffect(() => { setPitch(initialPitch); }, [initialPitch]);

    useEffect(() => {
        if (liveArea !== undefined && liveArea !== sqft) setSqft(liveArea);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveArea]);

    const result = calculateQuote({ address, squareFeet: sqft, material, pitch, layersToRemove: layers });

    const quoteSummary = { address, sqft, material, pitch, layers, ...result };

    if (step === "lead") return <LeadForm quote={quoteSummary} onSuccess={() => setStep("confirmation")} onBack={() => setStep("quote")} />;
    if (step === "confirmation") return <ConfirmationScreen total={result.total} />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">

            {/* ── Controles ── */}
            <div className="space-y-6 text-black">
                <h3 className="text-xl font-bold text-blue-900 border-b pb-2">Roof Details</h3>

                {/* Área */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                    <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-0.5">Detected Roof Area</p>
                    <p className="text-2xl font-black text-blue-700">
                        {sqft.toLocaleString()} <span className="text-base font-semibold">sq ft</span>
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1">Drag polygon vertices on the map to adjust</p>
                </div>

                {/* Material — solo 2 opciones */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: "asphalt_shingle", label: "Asphalt Shingles" },
                            { value: "flat_tpo",        label: "Flat Roof (TPO)"  },
                        ].map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMaterial(m.value as RoofMaterial)}
                                className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                    material === m.value
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pitch — solo si es asphalt */}
                {!isTPO && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Roof Pitch (Steepness)</label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {ASPHALT_PITCHES.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPitch(p.value)}
                                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all ${
                                        pitch === p.value
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                                    }`}
                                >
                                    <span className="text-[9px] uppercase font-black tracking-wider leading-tight text-center">{p.label}</span>
                                    <span className="text-[8px] text-gray-400 mt-0.5">{p.range}</span>
                                    {initialPitch === p.value && (
                                        <span className="text-[7px] mt-1 bg-blue-100 text-blue-600 px-1 rounded">Suggested</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* TPO info */}
                {isTPO && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                        <p className="text-xs text-amber-700 font-semibold">
                            TPO flat roofs are priced at a fixed rate per square. No pitch or layer removal applies.
                        </p>
                    </div>
                )}

                {/* Layers — solo si es asphalt */}
                {!isTPO && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Layers to Remove</label>
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
                )}
            </div>

            {/* ── Estimate Summary ── */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Estimate Summary</h3>
                    <div className="space-y-3 text-sm">

                        {isTPO ? (
                            <div className="flex items-center gap-3 text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                <span>TPO Flat Roof Installation (incl. insulation)</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                    <span>Asphalt Shingles — {ASPHALT_PITCHES.find(p => p.value === pitch)?.label} pitch ({ASPHALT_PITCHES.find(p => p.value === pitch)?.range})</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                    <span>Tear-off & Disposal — {layers} {layers === 1 ? "layer" : "layers"}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 mb-6">
                        <span className="text-blue-900 font-black text-xl uppercase italic">Total Estimate</span>
                        <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
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