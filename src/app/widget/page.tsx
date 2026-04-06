"use client";
// app/widget/page.tsx
// Widget standalone para embed via iframe.
// Step 1: AddressSearch + RoofMap
// Step 2: QuoteForm (calculadora)
// Sin navbar, sin footer, sin scroll — optimizado para iframe 420x640px

import { useState } from "react";
import { AddressSearch } from "@/components/widget/AddressSearch";
import { RoofMap } from "@/components/widget/RoofMap";
import { QuoteForm } from "@/components/widget/QuoteForm";
import { DEFAULT_CENTER } from "@/lib/google-maps";
import { GoogleMapsProvider } from "@/components/widget/GoogleMapsProvider";
import { getRoofData } from "@/lib/google-solar";
import { RoofPitch } from "@/types/roofing";

type WidgetStep = "search" | "quote";

export default function WidgetPage() {
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
            <div className="w-full h-screen overflow-hidden bg-white flex flex-col">

                {/* ── Header compacto ─────────────────────────────────── */}
                <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                            Advanced Roofing
                        </p>
                        <h1 className="text-base font-black text-gray-900 leading-tight">
                            {step === "search" ? "What will my roof cost?" : "Your Estimate"}
                        </h1>
                    </div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full transition-colors ${step === "search" ? "bg-blue-600" : "bg-gray-200"}`} />
                        <div className={`w-2 h-2 rounded-full transition-colors ${step === "quote" ? "bg-blue-600" : "bg-gray-200"}`} />
                    </div>
                </div>

                {/* ── Step 1: Search + Map ─────────────────────────────── */}
                {step === "search" && (
                    <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">

                        <AddressSearch onAddressSelect={handleAddressSelect} />

                        {/* Mapa — ocupa el espacio restante */}
                        <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 relative">
                            <RoofMap
                                center={location}
                                zoom={mapZoom}
                                polygonCoords={roofPolygon}
                                onPolygonEdit={handlePolygonEdit}
                                hideControls={!selectedAddress}
                            />

                            {/* Loading overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs font-semibold text-blue-700">Analyzing roof...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error state */}
                        {selectedAddress && roofError && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                <p className="text-sm font-semibold text-amber-800">
                                    {roofError === "no_building"
                                        ? "No building found at this address"
                                        : "Could not analyze this property"}
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-1.5 text-xs text-blue-600 font-bold underline"
                                >
                                    Try a different address
                                </button>
                            </div>
                        )}

                        {/* CTA — aparece cuando el techo fue detectado */}
                        {selectedAddress && !roofError && !isLoading && roofPolygon && (
                            <button
                                onClick={() => setStep("quote")}
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base py-3.5 rounded-xl shadow-lg transition-all uppercase tracking-wide"
                            >
                                See My Estimate →
                            </button>
                        )}
                    </div>
                )}

                {/* ── Step 2: Calculadora ──────────────────────────────── */}
                {step === "quote" && (
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {/* Back button */}
                        <button
                            onClick={() => setStep("search")}
                            className="mb-3 text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
                        >
                            ← Edit address
                        </button>

                        {/* Dirección detectada */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
                            <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Address</p>
                            <p className="text-xs font-bold text-blue-800 truncate">{selectedAddress}</p>
                        </div>

                        <QuoteForm
                            initialArea={detectedArea}
                            initialPitch={suggestedPitch}
                            liveArea={detectedArea}
                            address={selectedAddress}
                        />
                    </div>
                )}

            </div>
        </GoogleMapsProvider>
    );
}