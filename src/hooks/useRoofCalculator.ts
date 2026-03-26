// hooks/useRoofCalculator.ts
import { CHICAGO_ROOFING_PRICES } from '@/lib/constants';
import { RoofingQuoteRequest, QuoteBreakdown } from '@/types/roofing';

export const useRoofCalculator = () => {

    const calculateQuote = (data: RoofingQuoteRequest): QuoteBreakdown => {
        const { squareFeet, material, pitch, layersToRemove } = data;

        // Convertimos pies cuadrados a "Squares" (unidades de 100 sqft)
        const squares = squareFeet / CHICAGO_ROOFING_PRICES.SQUARE_FOOT_UNIT;

        // 1. Costo de Materiales
        const materialBase = CHICAGO_ROOFING_PRICES.MATERIALS[material] * squares;

        // 2. Mano de Obra — precio directo por rango de pitch (fuente: Peter 2026)
        //    Ya NO se usa multiplicador; el precio por sq varía según inclinación real.
        const laborRatePerSquare = CHICAGO_ROOFING_PRICES.LABOR_BY_PITCH[pitch];
        const laborTotal = laborRatePerSquare * squares;

        // 3. Remoción de capas — $30/sq por capa sin importar el pitch (fuente: Peter Mar 2026)
        const removalTotal = CHICAGO_ROOFING_PRICES.REMOVAL_PER_LAYER_SQ * layersToRemove * squares;

        // 4. Total Final
        const total = materialBase + laborTotal + removalTotal;

        return {
            materialCost: Number(materialBase.toFixed(2)),
            laborCost:    Number(laborTotal.toFixed(2)),
            removalCost:  Number(removalTotal.toFixed(2)),
            total:        Number(total.toFixed(2)),
        };
    };

    return { calculateQuote };
};