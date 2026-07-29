# CONTEXTO DEL PROYECTO — Cusco Limpio

> Documento de contexto para retomar el desarrollo. Resume qué es el proyecto,
> cómo está construido, qué está hecho y qué falta.

---

## 1. Qué es

**Cusco Limpio** es un sistema inteligente de gestión de recolección de residuos
sólidos segregados para la ciudad del Cusco. Proyecto semestral del curso
Ingeniería de Software I (UNSAAC). Metodología Scrum.

Objetivo: optimizar la recolección, mejorar la comunicación con los ciudadanos
(alertas cuando el camión está cerca) y dar información a la municipalidad.

---

## 2. Stack tecnológico

**Backend:** NestJS 11 + TypeScript + TypeORM 1.0 + PostgreSQL 17
- Socket.io (tiempo real), BullMQ (colas), Redis/Memurai
- Passport JWT (autenticación), bcrypt (hash de contraseñas)
- Twilio (WhatsApp)

**Frontend:** React 19 + Vite 8 + Tailwind CSS v4
- react-leaflet + leaflet (mapas), recharts (gráficos)
- socket.io-client, axios, react-router-dom

**Infraestructura local (Windows):**
- PostgreSQL 17 nativo (base: `cusco_limpio`, usuario `postgres`)
- Memurai (Redis para Windows) en puerto 6379
- Node.js 24 LTS

**Estructura de carpetas:**
```
E:\Proyectos\Cusco-Limpio\
├── backend/    (NestJS)
└── frontend/   (React + Vite)
```

---

## 3. Roles del sistema

- **ciudadano**: se registra, marca su vivienda en el mapa, consulta horarios,
  recibe alertas de WhatsApp.
- **administrador**: panel de operaciones (zonas, vehículos, rutas, horarios,
  programaciones), monitoreo GPS.
- **conductor**: (en desarrollo) registrará inicio/fin de recojo.

---

## 4. Arquitectura backend (módulos)

```
backend/src/
├── auth/           → login, registro, JWT, guards de roles (@Roles, @GetUser)
│   ├── guards/     → jwt-auth.guard.ts, roles.guard.ts
│   └── decorators/ → roles.decorator.ts, get-user.decorator.ts
├── usuarios/       → entidades Usuario (enum Rol), Ciudadano, Conductor, Administrador
├── operaciones/    → módulo grande de gestión municipal
│   ├── entities/   → Zona, Vehiculo (enum EstadoVehiculo), Ruta, Horario,
│   │                 Programacion, Ayudante
│   ├── vehiculos/  → CRUD completo + asignar a programación
│   ├── rutas/      → CRUD completo
│   ├── horarios/   → CRUD + búsqueda por zona + findAll
│   └── dto/        → DTOs de crear/actualizar cada recurso
├── rastreo/        → tiempo real + proximidad
│   ├── rastreo.gateway.ts   → WebSocket (emite/recibe posiciones)
│   ├── simulador.service.ts → camión simulado (recorre Cusco cada 2s)
│   ├── rastreo.service.ts   → cálculo Haversine + anti-duplicados
│   ├── rastreo.types.ts     → interface PosicionCamion
│   └── utils/distancia.ts   → fórmula Haversine
└── notificaciones/ → envío WhatsApp asíncrono
    ├── entities/notificacion.entity.ts → auditoría (enum EstadoNotificacion)
    ├── twilio.service.ts       → cliente Twilio (usa require('twilio'))
    ├── notificaciones.service.ts → registra en BD + encola en BullMQ
    └── notificaciones.processor.ts → worker que envía + reintentos
```

**Nota técnica importante:** `twilio.service.ts` usa `const twilio = require('twilio')`
(NO import), porque el import ESM falla con esta versión. Las credenciales se leen
con `.trim()` para evitar espacios del .env. Si están vacías → modo simulado.

---

## 5. Arquitectura frontend (páginas principales)

```
frontend/src/
├── pages/
│   ├── Landing.tsx            → página inicial pública (con imagen de fondo)
│   ├── Login.tsx             → login con selector de rol
│   ├── Register.tsx          → registro ciudadano + mapa Leaflet
│   ├── ActivarNotificaciones.tsx → opt-in de WhatsApp post-registro
│   ├── Dashboard.tsx         → dashboard genérico (ciudadano)
│   ├── HorariosPublicos.tsx  → consulta pública de horarios
│   ├── AdminDashboard.tsx    → resumen admin
│   ├── AdminOperaciones.tsx  → contenedor con tabs (turnos, vehículos, zonas)
│   ├── AsignarVehiculo.tsx   → gestión de flota (CRUD + asignar) UNIFICADO
│   ├── AsignarZona.tsx       → zonas + CRUD de rutas UNIFICADO
│   └── AsignarHorario.tsx    → programaciones + CRUD de horarios (3 subtabs)
├── features/monitoreo-gps/   → mapa en tiempo real
│   ├── api/socket.ts
│   ├── logica/useRastreo.ts
│   ├── componentes/MapaCamiones.tsx
│   └── PantallaGps.tsx
├── components/               → AdminLayout, Sidebar
├── context/AuthContext.tsx   → sesión (token + usuario en localStorage)
└── services/
    ├── auth.service.ts       → login, register, getMe
    └── operaciones.service.ts → todos los endpoints de operaciones
```

