BEGIN;

INSERT INTO zonas (nombre)
SELECT v.nombre
FROM (VALUES
  ('San Blas'),
  ('Centro Historico'),
  ('San Cristobal'),
  ('Ccari Grande'),
  ('Los Incas'),
  ('Magisterio'),
  ('Zaguan del Cielo'),
  ('San Pedro'),
  ('Santa Ana')
) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM zonas z WHERE z.nombre = v.nombre);

INSERT INTO horarios (zona_id, turno, hora_inicio, hora_fin, dias)
SELECT z.id, h.turno, h.hora_inicio, h.hora_fin, h.dias
FROM (VALUES
  ('San Blas', 'Manana', TIME '06:00', TIME '07:00', 'Todos los dias'),
  ('San Blas', 'Noche', TIME '20:00', TIME '21:00', 'Todos los dias'),
  ('Centro Historico', 'Madrugada', TIME '05:00', TIME '06:00', 'Todos los dias'),
  ('Centro Historico', 'Noche', TIME '22:00', TIME '23:00', 'Todos los dias'),
  ('San Cristobal', 'Manana', TIME '06:30', TIME '07:15', 'Lun, Dom'),
  ('Ccari Grande', 'Tarde', TIME '14:30', TIME '15:00', 'Mar, Jue, Sab'),
  ('Los Incas', 'Tarde', TIME '15:00', TIME '16:00', 'Mar, Jue, Sab'),
  ('Magisterio', 'Tarde', TIME '15:40', TIME '17:00', 'Mar, Jue, Sab'),
  ('Zaguan del Cielo', 'Manana', TIME '07:15', TIME '08:00', 'Mar, Jue, Sab'),
  ('San Pedro', 'Tarde', TIME '15:00', TIME '17:00', 'Todos los dias'),
  ('Santa Ana', 'Tarde', TIME '12:10', TIME '16:00', 'Lun, Mie, Vie')
) AS h(zona, turno, hora_inicio, hora_fin, dias)
JOIN zonas z ON z.nombre = h.zona
WHERE NOT EXISTS (
  SELECT 1
  FROM horarios hx
  WHERE hx.zona_id = z.id
    AND hx.turno = h.turno
    AND hx.hora_inicio = h.hora_inicio
    AND hx.hora_fin = h.hora_fin
);

INSERT INTO conductores (nombre, disponible, activo)
SELECT v.nombre, v.disponible, TRUE
FROM (VALUES
  ('Maria Garcia', TRUE),
  ('Carlos Mendoza', TRUE),
  ('Juan Lopez', FALSE),
  ('Ana Quispe', TRUE)
) AS v(nombre, disponible)
WHERE NOT EXISTS (SELECT 1 FROM conductores c WHERE c.nombre = v.nombre);

INSERT INTO ayudantes (nombre, disponible, activo)
SELECT v.nombre, v.disponible, TRUE
FROM (VALUES
  ('Rosa Huaman', TRUE),
  ('Luis Flores', TRUE),
  ('Diego Quispe', TRUE),
  ('Sofia Ramos', FALSE)
) AS v(nombre, disponible)
WHERE NOT EXISTS (SELECT 1 FROM ayudantes a WHERE a.nombre = v.nombre);

INSERT INTO vehiculos (placa, tipo, capacidad, km, estado, conductor_id, zona_id)
SELECT v.placa, v.tipo, v.capacidad, v.km, v.estado,
  (SELECT id FROM conductores WHERE nombre = v.conductor),
  (SELECT id FROM zonas WHERE nombre = v.zona)
FROM (VALUES
  ('GBC-153', 'Compactador', '12 ton', 45230, 'disponible', NULL, NULL),
  ('DEF-456', 'Compactador', '12 ton', 52430, 'en_ruta', NULL, NULL),
  ('DEF-476', 'Reciclador',  '8 ton',  78900, 'mantenimiento', NULL, NULL),
  ('JKL-012', 'Compactador', '12 ton', 32100, 'disponible', NULL, NULL),
  ('DEF-486', 'Reciclador',  '8 ton',  78900, 'fuera_servicio', NULL, NULL),
  ('FBC-113', 'Compactador', '12 ton', 45230, 'disponible', NULL, NULL),
  ('JKL-042', 'Compactador', '12 ton', 32100, 'disponible', NULL, NULL)
) AS v(placa, tipo, capacidad, km, estado, conductor, zona)
WHERE NOT EXISTS (SELECT 1 FROM vehiculos x WHERE x.placa = v.placa);

INSERT INTO rutas (nombre, zona_id, descripcion, distancia_km, tiempo_estimado_min)
SELECT r.nombre, z.id, r.descripcion, r.distancia, r.tiempo
FROM (VALUES
  ('Ruta San Blas', 'San Blas', 'Circuito principal', 5.2, 35),
  ('Ruta Centro Historico', 'Centro Historico', 'Centro urbano', 6.8, 45),
  ('Ruta San Pedro', 'San Pedro', 'Mercado y alrededores', 5.0, 40)
) AS r(nombre, zona, descripcion, distancia, tiempo)
JOIN zonas z ON z.nombre = r.zona
WHERE NOT EXISTS (SELECT 1 FROM rutas x WHERE x.nombre = r.nombre);

COMMIT;
