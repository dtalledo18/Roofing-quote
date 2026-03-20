"use client";
import { GoogleMap, Polygon } from "@react-google-maps/api";
import { useMemo } from "react";

interface RoofMapProps {
    center: { lat: number; lng: number };
    polygonCoords?: { lat: number; lng: number }[];
}

const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "12px",
};

export const RoofMap = ({ center, polygonCoords }: RoofMapProps) => {
    // Configuración del mapa memorizada para evitar parpadeos
    const options = useMemo(() => ({
        mapTypeId: "satellite",
        disableDefaultUI: true,
        zoomControl: true,
        tilt: 45,
    }), []);

    const polygonOptions = useMemo(() => ({
        fillColor: "#ef4444", // Rojo como en el PDF
        fillOpacity: 0.4,
        strokeColor: "#dc2626",
        strokeWeight: 2,
        clickable: false,
    }), []);

    return (
        <div className="mt-6 border-4 border-white shadow-2xl rounded-xl overflow-hidden">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={20} // Un zoom de 20 o 21 es ideal para ver el detalle del techo [cite: 16]
                options={{
                    mapTypeId: "satellite",
                    disableDefaultUI: true,
                    tilt: 0, // 0 para vista totalmente cenital (plana), ayuda a que el polígono encaje mejor
                }}
            >
                {polygonCoords && (
                    <Polygon
                        paths={polygonCoords}
                        options={{
                            fillColor: "#ef4444",
                            fillOpacity: 0.5,
                            strokeColor: "#dc2626",
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};