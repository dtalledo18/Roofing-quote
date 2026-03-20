"use client";
// components/widget/RoofMap.tsx
//
// Flujo:
//  1. Muestra el polígono detectado automáticamente (Convex Hull de segmentos)
//  2. Botón "✏️ Edit Roof" activa Drawing Manager para que el usuario
//     redibuje el polígono encima del satélite con total precisión.
//  3. Al cerrar el polígono, reemplaza el anterior y activa edición de vértices.
//  4. onPolygonEdit dispara el recálculo de área en page.tsx.

import { GoogleMap, Polygon, DrawingManager } from "@react-google-maps/api";
import { useMemo, useCallback, useRef, useState } from "react";

interface RoofMapProps {
    center: { lat: number; lng: number };
    polygonCoords?: { lat: number; lng: number }[];
    onPolygonEdit?: (newCoords: { lat: number; lng: number }[]) => void;
}

const MAP_CONTAINER_STYLE = { width: "100%", height: "480px" };

const MAP_OPTIONS: google.maps.MapOptions = {
    mapTypeId: "satellite",
    disableDefaultUI: true,
    tilt: 0,          // Vista cenital perfecta — sin perspectiva 3D
    rotateControl: false,
};

export const RoofMap = ({ center, polygonCoords, onPolygonEdit }: RoofMapProps) => {
    const polygonRef = useRef<google.maps.Polygon | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawnCoords, setDrawnCoords] = useState<{ lat: number; lng: number }[] | undefined>(undefined);

    // Coords activas: las dibujadas por el usuario tienen prioridad
    const activeCoords = drawnCoords ?? polygonCoords;

    // ── Opciones del polígono detectado / editado ─────────────────────────────
    const polygonOptions = useMemo<google.maps.PolygonOptions>(() => ({
        fillColor: "#3b82f6",
        fillOpacity: 0.25,
        strokeColor: "#2563eb",
        strokeWeight: 2.5,
        editable: !isDrawingMode,   // No editable mientras se dibuja
        draggable: false,
        clickable: true,
        zIndex: 1,
    }), [isDrawingMode]);

    // ── Opciones del Drawing Manager ─────────────────────────────────────────
    const drawingManagerOptions = useMemo<google.maps.drawing.DrawingManagerOptions>(() => ({
        drawingMode: "polygon" as google.maps.drawing.OverlayType,
        drawingControl: false, // Ocultamos el control nativo; usamos nuestro botón
        polygonOptions: {
            fillColor: "#3b82f6",
            fillOpacity: 0.25,
            strokeColor: "#2563eb",
            strokeWeight: 2.5,
            editable: true,
            draggable: false,
            zIndex: 2,
        },
    }), []);

    // ── Callback: vértice movido en polígono existente ────────────────────────
    const onEdit = useCallback(() => {
        if (polygonRef.current && onPolygonEdit) {
            const path = polygonRef.current.getPath();
            const coords = path.getArray().map(ll => ({
                lat: ll.lat(),
                lng: ll.lng(),
            }));
            onPolygonEdit(coords);
        }
    }, [onPolygonEdit]);

    // ── Callback: usuario terminó de dibujar un nuevo polígono ───────────────
    const onPolygonComplete = useCallback(
        (poly: google.maps.Polygon) => {
            // Extraer vértices
            const path = poly.getPath();
            const coords = path.getArray().map(ll => ({
                lat: ll.lat(),
                lng: ll.lng(),
            }));

            // Eliminar el polígono temporal creado por el Drawing Manager
            poly.setMap(null);

            // Guardar coords y salir del modo dibujo
            setDrawnCoords(coords);
            setIsDrawingMode(false);

            // Notificar al padre
            onPolygonEdit?.(coords);

            // Guardar referencia para edición posterior
            // (el Polygon de react-google-maps se montará con estas coords)
        },
        [onPolygonEdit]
    );

    // ── Activar modo dibujo ───────────────────────────────────────────────────
    const startDrawing = () => {
        setIsDrawingMode(true);
        // Limpiar el polígono actual para que el usuario parta de cero
        setDrawnCoords(undefined);
    };

    // ── Resetear al polígono detectado automáticamente ────────────────────────
    const resetToDetected = () => {
        setIsDrawingMode(false);
        setDrawnCoords(undefined);
        if (polygonCoords) {
            onPolygonEdit?.(polygonCoords);
        }
    };

    return (
        <div className="mt-6 border-4 border-white shadow-2xl rounded-xl overflow-hidden relative">
            <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={20}
                options={MAP_OPTIONS}
            >
                {/* Polígono activo (detectado o dibujado por el usuario) */}
                {activeCoords && !isDrawingMode && (
                    <Polygon
                        onLoad={(poly) => (polygonRef.current = poly)}
                        paths={activeCoords}
                        options={polygonOptions}
                        onMouseUp={onEdit}
                        onDragEnd={onEdit}
                    />
                )}

                {/* Drawing Manager — solo activo cuando el usuario presiona Edit */}
                {isDrawingMode && (
                    <DrawingManager
                        options={drawingManagerOptions}
                        onPolygonComplete={onPolygonComplete}
                    />
                )}
            </GoogleMap>

            {/* ── Barra de herramientas flotante ─────────────────────────────── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {!isDrawingMode ? (
                    <>
                        {/* Tooltip de ayuda */}
                        <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                            Drag points to adjust roof edges
                        </div>

                        {/* Botón Edit Roof */}
                        <button
                            onClick={startDrawing}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition-all active:scale-95"
                        >
                            ✏️ Edit Roof
                        </button>

                        {/* Botón Reset (solo si el usuario ya dibujó algo) */}
                        {drawnCoords && (
                            <button
                                onClick={resetToDetected}
                                className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-all active:scale-95"
                            >
                                ↺ Reset
                            </button>
                        )}
                    </>
                ) : (
                    /* Instrucción mientras dibuja */
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                            🖊️ Click to place points — Click first point to close shape
                        </div>
                        <button
                            onClick={() => setIsDrawingMode(false)}
                            className="bg-white/80 hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* ── Badge de área detectada (esquina inferior derecha) ───────────── */}
            {activeCoords && !isDrawingMode && (
                <div className="absolute bottom-14 right-3 bg-white/90 backdrop-blur-sm border border-gray-200 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-lg shadow">
                    {activeCoords.length} vertices detected
                </div>
            )}
        </div>
    );
};