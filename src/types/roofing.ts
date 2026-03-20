export type RoofMaterial = 'asphalt_shingle' | 'metal' | 'flat_tpo' | 'slate';
export type RoofPitch = 'flat' | 'shallow' | 'medium' | 'steep';

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
    roofPolygon: { lat: number; lng: number }[]; // Para "pintar" el techo
}