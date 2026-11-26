# BQ360 --- Barranquilla 2034

> Una ciudad. Cinco dimensiones. Un futuro.

**QUIJAM --- Bootcamp City Challenge**\
**Programa integral de transformación urbana e inteligencia territorial**

## 1. Contexto y visión

El reto plantea un escenario ficticio en el que Barranquilla recibe el Mundial de Fútbol en 2034. La llegada masiva de visitantes pondría a prueba la movilidad, los servicios públicos, la economía, la infraestructura y la capacidad de coordinación de la ciudad.

BQ360 propone aprovechar el evento como motor de transformación permanente, no como una intervención temporal. Su prioridad es mejorar la calidad de vida de los habitantes antes, durante y después del Mundial.

### Datos de referencia

  ----------------------------------------------------------------------------------------------------------------------------------------
  Indicador                           Dato del material QUIJAM
  ----------------------------------- ----------------------------------------------------------------------------------------------------
  Población                           1.334.509 habitantes (proyección DANE 2024)

  Extensión distrital                 154 km²

  PIB distrital                       COP 40,7 billones (2023)

  Actividades terciarias              79 % del PIB de 2023

  Sectores estratégicos               Servicios, comercio, industria y logística

  Activos territoriales               Carnaval, Gran Malecón, río Magdalena, gastronomía, aeropuerto Ernesto Cortissoz y playas cercanas
  ----------------------------------------------------------------------------------------------------------------------------------------

Los datos iniciales comunicados por el equipo fueron 1.248.000 habitantes en 2026 y un PIB de COP 46,8 billones. Estas cifras difieren de las diapositivas y deben verificarse antes de utilizarlas. La sede del Mundial es una premisa ficticia del reto, no un anuncio oficial.

## 2. Problema central

La limitada capacidad de coordinación y adaptación de los servicios urbanos ante incrementos masivos de demanda puede comprometer la calidad de vida, la sostenibilidad y la distribución equitativa de oportunidades económicas.

**Causas hipotéticas por validar:** - Fragmentación de servicios e información entre actores urbanos. - Insuficiente integración de datos para anticipar la demanda. - Barreras de participación, accesibilidad y digitalización. - Limitaciones de infraestructura y coordinación operativa.

**Consecuencias potenciales:** congestión, saturación de servicios, residuos, riesgos climáticos, exclusión económica y deterioro de la experiencia de residentes y visitantes.

**Pregunta de innovación:** ¿Cómo preparar a Barranquilla para recibir al mundo en 2034 mediante un sistema urbano integrado que genere beneficios permanentes para sus habitantes?

## 3. Propuesta de valor

BQ360 es un programa estratégico que articula infraestructura, sostenibilidad, inteligencia urbana, ciudadanía y economía mediante un ecosistema físico y digital. Conecta turistas, residentes, comerciantes, operadores y autoridades para anticipar necesidades, coordinar respuestas y distribuir oportunidades.

No es solamente una aplicación turística: es un modelo de gestión territorial con iniciativas complementarias, un prototipo demostrable y una estrategia de legado.

## 4. Cinco dimensiones del programa

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Dimensión oficial          Programa          Iniciativas principales                                                                                                             Legado
  -------------------------- ----------------- ----------------------------------------------------------------------------------------------------------------------------------- ----------------------------------------------
  Ciudad y territorio        BQ Territory      Movilidad predictiva, rutas accesibles, corredores turísticos, señalización QR, gestión de aglomeraciones, hidratación              Mejor movilidad y espacio público cotidiano

  Sostenibilidad             BQ Green          Reciclaje, monitoreo ambiental, alertas por calor y lluvias, incentivos al transporte sostenible, energía solar                     Resiliencia climática y economía circular

  Ciudad inteligente         BQ Intelligence   Centro de control, datos interoperables, sensores IoT, IA predictiva, simulación, asistente multilingüe                             Capacidad permanente de planificación urbana

  Ciudadanía                 BQ Community      Voluntariado, reportes ciudadanos, formación turística, cultura, inclusión y participación comunitaria                              Ciudadanía capacitada y participativa

  Economía y oportunidades   BQ Economy        Comercio local, marketplace, empleo temporal, capacitación, rutas gastronómicas, predicción de demanda y formalización progresiva   Fortalecimiento de la economía popular
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Módulos digitales complementarios

BQ Move (movilidad), BQ Explore (turismo y cultura), BQ Safe (orientación y alertas), BQ Market (comercio), BQ Green (ambiente), BQ Health (prevención y orientación), BQ Jobs (empleo), BQ Control (gestión urbana) y BQ AI (asistencia inteligente). Son capacidades del programa, no nueve aplicaciones independientes.

## 5. BQ Nodes: conexión física y digital

