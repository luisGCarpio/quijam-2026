# Plan del Dev 5 para la pestaña Asistencia

**Propuesta para revisión antes de implementar.** En BQ360, una persona que abre Asistencia debe poder encontrar ayuda con un toque. Quien viene a consultar un precio o a activar una preferencia debe reconocer ambos destinos sin recorrer una lista de establecimientos. La misma distribución sirve para visitantes del Mundial y residentes en modo Legado.

## Primera vista y recorrido

Esquema de lectura para móvil, con la pestaña recién abierta y el directorio plegado. La línea del origen ilustra el caso de ubicación predeterminada.

```text
[Barra superior compartida de BQ360]

Asistencia
Cerca de Plaza de la Paz

[✚  Salud más cercana                 ›]
[◇  Seguridad más cercana             ›]
[   Ver directorio y teléfonos        ⌄]

Conversor de moneda     Centro de Inclusión
       ↓                        ↓
[Contenido de la sección elegida]

[Mapa     Eventos     Explorar     Asistencia ●]
```

«Conversor de moneda» y «Centro de Inclusión» son enlaces internos. La pantalla tiene una sola columna y un solo desplazamiento vertical. Debajo de los enlaces aparecen, en orden, el conversor y el panel de inclusión. Cada enlace desplaza al título correspondiente y le lleva el foco. La navegación inferior permanece disponible y se reserva espacio al final para que el último control quede a la vista.

1. **Persona que necesita ayuda.** Ve el origen y dos botones de igual tamaño, apilados y con texto completo. Al tocar «Salud más cercana» o «Seguridad más cercana», pasa directamente a Mapa con el establecimiento seleccionado. El mapa muestra el nombre y el recorrido desde el origen indicado.
2. **Persona que prefiere llamar o elegir un sitio.** Abre «Ver directorio y teléfonos» en la misma pantalla. Primero encuentra las líneas generales verificadas, luego los lugares agrupados por Salud y Seguridad y ordenados por distancia dentro de cada grupo. Cada ficha muestra nombre, dirección y distancia aproximada, con «Cómo llegar» y, si hay teléfono verificado, «Llamar». Este último abre el marcador.
3. **Visitante que quiere entender un precio.** Toca «Conversor de moneda», escribe el importe y lee el resultado junto al campo. «Invertir» cambia el sentido. Inmediatamente debajo puede comparar el precio con cinco referencias locales.
4. **Persona que necesita adaptar la app.** Toca «Centro de Inclusión», activa una preferencia y percibe su estado de inmediato. Puede activar Ruta accesible antes de elegir destino. El acceso rápido de inclusión de la barra superior sigue bajo responsabilidad de Dev 1.

## Tipografía, color y distribución

**Geist Sans** ya está disponible en el proyecto. Usar la misma familia para títulos, botones, distancias e importes mantiene la continuidad al pasar de Asistencia al mapa. Propuesta de escala con base de 16 px y tamaños relativos al implementar:

| Elemento | Tamaño base / interlineado | Peso |
| --- | --- | --- |
| Título «Asistencia» | 28 / 34 px | 700 |
| Títulos de sección y resultado monetario | 20 / 26 px | 600 |
| Acciones principales | 16 / 24 px | 600 |
| Texto, campos y preferencias | 16 / 24 px | 400 |
| Origen, distancia, fecha y fuente | 14 / 20 px | 400 |

Para importes y distancias, usar cifras tabulares y mantener visibles las unidades. Con Texto grande, dejar crecer filas y etiquetas en altura. Alinear los importes de la tabla a la derecha para facilitar la comparación.

La paleta propuesta usa los cinco colores que BQ360 documenta como inspirados en **Barranquilla y QUIJAM**. El fondo blanco y los espacios entre secciones dejan el protagonismo a las acciones.

| Color del proyecto | Uso en Asistencia |
| --- | --- |
| Azul marino `#0B2545` | Títulos, texto principal y botón de Seguridad con texto blanco. |
| Verde `#15803D` | Botón de Salud con texto blanco. La cruz y la etiqueta identifican su función. |
| Amarillo `#FACC15` | Fondo del resultado monetario con importe en azul marino. |
| Celeste `#38BDF8` | Acento del Centro de Inclusión y fondo para indicadores con texto marino. |
| Rojo `#DC2626` | Icono y borde de aviso cuando falla una acción, con explicación escrita junto al campo o botón. |

