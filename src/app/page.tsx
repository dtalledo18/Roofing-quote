"use client";

import { useState } from "react";
import { AddressSearch } from "@/components/widget/AddressSearch";
import { RoofMap } from "@/components/widget/RoofMap";
import { QuoteForm } from "@/components/widget/QuoteForm";
import { DEFAULT_CENTER } from "@/lib/google-maps";
import { GoogleMapsProvider } from "@/components/widget/GoogleMapsProvider";
import { getRoofData } from "@/lib/google-solar"; // Asegúrate de haber creado este archivo
import { RoofPitch } from "@/types/roofing";

export default function Home() {
    // Estados para la ubicación
    const [location, setLocation] = useState(DEFAULT_CENTER);
    const [selectedAddress, setSelectedAddress] = useState("");

    // Estados para los datos detectados del techo (Sprint 3)
    const [detectedArea, setDetectedArea] = useState(2000);
    const [roofPolygon, setRoofPolygon] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
    const [suggestedPitch, setSuggestedPitch] = useState<RoofPitch>('medium');

    const handleAddressSelect = async (address: string, lat: number, lng: number) => {
        setLocation({ lat, lng });
        setSelectedAddress(address);

        try {
            const data = await getRoofData(lat, lng);
            setDetectedArea(data.areaSqFt);
            setRoofPolygon(data.coords);

            // Casting del valor para que coincida con el tipo RoofPitch
            if (data.pitchDegrees < 10) {
                setSuggestedPitch('flat' as RoofPitch);
            } else if (data.pitchDegrees < 20) {
                setSuggestedPitch('shallow' as RoofPitch); // Aquí estaba el error
            } else {
                setSuggestedPitch('medium' as RoofPitch);
            }

        } catch (error) {
            console.warn("Manual override: Usando estimación por defecto");
            setDetectedArea(2000);
        }
    };

    return (
        <GoogleMapsProvider>
            <main className="min-h-screen bg-gray-50 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold text-blue-900">Advanced Roofing Team</h1>
                        <p className="text-gray-600 text-lg">Instant Roof Estimate - Chicago</p>
                    </header>

                    {/* Paso 1: Localizar la casa [cite: 1, 3] */}
                    <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 text-center text-black">Step 1: Enter your street address</h2>
                        <AddressSearch onAddressSelect={handleAddressSelect} />
                    </section>

                    {/* Paso 2: Visualización y detección  */}
                    <section className="relative">
                        <RoofMap center={location} polygonCoords={roofPolygon} />
                        {selectedAddress && (
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm font-medium text-gray-800 border border-gray-200 text-center">
                                📍 {selectedAddress}
                            </div>
                        )}
                    </section>

                    {selectedAddress && (
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Step 2: Review your roof and confirm its slope</h2>
                                <p className="text-gray-500">The system detected your roof area and suggested a pitch. [cite: 7, 16]</p>
                            </div>

                            {/* Pasamos los datos detectados al formulario como props iniciales */}
                            <QuoteForm
                                key={selectedAddress} // Esto fuerza a React a recrear el componente con los nuevos datos
                                initialArea={detectedArea}
                                initialPitch={suggestedPitch}
                            />
                        </section>
                    )}
                </div>
            </main>
        </GoogleMapsProvider>
    );
}