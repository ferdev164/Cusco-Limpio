CREATE TABLE IF NOT EXISTS zonas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS horarios (
  id SERIAL PRIMARY KEY,
  zona_id INTEGER NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
  turno TEXT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  dias TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conductores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  licencia TEXT,
  turno TEXT
);

CREATE TABLE IF NOT EXISTS ayudantes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id SERIAL PRIMARY KEY,
  placa TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  capacidad TEXT,
  km INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'disponible',
  conductor_id INTEGER REFERENCES conductores(id),
  zona_id INTEGER REFERENCES zonas(id)
);

CREATE TABLE IF NOT EXISTS programaciones (
  id SERIAL PRIMARY KEY,
  horario_id INTEGER NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
  conductor_id INTEGER REFERENCES conductores(id),
  vehiculo_id INTEGER REFERENCES vehiculos(id),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programacion_ayudantes (
  programacion_id INTEGER NOT NULL REFERENCES programaciones(id) ON DELETE CASCADE,
  ayudante_id INTEGER NOT NULL REFERENCES ayudantes(id),
  PRIMARY KEY (programacion_id, ayudante_id)
);

CREATE TABLE IF NOT EXISTS rutas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  zona_id INTEGER REFERENCES zonas(id),
  descripcion TEXT,
  distancia_km NUMERIC(6,2),
  tiempo_estimado_min INTEGER
);
