export type RoofMaterial = 'asphalt_shingle' | 'flat_tpo'; // ← removidos metal y slate

export type RoofPitch = 'flat' | 'shallow' | 'medium' | 'steep' | 'high_steep'; // ← agregado high_steep

export interface RoofingQuoteRequest {
    address: string;
    squareFeet: number;
    material: RoofMaterial;
    pitch: RoofPitch;
    layersToRemove: number;
}

export interface QuoteBreakdown {
    materialCost: number;
    laborCost: number;
    removalCost: number;
    total: number;
}

export interface RoofDetectionData {
    detectedAreaSqFt: number;
    detectedPitchDegrees: number;
    roofPolygon: { lat: number; lng: number }[];
}