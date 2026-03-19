"use client";
import { useJsApiLoader } from "@react-google-maps/api";
import { MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { ReactNode } from "react";

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: MAPS_LIBRARIES,
    });

    if (loadError) return <div>Error loading Google Maps</div>;
    if (!isLoaded) return <div>Loading Google Maps Engine...</div>;

    return <>{children}</>;
};