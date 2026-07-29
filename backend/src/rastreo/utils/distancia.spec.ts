// ============================================================
// ARCHIVO: backend/src/rastreo/utils/distancia.spec.ts
// Pruebas unitarias de la función Haversine
// Esta es la prueba más limpia para demostrar TDD:
// la función es matemática pura, sin BD ni dependencias.
// ============================================================

import { distanciaMetros } from './distancia';

describe('distanciaMetros() — Fórmula Haversine', () => {

  // ── PRUEBA 1: misma ubicación ─────────────────────────────
  it('PASSED: debería retornar 0 si los dos puntos son idénticos', () => {
    const dist = distanciaMetros(-13.5319, -71.9675, -13.5319, -71.9675);
    expect(dist).toBe(0);
  });

  // ── PRUEBA 2: distancia conocida ──────────────────────────
  it('PASSED: debería calcular correctamente ~111 km por 1 grado de latitud', () => {
    // 1 grado de latitud ≈ 111,195 metros en cualquier punto de la Tierra
    const dist = distanciaMetros(0, 0, 1, 0);
    expect(dist).toBeCloseTo(111195, -2); // tolerancia de ±100m
  });

  // ── PRUEBA 3: dentro del radio (caso crítico del sistema) ─
  it('PASSED: debería detectar que el camión está a ≤ 500 metros', () => {
    // Plaza de Armas de Cusco
    const camionLat = -13.5319;
    const camionLng = -71.9675;
    // Vivienda a ~200 metros al norte
    const casaLat = -13.5301;
    const casaLng = -71.9675;

    const dist = distanciaMetros(camionLat, camionLng, casaLat, casaLng);

    expect(dist).toBeLessThanOrEqual(500);
    expect(dist).toBeGreaterThan(0);
  });

  // ── PRUEBA 4: fuera del radio ─────────────────────────────
  it('PASSED: debería detectar que el camión está a > 500 metros', () => {
    // Plaza de Armas de Cusco
    const camionLat = -13.5319;
    const camionLng = -71.9675;
    // Aeropuerto de Cusco (~5 km de distancia)
    const aeropuertoLat = -13.5357;
    const aeropuertoLng = -71.9387;

    const dist = distanciaMetros(camionLat, camionLng, aeropuertoLat, aeropuertoLng);

    expect(dist).toBeGreaterThan(500);
  });

  // ── PRUEBA 5: simetría (A→B = B→A) ───────────────────────
  it('PASSED: debería ser simétrica (distancia A→B igual a B→A)', () => {
    const lat1 = -13.5319, lng1 = -71.9675;
    const lat2 = -13.528,  lng2 = -71.971;

    const distAB = distanciaMetros(lat1, lng1, lat2, lng2);
    const distBA = distanciaMetros(lat2, lng2, lat1, lng1);

    expect(distAB).toBeCloseTo(distBA, 5);
  });

  // ── PRUEBA 6: caso real del sistema ───────────────────────
  it('PASSED: debe retornar un número positivo para dos coordenadas distintas de Cusco', () => {
    // Mercado de San Pedro → Plaza de Armas
    const dist = distanciaMetros(-13.5237, -71.9724, -13.5319, -71.9675);

    expect(typeof dist).toBe('number');
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(5000); // menos de 5km (son puntos del centro de Cusco)
  });

});