// lib/constants.ts
// Precios actualizados 2026 — fuente: Peter (adv.roofs@yahoo.com), Feb–Mar 2026

export const CHICAGO_ROOFING_PRICES = {
    SQUARE_FOOT_UNIT: 100, // 1 Square = 100 sqft

    MATERIALS: {
        asphalt_shingle: 180,   // pendiente confirmación
        metal: 550,             // pendiente confirmación
        flat_tpo: 1250,         // ✅ Peter Mar 2026: $1,250/sq incl. 5'2" insulation
        slate: 900,             // pendiente confirmación
    },

    // ✅ Fuente: Peter Feb 2026 — precios directos por rango de pitch ($/sq)
    // Mapeo de pitch del form → rango real:
    //   flat     → no aplica labor de pitch (TPO se cotiza aparte)
    //   shallow  → 4/12–6/12
    //   medium   → 6/12–8/12  (usamos el punto medio del rango 6/12–8/12)
    //   steep    → 9/12–10/12 (Chicago: requiere equipo de seguridad extra)
    //   mansard  → $550/sq (reservado para futuro si se agrega al form)
    LABOR_BY_PITCH: {
        flat:    425,   // TPO se maneja aparte; usamos base shingle como fallback
        shallow: 425,   // 4/12–6/12
        medium:  450,   // 6/12–8/12
        steep:   470,   // 9/12–10/12  (12/12 = $500, mansard = $550 — no en form aún)
    },

    // ✅ Fuente: Peter Mar 2026 — $30/sq por capa, independiente del pitch
    // Anterior: $60/sq (era estimado interno, corregido)
    REMOVAL_PER_LAYER_SQ: 30,
};