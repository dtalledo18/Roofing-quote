export type RoofMaterial = 'asphalt_shingle' | 'metal' | 'flat_tpo' | 'slate';
export type RoofPitch = 'flat' | 'low' | 'medium' | 'steep';

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