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

## Documentación de los sprints

| Documento | Sprint | Contenido |
|---|---|---|
| [Sprint 1 — Comprender y diseñar](./docs/BQ360-Sprint-1.md) | Póster y diagnóstico | Problema, actores, cinco dimensiones, arquitectura inicial y plan de validación. |
| [Sprint 2 — Diseñar y construir](./docs/BQ360-Sprint-2.md) | Programa y prototipo | Componentes, motor, interfaces, escenario, backlog y distribución del equipo. |
| [Plan MVP Barranquilla (5 personas)](./docs/BQ360-Plan-MVP-Barranquilla.md) | Ejecución Sprint 2–3 | División de carpetas, ramas y tareas para 5 integrantes sobre `BQ360/` (Next.js offline). |
| [Sprint 3 — Validar y consolidar](./docs/BQ360-Sprint-3.md) | Solución completa | Aplicación móvil, mapa, módulos demo, pruebas, presentación y legado. |
| [Datos de demostración](./docs/BQ360_Datos_Demo.md) | Soporte | Perfil, lugares, agenda, comunidades y alertas ficticias. |