Estaciones urbanas modulares que acercan los servicios a quienes no tienen acceso constante a un teléfono o internet. Según su ubicación, podrían incorporar Wi-Fi, energía solar, señalización multilingüe, QR, reciclaje, hidratación, sensores ambientales, carga de dispositivos, accesibilidad y promoción de negocios cercanos.

Ubicaciones candidatas: Estadio Metropolitano, Gran Malecón, centro histórico, aeropuerto y corredores turísticos. Su selección requiere evaluación de demanda, permisos, accesibilidad, mantenimiento y costos.

## 6. Arquitectura y funcionamiento

``` mermaid
flowchart TD
 A[Datos urbanos y reportes ciudadanos] --> B[BQ Intelligence / Control Center]
 B --> C[BQ Territory]
 B --> D[BQ Green]
 B --> E[BQ Community]
 B --> F[BQ Economy]
 C --> G[App, portal comercial y BQ Nodes]
 D --> G
 E --> G
 F --> G
 G --> H[Resultados y retroalimentación]
 H --> A
```

### Escenario demostrativo

Tras un partido, el sistema detecta una demanda elevada de transporte y servicios. Analiza datos de movilidad, clima y capacidad comercial; recomienda rutas alternativas, puntos de hidratación y comercios disponibles; informa a voluntarios y operadores sobre necesidades de atención. Las autoridades conservan la decisión sobre intervenciones operativas.

La demostración puede comparar un escenario sin coordinación y otro con recomendaciones BQ360. Los datos y resultados simulados deben identificarse explícitamente como tales.

## 7. MVP para la hackathon

  ---------------------------------------------------------------------------------------------------------
  Componente                          Alcance demostrable
  ----------------------------------- ---------------------------------------------------------------------
  Control Center (prioridad)          Mapa, indicadores, simulación de demanda, alertas y recomendaciones

  BQ360 App                           Rutas, cultura, comercios, accesibilidad y orientación

  BQ360 Business                      Registro comercial, capacidad disponible y alertas de demanda

  BQ Node                             Maqueta, modelo 3D o prototipo físico modular
  ---------------------------------------------------------------------------------------------------------

Priorizar un flujo funcional de principio a fin sobre muchas pantallas inconexas. No es necesario implementar todos los módulos ni contar con integraciones institucionales reales durante el bootcamp.

### Stack sugerido

-   Frontend: Next.js, Tailwind CSS.
-   Backend: NestJS.
-   Base de datos: PostgreSQL + PostGIS; Prisma donde sea compatible.
-   Mapas: MapLibre GL y OpenStreetMap.
-   Tiempo real: Supabase Realtime.
-   Predicción: Python o modelo estadístico inicial; OpenAI API para asistencia y explicación de recomendaciones.
-   Despliegue: Vercel y Render.

## 8. Actores y validación

Beneficiarios: residentes, turistas, comerciantes formales e informales, trabajadores, personas con discapacidad y adultos mayores. Aliados potenciales: Alcaldía, operadores de transporte, universidades, organizaciones comunitarias, sector empresarial y operadores ambientales.

Validar mediante entrevistas breves a ciudadanos y comerciantes, pruebas de tareas con usuarios, revisión de accesibilidad y registro de retroalimentación. Medir tiempos de búsqueda, comprensión de recomendaciones y utilidad percibida. Documentar qué cambió entre versiones. No afirmar que se realizaron pruebas o alianzas hasta que existan evidencias.

## 9. Implementación y sostenibilidad

  Etapa propuesta    Objetivo
  ------------------ ----------------------------------------------------
  2026--2027         Diagnóstico, validación, alianzas y piloto
  2028--2029         Integración de servicios y corredores estratégicos
  2030--2031         Expansión de cobertura y capacitación
  2032--2033         Pruebas operativas durante eventos masivos
  2034               Operación en el escenario del Mundial
  2035 en adelante   Continuidad en Carnaval, turismo y vida cotidiana

Financiación potencial: alianzas público-privadas, patrocinios de nodos, fondos de innovación, cooperación internacional, convenios universitarios y servicios comerciales premium. Mantener gratuitos los servicios esenciales. Presupuestar instalación, conectividad, personal, mantenimiento y reposición antes de escalar. No hay financiación confirmada.

### Indicadores y metas piloto ilustrativas

  Indicador                                         Meta propuesta
  ----------------------------------------------- ----------------
  Tiempo de desplazamiento                                   -15 %
  Residuos aprovechados en puntos piloto                      30 %
  Tiempo de detección de saturación                          -40 %
  Personas capacitadas                                         500
  Comercios vinculados                                         200
  Ventas de comercios participantes                          +10 %
  Rutas piloto con información de accesibilidad              100 %
  Satisfacción de visitantes                                  85 %