**Espaciado propuesto.** Mantener el marco móvil de hasta 440 px previsto por Dev 1. Usar 16 px de margen lateral, 8 px entre controles relacionados y 24 px entre secciones. Botones principales de al menos 48 px de alto, filas del directorio separadas por líneas y una preferencia por fila. Permitir que los dos enlaces internos se apilen si crece el texto. En alto contraste, usar los colores del tema global para fondos, texto, bordes y foco, conservando iconos, etiquetas y estado de cada control.

## Implementación por bloque

### Salud y Seguridad

- Publicar `ASSISTANCE_POIS` conforme al tipo compartido `Poi`. Registrar ID estable, capa, nombre y descripción en ES/EN/PT/FR, dirección, coordenadas y, cuando estén verificados, teléfono y condiciones de acceso.
- Partir de los hospitales, clínicas, CAI y Policía de Turismo propuestos por el equipo. Verificar con el organismo responsable dirección, coordenadas y teléfono antes de habilitar llamadas. Identificar los puestos temporales de primeros auxilios de la demo y mostrarlos solo cuando correspondan al modo activo. Aplicar el mismo filtro al directorio y a la búsqueda del más cercano.
- Filtrar por categoría y elegir con `findNearestPoi(userLocation, candidatos)` usando `haversineKm`. La distancia del directorio se presenta como aproximada en línea recta. Pasar al mapa `navigateToRoute({ lat, lng, label })` con el nombre localizado. Dev 2 calcula el recorrido.
- Si el dispositivo carece de ubicación, usar el origen compartido de Plaza de la Paz. Acordar con Dev 1 cómo identificar el origen efectivo, ya que `userLocation` contiene solo coordenadas. Con una categoría vacía, explicar la falta de puntos y ofrecer las líneas verificadas del directorio.

### Tasa monetaria

- Manejar COP, USD, EUR y BRL. Con una moneda extranjera global, abrir el par entre esa moneda y COP. Si la selección global es COP, proponer USD como contraparte local y permitir cambiarla. El importe y «Invertir» son locales al conversor. La tabla siempre sigue la moneda de la barra.
- Registrar cada tasa en COP por unidad extranjera, junto con fecha y fuente. Multiplicar para pasar a COP y dividir para salir de COP. Redondear al presentar, conservar la firma compartida de `formatCop` y usar `formatPrice` para los precios del directorio de referencias.
- Incluir pasaje de Transmetro, carrera mínima de taxi, botella de agua, almuerzo típico y artesanía local. Guardar los valores base en COP, distinguir tarifas de estimaciones e indicar su fecha de referencia. La demo usa datos locales fechados.
- Tratar cero como importe válido, dejar vacío el resultado si se borra el monto y mostrar un mensaje localizado para entradas inválidas o tasas ausentes. Comprobar decimales con los idiomas admitidos.

### Centro de Inclusión

Cada interruptor lee el estado compartido y llama a `updateAccessibility` con una sola preferencia. Los cambios deben conservarse al navegar entre pestañas.

| Control | Acción del Dev 5 | Comprobación conjunta |
| --- | --- | --- |
| Ruta accesible | Cambiar `accessibleRoute` y describir la preferencia por trayectos sin barreras. | Dev 2 demuestra el recálculo en un corredor con barrera conocida e indica los tramos de accesibilidad desconocida. |
| Alto contraste | Cambiar `highContrast` y aplicar el tema compartido en todos los controles. | Dev 1 y Dev 5 comprueban el contraste del contenido, las etiquetas, el foco y los estados con el objetivo AAA del proyecto. |
| Texto grande | Cambiar `largeText` y permitir que crezcan las filas y los controles. | El texto se amplía en Asistencia y en el shell sin tapar acciones. |
| Audio-alertas | Cambiar `voiceAlerts` y ofrecer «Probar alerta de voz» mediante `pushNotification`. | Con voz activada, Dev 1 reproduce la prueba una vez en el idioma activo. Si la voz no está disponible, mostrar el aviso visual. |

## Archivos y acuerdos con el equipo

