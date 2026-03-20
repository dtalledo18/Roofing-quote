"use client";
import { GoogleMap, Polygon } from "@react-google-maps/api";
import { useMemo, useCallback, useRef } from "react";

interface RoofMapProps {
    center: { lat: number; lng: number };
    polygonCoords?: { lat: number; lng: number }[];
    onPolygonEdit?: (newCoords: { lat: number; lng: number }[]) => void;
}

export const RoofMap = ({ center, polygonCoords, onPolygonEdit }: RoofMapProps) => {
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    // Se ejecuta cuando el usuario termina de arrastrar un punto
    const onEdit = useCallback(() => {
        if (polygonRef.current && onPolygonEdit) {
            const path = polygonRef.current.getPath();
            const coords = path.getArray().map(latLng => ({
                lat: latLng.lat(),
                lng: latLng.lng()
            }));
            onPolygonEdit(coords);
        }
    }, [onPolygonEdit]);

    const polygonOptions = useMemo(() => ({
        fillColor: "#ef4444",
        fillOpacity: 0.4,
        strokeColor: "#dc2626",
        strokeWeight: 2,
        editable: true, // PERMITE MOVER LOS PUNTOS
        draggable: true, // PERMITE MOVER TODA LA FIGURA
    }), []);

    return (
        <div className="mt-6 border-4 border-white shadow-2xl rounded-xl overflow-hidden relative">
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "400px" }}
                center={center}
                zoom={20}
                options={{ mapTypeId: "satellite", disableDefaultUI: true }}
            >
                {polygonCoords && (
                    <Polygon
                        onLoad={(poly) => (polygonRef.current = poly)}
                        paths={polygonCoords}
                        options={polygonOptions}
                        onMouseUp={onEdit} // Captura el cambio al soltar el mouse
                        onDragEnd={onEdit}
                    />
                )}
            </GoogleMap>

            {/* Tooltip de ayuda como en el PDF */}
            <div className="absolute top-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                Drag points to align with your roof edges [cite: 7, 23]
            </div>
        </div>
    );
};