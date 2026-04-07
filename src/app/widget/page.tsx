"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import { AddressSearch } from "@/components/widget/AddressSearch";
import { RoofMap } from "@/components/widget/RoofMap";
import { QuoteForm } from "@/components/widget/QuoteForm";
import { DEFAULT_CENTER } from "@/lib/google-maps";
import { GoogleMapsProvider } from "@/components/widget/GoogleMapsProvider";
import { getRoofData } from "@/lib/google-solar";
import { DetectedPitch } from "@/types/roofing";

// Función auxiliar para convertir HEX a RGB (para los fondos con opacidad)
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "37, 99, 235"; // fallback blue
}

type WidgetStep = "search" | "quote";

function WidgetContent() {
    const params = useSearchParams();

    // Memorizamos los colores para evitar re-calculos innecesarios
    const theme = useMemo(() => {
        const accentParam = params.get("accent") || "1d4ed8";
        const textParam = params.get("text") || "ffffff";
        const accentHex = `#${accentParam.replace('#', '')}`;
        return {
            accent: accentHex,
            accentRgb: hexToRgb(accentHex),
            text: `#${textParam.replace('#', '')}`
        };
    }, [params]);

    const [step, setStep] = useState<WidgetStep>("search");
    const [location, setLocation] = useState(DEFAULT_CENTER);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [detectedArea, setDetectedArea] = useState(2000);
    const [roofPolygon, setRoofPolygon] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
    const [suggestedPitch, setSuggestedPitch] = useState<DetectedPitch>("medium");
    const [mapZoom, setMapZoom] = useState(11);
    const [roofError, setRoofError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddressSelect = async (address: string, lat: number, lng: number) => {
        setLocation({ lat, lng });
        setSelectedAddress(address);
        setMapZoom(18);
        setRoofError(null);
        setRoofPolygon(undefined);
        setIsLoading(true);

        try {
            const data = await getRoofData(lat, lng);

            if (!data.areaSqFt || data.areaSqFt < 300 || data.areaSqFt > 200000) {
                setRoofError("no_building");
                setIsLoading(false);
                return;
            }
            if (!data.coords || data.coords.length < 3) {
                setRoofError("no_polygon");
                setIsLoading(false);
                return;
            }

            const hasStreetNumber = /^\d+/.test(address.trim());
            if (!hasStreetNumber) {
                setRoofError("no_building");
                setIsLoading(false);
                return;
            }

            setDetectedArea(data.areaSqFt);
            setRoofPolygon(data.coords);

            if (data.pitchDegrees < 5) setSuggestedPitch("flat");
            else if (data.pitchDegrees < 15) setSuggestedPitch("shallow");
            else if (data.pitchDegrees < 30) setSuggestedPitch("medium");
            else setSuggestedPitch("steep");

        } catch (err: any) {
            setRoofError(err?.message === "no_building" ? "no_building" : "api_error");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePolygonEdit = (newCoords: { lat: number; lng: number }[]) => {
        setRoofPolygon(newCoords);
        if (window.google?.maps?.geometry) {
            const areaInMeters = google.maps.geometry.spherical.computeArea(
                newCoords.map((c) => new google.maps.LatLng(c.lat, c.lng))
            );
            setDetectedArea(Math.round(areaInMeters * 10.7639));
        }
    };

    const handleReset = () => {
        setStep("search");
        setRoofError(null);
        setSelectedAddress("");
        setRoofPolygon(undefined);
        setMapZoom(11);
        setLocation(DEFAULT_CENTER);
    };

    return (
        <GoogleMapsProvider>
            <div
                className="w-full h-screen overflow-hidden bg-white flex flex-col"
                style={{
                    "--widget-accent": theme.accent,
                    "--widget-accent-rgb": theme.accentRgb,
                    "--widget-text": theme.text
                } as React.CSSProperties}
            >
                {/* ── Header ─────────────────────────────────── */}
                <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--widget-accent)" }}>
                            Advanced Roofing
                        </p>
                        <h1 className="text-base font-black text-gray-900 leading-tight">
                            {step === "search" ? "What will my roof cost?" : "Your Estimate"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full transition-colors" style={{ backgroundColor: step === "search" ? "var(--widget-accent)" : "#E5E7EB" }} />
                        <div className="w-2 h-2 rounded-full transition-colors" style={{ backgroundColor: step === "quote" ? "var(--widget-accent)" : "#E5E7EB" }} />
                    </div>
                </div>

                {/* ── Step 1: Search + Map ─────────────────────────────── */}
                {step === "search" && (
                    <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
                        <AddressSearch onAddressSelect={handleAddressSelect} />

                        <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 relative group">
                            <RoofMap
                                center={location}
                                zoom={mapZoom}
                                polygonCoords={roofPolygon}
                                onPolygonEdit={handlePolygonEdit}
                                hideControls={!selectedAddress}
                            />

                            {/* --- ESTADO DE CARGA NEUTRAL Y PREMIUM --- */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-20 transition-all">
                                    <div className="bg-white/90 shadow-2xl border border-gray-100 px-8 py-6 rounded-2xl flex flex-col items-center gap-4 max-w-[80%]">
                                        {/* Spinner Clásico Minimalista */}
                                        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />

                                        <div className="text-center">
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">
                                                Analyzing Roof
                                            </p>
                                            <div className="flex gap-1 justify-center">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- ERROR NEUTRAL --- */}
                        {selectedAddress && roofError && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                <p className="text-sm font-bold text-gray-900 mb-2">
                                    {roofError === "no_building" ? "No building detected at this location" : "Technical error analyzing property"}
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-black border-b border-gray-300 hover:border-black transition-all"
                                >
                                    Try a different address
                                </button>
                            </div>
                        )}

                        {/* --- BOTÓN PRINCIPAL (Ya neutralizado) --- */}
                        {selectedAddress && !roofError && !isLoading && roofPolygon && (
                            <button
                                onClick={() => setStep("quote")}
                                className="w-full active:scale-95 transition-all duration-300 ease-in-out uppercase tracking-wider py-4 rounded-xl shadow-lg font-black text-base
               bg-transparent border-2 border-gray-900 text-gray-900
               hover:bg-gray-900 hover:text-white"
                            >
                                See My Estimate →
                            </button>
                        )}
                    </div>
                )}

                {/* ── Step 2: Calculadora ──────────────────────────────── */}
                {step === "quote" && (
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {/* Botón Back Neutral */}
                        <button
                            onClick={() => setStep("search")}
                            className="mb-4 text-xs font-bold flex items-center gap-1 text-gray-400 hover:text-black transition-colors"
                        >
                            ← Back
                        </button>

                        {/* Badge de Dirección Neutral */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-5 shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-0.5">
                                Target Property Address
                            </p>
                            <p className="text-xs font-bold truncate text-gray-900">
                                {selectedAddress}
                            </p>
                        </div>
                        <QuoteForm initialArea={detectedArea} initialPitch={suggestedPitch} liveArea={detectedArea} address={selectedAddress} />
                    </div>
                )}
            </div>
        </GoogleMapsProvider>
    );
}

export default function WidgetPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Loading Widget...</div>}>
            <WidgetContent />
        </Suspense>
    );
}