Rama prevista tras Fase 0: `feat/dev5-assistance-inclusion`.

| Rutas del Dev 5 | Entrega |
| --- | --- |
| `src/features/assistance/AssistanceTab.tsx` | Montaje de los tres bloques, orden de lectura y enlaces internos. |
| `src/features/assistance/EmergencySection.tsx` | Acciones de cercanía, directorio y llamadas. |
| `src/features/assistance/CurrencyConverter.tsx` | Monto, sentido del cambio, resultado y tabla. |
| `src/features/assistance/InclusionPanel.tsx` | Cuatro preferencias y prueba de voz. |
| `src/lib/geo.ts`, `src/data/assistance-pois.ts` | Distancia, selección por cercanía y servicios georreferenciados. |
| `src/lib/currency.ts`, `src/data/currency-rates.ts` | Conversión, formato, tasas y precios base. |
| `src/i18n/assistance.ts` | Etiquetas, mensajes, estados y nombres accesibles en ES/EN/PT/FR. |

**Dev 1** entrega el contexto, la moneda e idioma globales, el shell, el tema y la voz. **Dev 2** consume los puntos mediante `ALL_POIS` y recibe el destino por el contexto. Acordar con él cobertura de la ruta de respaldo hacia el establecimiento de la demo y visibilidad de puestos temporales en el mapa. **Dev 3** facilita la prueba de alertas y recálculo con el escenario de lluvia. **Dev 4** consume el mismo formato de precios en Explorar. Los cambios necesarios a un contrato congelado se acuerdan en Fase 0 o mediante el micro-PR compartido que prevé el equipo.

## Secuencia de entrega

1. **Sprint 1, diseño y preparación.** Revisar esta primera vista, validar los datos candidatos, reunir fuentes y escoger un recorrido demostrable desde Plaza de la Paz. Cerrar con Dev 1 la información de origen y con Dev 2 el destino de respaldo.
2. **Sprint 2, construcción.** Partir de los contratos de Fase 0 y leer la guía local de Next.js indicada en AGENTS.md antes de programar. Entregar primero datos, cercanía y navegación al mapa, luego conversión, preferencias y traducciones. Comprobar lint y build antes del PR. El orden de integración del equipo contempla primero el PR del Dev 5.
3. **Sprint 3, integración y demo.** Probar con el shell y el mapa integrados en teléfonos reales. Ensayar la consulta del precio de un almuerzo, la activación de Ruta accesible y la llegada al mapa desde «Salud más cercana». Repetir con el escenario de lluvia y el respaldo de rutas.

## Verificación previa y criterios de aceptación

La revisión del recorrido en el esquema confirma que Salud y Seguridad son las dos primeras acciones, el punto de partida se identifica antes de elegir y los enlaces a Moneda e Inclusión preceden a las listas extensas cuando el directorio está plegado. La comprobación de espacio efectivo y comportamiento queda para el prototipo.

- [ ] A 360 × 640 px y tamaño de texto normal, comprobar con ambas barras reales que se ven el origen y los dos botones principales sin desplazarse.
- [ ] A 320 px de ancho y con texto ampliado, comprobar que se puede leer y actuar con desplazamiento vertical, sin recortes ni controles bajo la barra inferior. Repetir en los cuatro idiomas y revisar el orden del foco con teclado y lector de pantalla.
- [ ] Verificar salud y seguridad con un origen conocido, ubicación denegada y categoría vacía. Para el recorrido de demo, forzar el respaldo del mapa y confirmar que termina en el establecimiento elegido.
- [ ] Probar los tres pares con COP en ambos sentidos, cero, entrada vacía y decimales. Cambiar la moneda en la barra y contrastar un precio base idéntico en Asistencia y Explorar.
- [ ] Activar las cuatro preferencias por separado y combinadas. Verificar una ruta con barrera conocida, legibilidad en alto contraste, etiquetas largas y una única lectura de la alerta en el idioma activo.
- [ ] Cambiar de Mundial a Legado, revisar puntos temporales y comprobar que el visitante encuentra ayuda permanente en ambos modos.

Documentos de referencia: [Visión de BQ360](./BQ360.md) y [Plan de desarrollo del equipo](./PLAN_DESARROLLO.md).
