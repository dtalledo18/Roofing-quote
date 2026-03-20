export const getRoofData = async (lat: number, lng: number) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Solar data not available");

    const data = await res.json();

    // 1. Datos base
    const areaM2 = data.solarPotential.wholeRoofStats.areaMeters2;
    const areaSqFt = Math.round(areaM2 * 10.764);
    const pitchDegrees = data.solarPotential.roofSegmentStats[0].pitchDegrees;

    // 2. Lógica de Polígono Flexible
    let vertices = [];

    // Intento A: Usar el footprint real (Vértices detallados)
    if (data.footprint && data.footprint.vertices) {
        vertices = data.footprint.vertices.map((v: any) => ({
            lat: v.latitude,
            lng: v.longitude
        }));
    }
    // Intento B: Si no hay vertices, usar la boundingBox (Caja delimitadora)
    else if (data.boundingBox) {
        const box = data.boundingBox;
        vertices = [
            { lat: box.ne.latitude, lng: box.ne.longitude },
            { lat: box.ne.latitude, lng: box.sw.longitude },
            { lat: box.sw.latitude, lng: box.sw.longitude },
            { lat: box.sw.latitude, lng: box.ne.longitude },
        ];
    }

    return { areaSqFt, pitchDegrees, coords: vertices };
};