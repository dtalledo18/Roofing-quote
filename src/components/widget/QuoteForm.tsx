"use client";
import { useState } from 'react';
import { useRoofCalculator } from '@/hooks/useRoofCalculator';
import { RoofMaterial, RoofPitch } from '@/types/roofing';

interface QuoteFormProps {
    initialArea: number;
    initialPitch: RoofPitch;
}

export const QuoteForm = ({ initialArea, initialPitch }: QuoteFormProps) => {
    const { calculateQuote } = useRoofCalculator();

    // 1. Solo mantenemos estado para lo que el usuario REALMENTE cambia manualmente
    const [sqft, setSqft] = useState(initialArea);
    const [pitch, setPitch] = useState<RoofPitch>(initialPitch);
    const [material, setMaterial] = useState<RoofMaterial>('asphalt_shingle');
    const [layers, setLayers] = useState(1);

    // 2. ELIMINAMOS useEffect y el estado 'result'.
    // Calculamos el presupuesto "on the fly" durante el render.
    // Esto es mucho más rápido y evita el error de ESLint.
    const result = calculateQuote({
        address: "",
        squareFeet: sqft,
        material,
        pitch,
        layersToRemove: layers
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
            {/* Controles del Usuario */}
            <div className="space-y-6 text-black">
                <h3 className="text-xl font-bold text-blue-900 border-b pb-2">Roof Details</h3>

                {/* Slider de Pies Cuadrados */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Roof Size: <span className="text-blue-600 font-bold">{sqft} sq ft</span>
                    </label>
                    <input
                        type="range" min="500" max="8000" step="50"
                        value={sqft}
                        onChange={(e) => setSqft(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Selector de Material */}
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

                {/* Pitch / Inclinación (Diseño tipo PDF) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Roof Pitch (Steepness)</label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['flat', 'low', 'medium', 'steep'] as RoofPitch[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPitch(p)}
                                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all ${
                                    pitch === p
                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                }`}
                            >
                                <span className="text-[10px] uppercase font-black tracking-wider">{p}</span>
                                {initialPitch === p && (
                                    <span className="text-[8px] mt-1 bg-blue-100 text-blue-600 px-1 rounded">Suggested</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visualización del Precio (The Results) */}
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
                    <div className="flex justify-between items-end">
                        <span className="text-blue-900 font-black text-xl uppercase italic">Total Estimate</span>
                        <span className="text-4xl font-black text-blue-600 tracking-tight">
                             ${result.total.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 italic">
                        *This is an automated estimate for Chicago area. Final price subject to on-site inspection.
                    </p>
                </div>
            </div>
        </div>
    );
};