"use client";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

interface RoofMapProps {
    center: { lat: number; lng: number };
}

const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
};

export const RoofMap = ({ center }: RoofMapProps) => {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const options = useMemo(() => ({
        mapTypeId: "satellite", // Modo satélite por defecto
        disableDefaultUI: true, // Limpia el mapa de botones innecesarios
        zoomControl: true,
        tilt: 45, // Vista en 45 grados si está disponible
    }), []);

    if (!isLoaded) return <div>Cargando mapa satelital...</div>;

    return (
        <div className="mt-6 border-4 border-white shadow-2xl rounded-xl overflow-hidden">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={19} // Zoom alto para ver el techo
                options={options}
            >
                <Marker position={center} />
            </GoogleMap>
        </div>
    );
};