**Estilo visual:** Tailwind, colores emerald (verde) + slate (grises).
Tarjetas con `rounded-lg border border-slate-200`. Modales con
`fixed inset-0 bg-black/40`. Badges de estado con colores por estado.

---

## 6. Historias de usuario — ESTADO

### COMPLETADAS ✅

- **HU-01 Login con roles**: JWT, guards, redirección por rol. ✅
- **HU-02 Registro + ubicar vivienda**: formulario + mapa Leaflet, guarda
  lat/long del ciudadano. ✅
- **HU-03 Notificación WhatsApp por proximidad (500m)**: COMPLETA. GPS en tiempo
  real (WebSocket) + Haversine + anti-duplicados por recorrido + cola BullMQ +
  Twilio + auditoría en tabla notificaciones + reintentos. Incluye opt-in de
  WhatsApp (pantalla ActivarNotificaciones). ✅
- **HU-05 Consultar horarios**: página pública HorariosPublicos. ✅
- **HU-08/09 Gestión municipal**: panel admin con zonas, vehículos, rutas,
  horarios, programaciones. ✅
- **HU-11 Crear/editar/eliminar horarios, camiones y rutas**: CRUD completo en
  los 3 recursos, integrado en sus pestañas (vehículos, rutas, horarios), con
  modales de formulario y confirmación de borrado. Valida placa duplicada y no
  permite borrar vehículo con programación activa. ✅

### PENDIENTES

- **HU-06 Reportar puntos críticos (foto + ubicación)**: el ciudadano sube foto
  y ubicación de un punto de acumulación de basura. Requiere manejo de archivos
  (multer). NO iniciada.
- **HU-07 Registrar conclusión del recojo**: EN CURSO. El conductor marca inicio
  y fin de ruta, el sistema calcula el tiempo. Se registra sobre la PROGRAMACIÓN
  (que ya une turno+conductor+vehículo+zona). Paso previo necesario: acceso de
  conductor en el login + panel del conductor (ver guía
  Previo_HU07_Panel_Conductor.md).
- **HU-08 Reportes y gráficos**: volúmenes por zona, cumplimiento de rutas, con
  Recharts. Depende de tener datos de recojos (HU-07). NO iniciada.
- **HU-10 Guías de reciclaje**: contenido público sobre cómo clasificar residuos,
  con CRUD para el admin. NO iniciada. La más simple.

---

## 7. Testing (Laboratorios)

- **Lab 10 (pruebas unitarias + TDD)**: hecho. 19 pruebas con Jest.
  - `backend/src/auth/auth.service.spec.ts` → 13 pruebas (login, registro)
  - `backend/src/rastreo/utils/distancia.spec.ts` → 6 pruebas (Haversine)
  - Ejecutar: `cd backend && npm test`
- **Lab 11 (CI con GitHub Actions)**: hecho. Workflow en `.github/workflows/ci.yml`
  (push a main) + `ci-pull-request.yml`. Usa Node 24 y `working-directory: backend`.

**Nota:** al correr tests, NO deben existir archivos `.js` compilados en `src/`
(confunden a Jest). Si aparecen, borrarlos. Ya están en `.gitignore` como `src/**/*.js`.

---

## 8. Cómo levantar el proyecto

```powershell
# Prerequisito: Memurai corriendo (memurai-cli ping → PONG)

# Backend
cd backend
npm install
npm run start:dev   # corre en http://localhost:3000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev         # corre en http://localhost:5173 o cusco.limpio:5173
```

Variables en `backend/.env`: DB_*, REDIS_HOST/PORT, JWT_SECRET, TWILIO_* (vacías = modo simulado).

---

## 9. Próximo paso inmediato

Implementar **HU-07**. Orden:
1. Paso previo: acceso de conductor en login + panel base (ConductorDashboard.tsx).
2. Backend: entidad para el recojo (inicio, fin, tiempo transcurrido, estado),
   asociada a la Programacion. Endpoints: iniciar, finalizar, listar/promedio.
3. Frontend conductor: ver rutas asignadas (vía programación) + botones
   iniciar/finalizar con cronómetro.
4. Frontend admin: ver tiempos y promedio por ruta.

Criterios de aceptación HU-07:
- El recolector marca inicio y fin de ruta.
- El sistema registra hora de inicio y fin automáticamente.
- Calcula el tiempo transcurrido.
- El registro queda asociado a ruta, vehículo y conductor.
- El admin consulta el promedio de tiempo de las rutas completadas.
```
