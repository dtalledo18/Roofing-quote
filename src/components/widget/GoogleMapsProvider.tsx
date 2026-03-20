"use client";
import { useJsApiLoader } from "@react-google-maps/api";
import { MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { ReactNode } from "react";

// src/components/widget/GoogleMapsProvider.tsx
export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script", // Este ID debe ser único y consistente
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAPS_LIBRARIES,
    });

    if (loadError) return <div className="p-4 text-red-500">Error loading Maps</div>;
    if (!isLoaded) return <div className="p-4">Loading satellite engine...</div>;

    return <>{children}</>;
};