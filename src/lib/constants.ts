export const CHICAGO_ROOFING_PRICES = {
    SQUARE_FOOT_UNIT: 100, // 1 Square = 100 sqft
    MATERIALS: {
        asphalt_shingle: 180,
        metal: 550,
        flat_tpo: 320,
        slate: 900,
    },
    LABOR_PER_SQUARE: 250,
    PITCH_MULTIPLIER: {
        flat: 1.0,
        low: 1.1,
        medium: 1.25,
        steep: 1.5, // Chicago steep roofs require extra safety gear
    },
    REMOVAL_PER_LAYER_SQ: 60,
};