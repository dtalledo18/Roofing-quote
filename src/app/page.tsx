"use client";

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
    const [mapZoom, setMapZoom] = useState(11); // Vista ciudad por defecto
    const [roofError, setRoofError] = useState<string | null>(null);

    const handleAddressSelect = async (address: string, lat: number, lng: number) => {
        setLocation({ lat, lng });
        setSelectedAddress(address);
        setMapZoom(18); // Zoom al techo al seleccionar

        setRoofError(null);
        setRoofPolygon(undefined);

        try {
            const data = await getRoofData(lat, lng);

            // Validar que la respuesta tenga datos reales de un edificio
            // Un techo real: mínimo 300 sqft, máximo 200,000 sqft (edificio muy grande)
            if (!data.areaSqFt || data.areaSqFt < 300 || data.areaSqFt > 200000) {
                setRoofError("no_building");
                return;
            }
            if (!data.coords || data.coords.length < 3) {
                setRoofError("no_polygon");
                return;
            }
            // Validar que la dirección tenga número de calle (ej: "123 Main St")
            // Direcciones sin número suelen ser calles, parques, etc.
            const hasStreetNumber = /^\d+/.test(address.trim());
            if (!hasStreetNumber) {
                setRoofError("no_building");
                return;
            }

            setDetectedArea(data.areaSqFt);
            setRoofPolygon(data.coords);

            if (data.pitchDegrees < 5) setSuggestedPitch("flat");
            else if (data.pitchDegrees < 15) setSuggestedPitch("shallow");
            else if (data.pitchDegrees < 30) setSuggestedPitch("medium");
            else setSuggestedPitch("steep");
        } catch (err: any) {
            if (err?.message === "no_building") {
                setRoofError("no_building");
            } else {
                setRoofError("api_error");
            }
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

    return (
        <GoogleMapsProvider>
            <main className="min-h-screen bg-gray-50 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    <header className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold text-blue-900">
                            What Will My Roof Cost?
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Enter your street address to get an accurate estimate instantly


                        </p>
                    </header>

                    <section >
                        <AddressSearch onAddressSelect={handleAddressSelect} />
                    </section>

                    <section className="relative">
                        <RoofMap
                            center={location}
                            zoom={mapZoom}
                            polygonCoords={roofPolygon}
                            onPolygonEdit={handlePolygonEdit}
                            hideControls={!selectedAddress}
                        />
                    </section>

                    {selectedAddress && roofError && (
                        <section className="animate-in fade-in duration-500">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center space-y-4">
                                <div className="text-5xl">
                                    ⚠️
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {roofError === "no_building"
                                        ? "No building found at this address"
                                        : "Could not analyze this property"}
                                </h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                    {roofError === "no_building"
                                        ? "This address doesn't appear to have a rooftop structure. Please try a residential or commercial property address."
                                        : "We couldn't detect a roof at this location. Try using the Redraw Roof tool to mark your roof manually."}
                                </p>
                                <button
                                    onClick={() => {
                                        setRoofError(null);
                                        setSelectedAddress("");
                                        setRoofPolygon(undefined);
                                        setMapZoom(11);
                                    }}
                                    className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all active:scale-95"
                                >
                                    ← Try a different address
                                </button>
                            </div>
                        </section>
                    )}

                    {selectedAddress && !roofError && (
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Review your roof and confirm its slope
                                </h2>
                                <p className="text-gray-500">
                                    The system detected your roof area and suggested a pitch.
                                </p>
                            </div>
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