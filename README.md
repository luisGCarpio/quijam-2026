# BQ360 — Barranquilla 2034 (QUIJAM 2026)

<p align="center">
  <img src="./docs/BQ360-logo.jpeg" alt="Logo BQ360" width="240" />
</p>

**BQ360** es un programa estratégico de inteligencia territorial para Barranquilla 2034 que combina gobernanza urbana con un mapa Ciudad-Estadio de balanceo dinámico por aforo, acceso inclusivo y tótems físicos con QR/Wi-Fi. El MVP utiliza datos demo locales para probar el recorrido completo sin una base de datos externa.

## Cómo ejecutar la aplicación

### Requisitos

- Windows 10 u 11
- Node.js LTS
- npm

La instalación actual usa Node.js 26 LTS y npm 11. Comprueba las versiones:

```powershell
& "C:\Program Files\nodejs\node.exe" --version
& "C:\Program Files\nodejs\npm.cmd" --version
```

### Primera ejecución

Desde PowerShell:

```powershell
cd C:\Users\USUARIO\OneDrive\Desktop\brandonquijam\quijam-2026\BQ360
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Abre la aplicación móvil en:

- Local: http://localhost:3000
- Red local: usa la dirección mostrada por Next.js, normalmente `http://10.50.251.20:3000`

### Construir para producción

```powershell
cd C:\Users\USUARIO\OneDrive\Desktop\brandonquijam\quijam-2026\BQ360
& "C:\Program Files\nodejs\npm.cmd" run build
& "C:\Program Files\nodejs\npm.cmd" run start
```

### Datos demo

El prototipo no requiere Supabase durante el desarrollo. Los ejemplos están registrados en:

- `docs/BQ360_Datos_Demo.md`
- `BQ360/lib/demo-data.ts`

Incluyen perfil ciudadano, agenda, comunidades, alertas y lugares de ejemplo. Los indicadores son simulados.

### Estructura principal

```text
BQ360/
  app/              Pantallas Next.js
  components/       Componentes reutilizables
  lib/demo-data.ts  Datos locales de demostración
docs/               Programa, investigación y datos demo
```

## Funcionalidad del prototipo

- Inicio móvil con navegación inferior.
- Mapa embebido de Google Maps sin clave para la vista demostrativa.
- Filtros de movilidad, cultura, comercio y accesibilidad.
- Estado urbano y recomendaciones simuladas.
- Agenda de eventos y comunidades demo.
- Perfil ciudadano y notificaciones.
- Diseño inspirado en Barranquilla con azul, amarillo, verde, rojo y líneas animadas.

Google Maps embebido permite mostrar lugares y rutas básicas. Para geolocalización avanzada, marcadores personalizados y rutas calculadas por API se necesitará una clave de Google Maps JavaScript API.

## Documentación (`docs/`)

* [Programa integral y requisitos QUIJAM (`BQ360_Barranquilla_2034.md`)](./docs/BQ360_Barranquilla_2034.md) — Programa BQ360 en 5 dimensiones (`BQ Territory`, `BQ Green`, `BQ Intelligence`, `BQ Community`, `BQ Economy`), `BQ Nodes`, hoja de ruta 2026–2035+, sprints oficiales y entregables Demo Day.
* [Dossier de investigación Sprint 1 (`BQ360_Sprint1_Dossier.md`)](./docs/BQ360_Sprint1_Dossier.md) — Diagnóstico con cifras oficiales verificadas, cinco dimensiones, arquitectura inicial, datos disponibles vs. simulados y plan de validación en campo.
* [Cierre Sprint 1 (`Sprint 1 - BQ360.md`)](./docs/Sprint%201%20-%20BQ360.md) — Estructura de 6 bloques para el entregable/póster y checklist operativo del Sprint 1.
* [Documento maestro (`BQ360.md`)](./docs/BQ360.md) — Contexto territorial, rúbrica QUIJAM, visión de módulos, caso demostrativo y registro de decisiones.
* [Propuesta base (`Propuesta Barranquilla 2034 - BQ360.md`)](./docs/Propuesta%20Barranquilla%202034%20-%20BQ360.md) — Identificación del problema, población multi-actor, objetivos, solución 3D, propuesta de valor y pitch.
* [Notas iniciales (`Barranquilla 2034 sede mundial..md`)](./docs/Barranquilla%202034%20sede%20mundial..md) — Lluvia de ideas original del equipo.
