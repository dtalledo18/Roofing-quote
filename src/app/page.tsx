"use client";
// app/page.tsx
// FIX IMPORTANTE: Se eliminó key={`${selectedAddress}-${detectedArea}`} del QuoteForm.
// Ese key causaba que el formulario se destruyera y recreara con cada edición
// del polígono, perdiendo las selecciones del usuario (material, pitch).
//
// En su lugar, QuoteForm recibe initialArea como prop y lo usa solo para
// inicializar su estado interno. Los cambios del polígono se comunican
// mediante onPolygonEdit → setDetectedArea, y QuoteForm reacciona a través
// de un useEffect interno (ver QuoteForm.tsx).

import { useState } from "react";
import { AddressSearch } from "@/components/widget/AddressSearch";
import { RoofMap } from "@/components/widget/RoofMap";
import { QuoteForm } from "@/components/widget/QuoteForm";
import { DEFAULT_CENTER } from "@/lib/google-maps";
import { GoogleMapsProvider } from "@/components/widget/GoogleMapsProvider";
import { getRoofData } from "@/lib/google-solar";
import { RoofPitch } from "@/types/roofing";

export default function Home() {
    const [location, setLocation] = useState(DEFAULT_CENTER);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [detectedArea, setDetectedArea] = useState(2000);
    const [roofPolygon, setRoofPolygon] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
    const [suggestedPitch, setSuggestedPitch] = useState<RoofPitch>("medium");

    const handleAddressSelect = async (address: string, lat: number, lng: number) => {
        setLocation({ lat, lng });
        setSelectedAddress(address);

        try {
            const data = await getRoofData(lat, lng);
            setDetectedArea(data.areaSqFt);
            setRoofPolygon(data.coords);

            if (data.pitchDegrees < 5) {
                setSuggestedPitch("flat");
            } else if (data.pitchDegrees < 15) {
                setSuggestedPitch("shallow" as RoofPitch);
            } else if (data.pitchDegrees < 30) {
                setSuggestedPitch("medium");
            } else {
                setSuggestedPitch("steep");
            }
        } catch (error) {
            console.warn("Solar API unavailable — using defaults");
            setDetectedArea(2000);
        }
    };

    // Recalcula el área cuando el usuario edita el polígono
    const handlePolygonEdit = (newCoords: { lat: number; lng: number }[]) => {
        setRoofPolygon(newCoords);

        if (window.google?.maps?.geometry) {
            const areaInMeters = google.maps.geometry.spherical.computeArea(
                newCoords.map((c) => new google.maps.LatLng(c.lat, c.lng))
            );
            setDetectedArea(Math.round(areaInMeters * 10.7639));
        }
    };

    return (
        <GoogleMapsProvider>
            <main className="min-h-screen bg-gray-50 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold text-blue-900 font-open">Advanced Roofing Team</h1>
                        <p className="text-gray-600 text-lg">Instant Roof Estimate — Chicago</p>
                    </header>

                    <section >
                        <h2 className="text-xl font-semibold mb-4 text-center text-black">
                            Step 1: Enter your street address
                        </h2>
                        <AddressSearch onAddressSelect={handleAddressSelect} />
                    </section>

                    <section className="relative">
                        <RoofMap
                            center={location}
                            polygonCoords={roofPolygon}
                            onPolygonEdit={handlePolygonEdit}
                        />
                        {selectedAddress && (
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm font-medium text-gray-800 border border-gray-200 text-center">
                                📍 {selectedAddress}
                            </div>
                        )}
                    </section>

                    {selectedAddress && (
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Step 2: Review your roof and confirm its slope
                                </h2>
                                <p className="text-gray-500">
                                    The system detected your roof area and suggested a pitch.
                                </p>
                            </div>

                            {/*
                             * SIN key dinámico — el formulario persiste entre ediciones.
                             * detectedArea se pasa como prop; QuoteForm lo sincroniza
                             * internamente con un useEffect controlado.
                             */}
                            <QuoteForm
                                initialArea={detectedArea}
                                initialPitch={suggestedPitch}
                                liveArea={detectedArea}
                                address={selectedAddress}
                            />
                        </section>
                    )}
                </div>
            </main>
        </GoogleMapsProvider>
    );
}