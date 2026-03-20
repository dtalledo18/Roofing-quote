// lib/google-solar.ts

interface LatLng {
    lat: number;
    lng: number;
}

// Estructura REAL de la Solar API (verificada con logs)
interface RoofSegment {
    center?: { latitude?: number; longitude?: number };
    azimuthDegrees?: number;
    pitchDegrees?: number;
    stats?: {
        areaMeters2?: number;
        groundAreaMeters2?: number;
    };
    boundingBox?: {
        sw?: { latitude?: number; longitude?: number };
        ne?: { latitude?: number; longitude?: number };
    };
}

function isValidCoord(c: LatLng): boolean {
    return isFinite(c.lat) && isFinite(c.lng);
}

// Extrae los 4 vértices del boundingBox REAL de cada segmento.
// Esto es más preciso que reconstruir matemáticamente, porque
// son las coordenadas reales que devuelve la Solar API.
function segmentBBoxToVertices(segment: RoofSegment): LatLng[] {
    const sw = segment.boundingBox?.sw;
    const ne = segment.boundingBox?.ne;

    if (
        !sw || !ne ||
        sw.latitude === undefined || sw.longitude === undefined ||
        ne.latitude === undefined || ne.longitude === undefined ||
        !isFinite(sw.latitude) || !isFinite(sw.longitude) ||
        !isFinite(ne.latitude) || !isFinite(ne.longitude)
    ) {
        return [];
    }

    return [
        { lat: ne.latitude, lng: ne.longitude }, // NE
        { lat: ne.latitude, lng: sw.longitude }, // NW
        { lat: sw.latitude, lng: sw.longitude }, // SW
        { lat: sw.latitude, lng: ne.longitude }, // SE
    ];
}

// Convex Hull — Graham Scan
// Une todos los vértices de todos los segmentos en el contorno exterior.
function convexHull(points: LatLng[]): LatLng[] {
    const valid = points.filter(isValidCoord);
    if (valid.length < 3) return valid;

    const pts = valid.map(p => ({ x: p.lng, y: p.lat }));
    pts.sort((a, b) => a.y - b.y || a.x - b.x);
    const pivot = pts[0];

    const sorted = pts.slice(1).sort((a, b) => {
        const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
        const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
        return angleA - angleB;
    });

    const cross = (O: typeof pivot, A: typeof pivot, B: typeof pivot) =>
        (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

    const hull = [pivot];
    for (const pt of sorted) {
        while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], pt) <= 0) {
            hull.pop();
        }
        hull.push(pt);
    }

    return hull.map(p => ({ lat: p.y, lng: p.x }));
}

export const getRoofData = async (lat: number, lng: number) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&required_quality=HIGH&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Solar API error: ${res.status}`);

    const data = await res.json();

    const segments: RoofSegment[] = data.solarPotential?.roofSegmentStats ?? [];

    // ── Área total ────────────────────────────────────────────────────────────
    const areaM2: number = data.solarPotential?.wholeRoofStats?.areaMeters2 ?? 0;
    const areaSqFt = Math.round(areaM2 * 10.7639);

    // ── Pitch del segmento con mayor área ────────────────────────────────────
    const dominantSegment = segments.reduce<RoofSegment | null>((best, seg) => {
        const area = seg.stats?.areaMeters2 ?? 0;
        const bestArea = best?.stats?.areaMeters2 ?? 0;
        return area > bestArea ? seg : best;
    }, null);
    const pitchDegrees: number = dominantSegment?.pitchDegrees ?? 15;

    // ── Polígono complejo desde boundingBoxes reales ──────────────────────────
    let coords: LatLng[] = [];

    if (segments.length > 0) {
        // Usar los boundingBox reales de cada segmento — son coordenadas exactas de la API
        const allVertices = segments.flatMap(segmentBBoxToVertices);
        console.log(`🔍 ${allVertices.length} vértices de ${segments.length} segmentos`);

        coords = convexHull(allVertices);
        console.log(`🔍 Hull final: ${coords.length} puntos`);
    }

    // ── Fallback: boundingBox global ─────────────────────────────────────────
    if (coords.length < 3 && data.boundingBox) {
        const box = data.boundingBox;
        coords = [
            { lat: box.ne.latitude, lng: box.ne.longitude },
            { lat: box.ne.latitude, lng: box.sw.longitude },
            { lat: box.sw.latitude, lng: box.sw.longitude },
            { lat: box.sw.latitude, lng: box.ne.longitude },
        ].filter(isValidCoord);
    }

    return { areaSqFt, pitchDegrees, coords };
};