Son metas hipotéticas, no resultados ni pronósticos validados. Definir línea base, periodo, método de medición y responsable antes de adoptarlas.

## 10. Requisitos oficiales de QUIJAM

Las cinco lecciones de la página 10 son pensar en el después, priorizar lo cotidiano, presupuestar con realismo, incluir a todos y cumplir a tiempo. Los casos de Barcelona 1992 y Londres 2012 ilustran el legado urbano; Sudáfrica 2010 y Brasil 2014 advierten sobre infraestructura costosa y subutilizada. Qatar 2022 y Barranquilla 2018 aportan lecciones de innovación y cumplimiento.

La iniciativa debe responder seis preguntas: problema, personas, integración, solución, sostenibilidad y legado. Se busca un programa articulado, no una app aislada.

### Rúbrica oficial (página 29)

  Criterio                                           Peso
  ------------------------------------------------ ------
  Visión estratégica e integralidad                  20 %
  Integración de las cinco líneas                    15 %
  Desarrollo y madurez del prototipo                 15 %
  Comprensión del problema y pertinencia             10 %
  Innovación y diferenciación                        10 %
  Viabilidad, sostenibilidad e impacto               10 %
  Evolución, colaboración y desempeño en sprints     10 %
  Comunicación, presentación y video                 10 %

La visión estratégica y la integración suman 35 %. Junto con el prototipo representan 50 % de la evaluación.

### Sprints oficiales

#### Sprint 1 --- Comprender y diseñar (día 1, mañana)

-   [ ] Diagnosticar el problema y sus causas.
-   [ ] Identificar beneficiarios y actores.
-   [ ] Definir problema central y propuesta de valor.
-   [ ] Trazar arquitectura inicial y mapa de cinco dimensiones.

**Entregable:** diagnóstico, problema central y arquitectura inicial.

#### Sprint 2 --- Diseñar y construir (día 1, tarde)

-   [ ] Estructurar el programa y sus componentes.
-   [ ] Construir primera versión del prototipo.
-   [ ] Definir funcionamiento, recursos, actores y alianzas.
-   [ ] Proponer indicadores y hoja de ruta.

**Entregable:** programa estructurado y prototipo inicial.

#### Sprint 3 --- Validar y consolidar (día 2, mañana)

-   [ ] Probar y ajustar el programa con retroalimentación.
-   [ ] Demostrar el funcionamiento de la solución.
-   [ ] Comunicar impacto, sostenibilidad e implementación.
-   [ ] Preparar presentación, video y evidencia de evolución.

**Entregable:** iniciativa consolidada y Demo Day.

### Entregables y presentación

Programa estratégico (producto central), prototipo digital y/o físico según la solución, presentación PowerPoint y video de máximo cinco minutos. Estructura narrativa: problema → propuesta → programa → prototipo → impacto. Roles sugeridos: coordinación, investigación, diseño, prototipado y comunicación.

## 11. Riesgos y decisiones pendientes

-   Acceso a datos reales: utilizar simulaciones etiquetadas hasta obtener fuentes autorizadas.
-   Alcance excesivo: concentrar el MVP en un escenario integrado.
-   Privacidad: minimizar datos personales, usar información agregada y establecer controles de acceso.
-   Exclusión digital: incorporar señalización física, accesibilidad y atención comunitaria.
-   Costos y mantenimiento: probar nodos modulares antes de ampliar infraestructura.
-   Dependencia institucional: validar competencias, permisos y alianzas antes de prometer servicios.
-   Validación: comprobar el problema central y las metas con usuarios reales.

## 12. Pitch

Recibir un Mundial no consiste únicamente en llenar un estadio. Significa preparar una ciudad entera. BQ360 conecta infraestructura, sostenibilidad, inteligencia urbana, ciudadanía y economía para anticipar problemas, coordinar recursos y distribuir oportunidades. Mediante una plataforma digital y estaciones urbanas inteligentes, convierte la llegada de visitantes en una oportunidad de transformación para quienes viven en Barranquilla. El Mundial dura unas semanas; su legado puede transformar una ciudad para siempre.

**El mundo viene. Barranquilla evoluciona.**

## Fuentes y alcance

-   Presentación suministrada: `quijam diapo.pdf`, 33 páginas. Contexto y lecciones: pp. 4--12; dimensiones y misión: pp. 13--19; metodología y entregables: pp. 20--27; evaluación y comunicación: pp. 28--31.
-   Información inicial aportada por el equipo y propuestas desarrolladas en la conversación sobre BQ360.
-   Los requisitos y cifras atribuidos al PDF proceden del material del bootcamp. Los nombres de módulos, arquitectura, metas, cronograma, financiación y stack son propuestas de diseño, no requisitos oficiales ni hechos verificados externamente.
