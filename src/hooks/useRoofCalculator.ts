import { CHICAGO_ROOFING_PRICES } from '@/lib/constants';
import { RoofingQuoteRequest, QuoteBreakdown } from '@/types/roofing';

export const useRoofCalculator = () => {

    const calculateQuote = (data: RoofingQuoteRequest): QuoteBreakdown => {
        const { squareFeet, material, pitch, layersToRemove } = data;

        // Convertimos pies cuadrados a "Squares" (unidades de 100 sqft)
        const squares = squareFeet / CHICAGO_ROOFING_PRICES.SQUARE_FOOT_UNIT;

        // 1. Costo de Materiales
        const materialBase = CHICAGO_ROOFING_PRICES.MATERIALS[material] * squares;

        // 2. Costo de Mano de Obra (afectado por la inclinación/pitch)
        const pitchMultiplier = CHICAGO_ROOFING_PRICES.PITCH_MULTIPLIER[pitch];
        const laborTotal = (CHICAGO_ROOFING_PRICES.LABOR_PER_SQUARE * squares) * pitchMultiplier;

        // 3. Costo de Remoción de capas viejas (muy común en Chicago)
        const removalTotal = (layersToRemove * CHICAGO_ROOFING_PRICES.REMOVAL_PER_LAYER_SQ) * squares;

        // 4. Total Final
        const total = materialBase + laborTotal + removalTotal;

        return {
            materialCost: Number(materialBase.toFixed(2)),
            laborCost: Number(laborTotal.toFixed(2)),
            removalCost: Number(removalTotal.toFixed(2)),
            total: Number(total.toFixed(2))
        };
    };

    return { calculateQuote };
};