"use client";

import { useState } from "react";
import { AddressSearch } from "@/components/widget/AddressSearch";
import { RoofMap } from "@/components/widget/RoofMap";
import { DEFAULT_CENTER } from "@/lib/google-maps";
import { GoogleMapsProvider } from "@/components/widget/GoogleMapsProvider"; // Importa el provider

export default function Home() {
    const [location, setLocation] = useState(DEFAULT_CENTER);
    const [selectedAddress, setSelectedAddress] = useState("");

    const handleAddressSelect = (address: string, lat: number, lng: number) => {
        setSelectedAddress(address);
        setLocation({ lat, lng });
    };

    return (
        <GoogleMapsProvider> {/* <--- Envuelve aquí */}
            <main className="min-h-screen bg-gray-50 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold text-blue-900">Advanced Roofing Team</h1>
                        <p className="text-gray-600 text-lg">Instant Roof Estimate - Chicago</p>
                    </header>

                    <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 text-center">Step 1: Locate your home</h2>
                        <AddressSearch onAddressSelect={handleAddressSelect} />
                    </section>

                    <section className="relative">
                        <RoofMap center={location} />
                        {selectedAddress && (
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm font-medium text-gray-800 border border-gray-200 text-center">
                                📍 {selectedAddress}
                            </div>
                        )}
                    </section>
                    {/* ... resto del código del botón ... */}
                </div>
            </main>
        </GoogleMapsProvider>
    );
}