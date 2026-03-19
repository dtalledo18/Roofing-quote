"use client";
import { useRoofCalculator } from '@/hooks/useRoofCalculator';

export default function TestPage() {
  const { calculateQuote } = useRoofCalculator();

  const demoQuote = calculateQuote({
    address: "Chicago Ave, IL",
    squareFeet: 2500, // Una casa promedio
    material: 'asphalt_shingle',
    pitch: 'steep', // Techo inclinado
    layersToRemove: 2
  });

  console.log("Presupuesto Estimado:", demoQuote);

  return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">Sprint 1: Motor de Cálculo Listo</h1>
        <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(demoQuote, null, 2)}
      </pre>
      </main>
  );
}