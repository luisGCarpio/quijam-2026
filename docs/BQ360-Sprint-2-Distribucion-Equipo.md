# BQ360 · Distribución del equipo para el Sprint 2

**Plan de trabajo para cinco integrantes.** La referencia de alcance, arquitectura, stack y prioridades es [la propuesta definitiva](./BQ360-Sprint-2.md), revisada en main, commit ce61107. El repositorio contiene documentación, logo y póster. El README, el dossier y el cierre de Sprint 1 aportan el contexto territorial y de actores. Las carpetas, interfaces, ramas y comandos que siguen constituyen un diseño para implementar después de aprobar el reparto.

## 1. Objetivo y decisión de reparto

Cada integrante debe poder demostrar una función de BQ360 en su portátil con datos locales aunque los otros cuatro componentes estén desconectados. La integración queda lograda cuando un cambio de campo modifica la simulación, la decisión del operador y el aviso que recibe el público, con el mismo escenario, reloj y versión.

| Alternativa | Ventaja | Problema de integración |
|---|---|---|
| Frontend, backend, datos, algoritmo y pruebas como equipos separados | Especialización por tecnología | Todas las historias de usuario atraviesan varias colas de trabajo. Pruebas y UX quedan al final |
| Dos módulos por persona | Reparto fácil de explicar | BQ Jobs y BQ AI tienen un alcance inicial muy distinto de BQ Move y BQ Control. Se duplica la lógica transversal |
| Cinco entregas funcionales con interfaces acordadas | Cada persona tiene una entrada, una salida y una demostración independiente | Requiere acordar identificadores, unidades y ejemplos antes de conectar piezas |

Se propone la tercera opción. El número identifica una responsabilidad provisional. En la reunión inicial, cada persona indica experiencia, interés y disponibilidad en Python, visualización, UX, operaciones o integración. Asignar responsables después de esa conversación. Si un frente concentra demasiado esfuerzo, transferir una tarea completa con carpeta y prueba propias o trabajar en pareja con un solo autor de integración. Las estimaciones son comparativas, sin equivalencia en días.

## 2. Propiedad funcional y contribución estratégica

| Integrante | Producto del que responde | Módulos bajo su responsabilidad | Componentes transversales bajo su responsabilidad | Demostración independiente |
|---|---|---|---|---|
| 1 · Motor de movilidad | Asignaciones inclusivas y proyección temporal | BQ Move, lógica de decisión. I2 presenta su salida | BQ Flow Engine, BQ Predict, BQ Adaptive Routing | Ejecutar un escenario en Python y obtener cargas y pendientes por perfil |
| 2 · Territorio y cartografía | Mapa comparativo del corredor y catálogo territorial | BQ Explore, BQ Green y BQ Health en su alcance cartográfico y de servicios | BQ Digital Twin | Explorar dos mapas sincronizados con resultados grabados |
| 3 · Inteligencia colectiva y seguridad | Reporte, pausa acotada, revisión y alerta | BQ Live y BQ Safe | Consume BQ Adaptive Routing por medio de restricciones | Reportar una incidencia y resolver una contradicción en una consola de ensayo |
| 4 · Economía y orientación pública | Disponibilidad, aviso al visitante y retiro presencial | BQ Market, BQ Jobs conceptual y BQ AI para asistencia pública | BQ Nodes | Cerrar un servicio, retirar la ficha y confirmar el retiro en una sesión local |
| 5 · Control e integración | Operación de la demo, API común, métricas y comparación | BQ Control, incluido el centro de control | Conecta los cinco componentes y expone sus resultados | Operar el panel completo con respuestas simuladas e inspeccionar su historial |

**Integración de los cinco programas.** Territory aporta trayectos, cruces y límites de acceso vecinal (I2 → I1). Green aporta condiciones ambientales que afectan elegibilidad y costo (I2/I3 → I1). Intelligence permite comparar decisiones con el mismo reloj (I1 → I5). Community incorpora reportes, revisión y acceso presencial (I3/I4). Economy incorpora capacidad de recepción y rotación entre opciones equivalentes (I4 → I1). BQ Green como programa fija objetivos ambientales y como módulo proporciona datos y funciones. La suma de esos aportes debe cambiar una decisión visible en BQ Control.

## 3. Guía de cada integrante

### Integrante 1 · Motor de movilidad y simulación

**Perfil y objetivo.** Python, modelado y pruebas numéricas. Traducir los límites territoriales a decisiones reproducibles. Implementar reloj, colas, llegadas, salidas y aceptación configurable. Diferenciar aforo, tasa de atención y paso por intervalo. Descontar el cruce compartido una vez. Priorizar perfiles con menos opciones, proteger acceso vecinal y conservar personas en tránsito al recalcular. Aplicar rotación comercial solo entre candidatos equivalentes. Usar OR-Tools como referencia para casos pequeños con restricciones compatibles.

**Interfaz y autonomía.** Es propietario de services/engine y sus pruebas. Recibe escenario, política, intervalo, estado anterior y eventos vigentes. Devuelve proyección, asignaciones, pendientes y motivos. Necesita topología y eventos válidos. Puede desarrollar con el grafo sintético y eventos locales sin mapa, API ni base de datos. Entrega biblioteca Python importable por I5, ejecutor de escenarios y pruebas de conservación, reservas, equidad y cambio de intervalo. Complejidad alta, concentrada en corrección matemática.

### Integrante 2 · Territorio y cartografía

**Perfil y objetivo.** TypeScript, MapLibre GL JS, GeoJSON y UX espacial. Construir mapa de referencia con atribución de OpenStreetMap cuando corresponda, fuente cartográfica local y geometrías de escenario explícitamente ficticias. Mantener correspondencia entre tramos, destinos y servicios. Incluir capas de calor, barreras, hidratación, descanso y lugares culturales. Mostrar carga con grosor de línea, cuello de botella con símbolo y motivo en texto. Dos mapas reciben un reloj común y comparten cámara. Off-line, indicar procedencia y vigencia.

**Interfaz y autonomía.** Posee features/territory, la ruta de ensayo de territorio y assets cartográficos. Exporta TerritoryComparison con propiedades de escenario, dos proyecciones y selección de recurso. Las políticas y el reloj global pertenecen a I5. Desarrolla con dos respuestas grabadas y prueba selección, lectura por teclado, cámara sincronizada y ausencia de cartografía remota. Entrega mapas, leyenda y lista textual navegable. Complejidad media-alta por interacción, accesibilidad y rendimiento.

### Integrante 3 · Participación, alertas y supervisión

**Perfil y objetivo.** Reglas de negocio, formularios y estados. Implementar BQ Live y BQ Safe desde el reporte ciudadano hasta la revisión. Una señal grave puede pausar el recurso afectado. Mostrar incertidumbre, fuente, edad y revisión pendiente. Reportes contradictorios requieren intervención. Una decisión manual debe respetar cierres oficiales y límites físicos. Registrar quién actuó usando un rol simulado.

**Interfaz y autonomía.** Posee services/incidents y features/incidents con su ruta de ensayo. Entrega formulario público, bandeja reutilizable por BQ Control y función Python que transforma comandos en eventos de restricción. Probar con un despachador local simulado y casos de arroyo, duplicado, contradicción, vencimiento y reapertura revisada. El bloqueo inevitable es conocer los identificadores territoriales, disponibles en la muestra común. Complejidad media-alta por coherencia entre el estado del reporte y el de la restricción.

### Integrante 4 · Economía, orientación y BQ Nodes

**Perfil y objetivo.** Diseño accesible y flujos de atención. Implementar BQ Market, edición de disponibilidad con vigencia y retiro de servicios. Ofrecer al público orientación textual según perfil, condiciones y versión, con ficha imprimible para el voluntario. Registrar por separado retiro digital y acuse físico. Representar BQ Jobs mediante un catálogo visual de oportunidades ficticias de empleo, capacitación y voluntariado. Para BQ AI incluir una interfaz de asistente que responda preguntas sobre el escenario mediante respuestas locales verificables; la asistencia multilingüe mediante OpenAI API es una extensión opcional. La decisión del motor llega como dato de entrada.

**Interfaz y autonomía.** Posee services/outreach y features/outreach con su ruta de ensayo. Entrega panel comercial, aviso público, ficha, registro de acuses y componentes reutilizables. Usa cierres de comercio, recomendaciones y versiones grabadas. Prueba falta de red, dato vencido, cierre de un servicio que comparte destino con otro, ficha antigua y segundo acuse del mismo retiro. La vista pública puede ejercitarse con teclado y sin QR. Complejidad media-alta por coordinación física y digital.

### Integrante 5 · BQ Control, API y coordinación de integración

**Perfil y objetivo.** Integración Python/TypeScript, FastAPI, Next.js y Recharts. Diseñar la consola del operador, selector de políticas, reloj, explicaciones, historial e indicadores por perfil. Conectar biblioteca del motor, manejadores de incidencias, publicación y visualización. Mantener contratos, validación de mensajes y reinicio reproducible. Preparar integración progresiva con WebSockets, PostgreSQL + PostGIS y Docker conforme al documento oficial.

**Interfaz y autonomía.** Posee services/api, features/control, shell de Next.js, contratos y configuración común. Usa adaptadores simulados con las mismas firmas que los reales. Puede demostrar el recorrido entero con respuestas grabadas desde el primer incremento. Entrega API, panel, arranque conjunto y prueba de extremo a extremo. Cada autor prueba su propio adaptador y aporta evidencia para la demo. Complejidad alta por integración. I5 custodia la coherencia de versiones y coordina las pruebas comunes. Cada especialista implementa y prueba su adaptador real, corrige sus errores y participa en la integración; I5 no asume esas tareas por los demás.

## 4. Arquitectura y arranque simultáneo

~~~mermaid
flowchart LR
    L[BQ Live y BQ Safe] -->|reporte y revisión| A[FastAPI y BQ Control]
    M[BQ Market] -->|recepción vigente| A
    A -->|escenario, política y eventos| E[Predict, Flow Engine y Adaptive Routing]
    E -->|proyección y motivos| A
    A -->|misma versión| T[Mapas y capas territoriales]
    A -->|recomendación vigente| N[Vista pública y BQ Nodes]
    N -->|acuse físico| A
    A --> H[Indicadores e historial]
~~~

**Estructura propuesta.** Las rutas entre llaves representan carpetas individuales. Cada autor mantiene las pruebas junto a su código.

~~~text
docs/                                     documentación existente y este plan
contracts/v1/                             I5 · OpenAPI, esquemas JSON, eventos
contracts/v1/fixtures/                    I5 · metropolitano.json y respuestas de referencia
apps/web/app/{territory,incidents,outreach,control}/page.tsx
                                          I2, I3, I4, I5 respectivamente
apps/web/features/{territory,incidents,outreach,control}/
                                          mismo propietario que la ruta
apps/web/public/territory/                I2 · GeoJSON, atribuciones y fondo local
apps/web/app/{layout.tsx,page.tsx}         I5 · marco y composición final
apps/web/shared/                          I5 · cliente API, tipos y selector mock/real
services/engine/                          I1 · simulation.py, allocation.py, routing.py y tests/
services/incidents/                       I3 · commands.py, restrictions.py y tests/
services/outreach/                        I4 · availability.py, notices.py y tests/
services/api/                             I5 · main.py, adapters/, store/ y tests/
integration/                              I5 · contrato, recorrido completo y pruebas de reinicio; I3 · incidents/
compose.yaml, .env.example, lockfiles, CI  I5 · configuración y dependencias comunes
~~~

**Base común para preparar al iniciar el desarrollo.** Los cinco integrantes acuerdan y validan conjuntamente el punto de partida; I5 consolida un punto de partida compartido con el escenario y respuestas de este plan, esquemas v1, cliente con transporte inyectable, paquetes vacíos con rutas de ensayo, comandos de arranque, versiones de runtimes acordadas, lockfiles y ejemplo de entorno sin secretos. Cada ruta importa solo su propia característica y el paquete común. La página principal integra los widgets reales a medida que estén disponibles. I1–I4 pueden arrancar desde los ejemplos de este documento mientras se incorpora la base. La primera integración de contratos debe preceder a cualquier cambio incompatible.

| Persona | Entrada local prevista | Dependencia sustituida | Prueba aislada prevista |
|---|---|---|---|
| I1 | Ejecutar desde services/engine un runner Python sobre el fixture | Datos de API y reportes mediante JSON | pytest del motor y contraste con referencia |
| I2 | Next.js en /territory con transporte mock | API y motor mediante dos resultados estáticos | Prueba de componente y navegación sin red exterior |
| I3 | Next.js en /incidents y pytest en services/incidents | Despachador y operador mediante eventos locales | Pruebas de transición y flujo reporte → revisión |
| I4 | Next.js en /outreach y pytest en services/outreach | Motor, comercio y reloj con versiones grabadas | Pruebas de publicación, vencimiento y acuse |
| I5 | FastAPI y /control con adaptadores de dominio simulados | Mapa y lógica de los otros cuatro mediante dobles | Pruebas HTTP, historial y comparación por política |

Acordar scripts comunes para instalar, arrancar y probar cada frente desde un clon limpio. Como convención inicial, usar pnpm en apps/web, pytest por paquete Python y FastAPI sobre un almacén en memoria en el modo demo. Configurar modo mock/real y URL de API como opciones de entorno. Docker ofrece el arranque reproducible del conjunto. La cartografía y los escenarios locales permiten ejecutar la demo con la red externa desconectada. Persistencia PostGIS, difusión WebSocket e IA utilizan adaptadores reemplazables. El modo local debe funcionar antes de conectar cualquier servicio externo.

### 4.1. Arranque colectivo y diseño visual compartido

Antes de separar el trabajo, los cinco integrantes realizan una revisión conjunta de los contratos, identificadores, unidades, fixtures y criterios de aceptación. I1 valida los resultados numéricos; I2 valida geometrías y prepara las gráficas; I3 valida comandos, restricciones y errores; I4 prepara la guía visual y los componentes UI; I5 consolida el esqueleto, scripts y configuración. Cada integrante puede iniciar su lógica o maqueta local con los ejemplos del documento mientras se consolida la base. El hito de arranque termina cuando los cinco pueden ejecutar su ruta o runner aislado desde un clon limpio.

| Elemento compartido | Convención | Responsable |
|---|---|---|
| Identidad visual | Logo y colores del proyecto; tokens de color, tipografía y espaciado acordados | I4 con revisión colectiva |
| Componentes UI | Botones, tarjetas, formularios, estados vacíos, alertas y foco visible | I4 · apps/web/shared/ui/ |
| Mapas y gráficas | Leyendas, unidades, estados y colores con alternativa textual | I2 |
| Navegación | Marco común, rutas independientes y diseño adaptable | I5; cada autor integra su vista |
| Accesibilidad | Teclado, contraste, etiquetas y mensajes que no dependan solo del color | Cada integrante en su entrega |

Las interfaces deben mostrar una identidad coherente y distinguir datos simulados de información real. Los componentes comunes tendrán ejemplos locales; ningún integrante necesita esperar a que estén terminados para construir su lógica de dominio.

### 4.2. Cobertura visible de los diez módulos

| Módulo | Evidencia prevista | Prioridad |
|---|---|---|
| BQ Move | Distribución y rutas compatibles | P0 |
| BQ Explore | Lugares culturales y turísticos en el mapa | P1 |
| BQ Safe | Alertas y restricciones | P0 |
| BQ Market | Disponibilidad comercial y retiro de servicios | P0 |
| BQ Green | Capas ambientales y condiciones que afectan rutas | P0 |
| BQ Health | Puntos de hidratación, descanso y orientación a servicios | P0 |
| BQ Jobs | Catálogo visual ficticio de oportunidades | P1 |
| BQ Live | Reporte ciudadano y revisión | P0 |
| BQ Control | Panel, simulación y supervisión | P0 |
| BQ AI | Asistente local sobre el escenario; API externa opcional | P1 |

La navegación identificará los diez módulos, indicando cuáles son funcionales, demostrativos o conceptuales. Las extensiones P1 no bloquean la integración P0 ni deben presentarse como funcionalidades terminadas si no se implementan.

## 5. Contratos de integración v1

**Identidad y tiempo.** Mantener schemaVersion, scenarioId, runId, policy y tick en las respuestas de simulación. tick es un entero desde cero y tickMinutes pertenece al escenario. Las capacidades ilustrativas se declaran por recurso y unidad. Todos los objetos enlazan por ID, nunca por nombre visible. Una versión de estado crece de forma monótona dentro de una ejecución. La validez usa intervalos semiabiertos, desde validFromTick incluido hasta validUntilTick excluido. Etiquetar todas las vistas como simulación.

| Estructura | Campos requeridos y significado |
|---|---|
| Scenario | id, schemaVersion, simulated, tickMinutes, resources[], routes[], profiles[], arrivals[], services[] y geojson. Cada feature usa resourceId |
| Resource | id, type (space, passage o service), unit (persons, personsPerTick o servedPerTick), capacity, initialOccupancy cuando aplique, source, validUntilTick y status |
| Route | id, resourceIds en orden, travelTicks por tramo, destinationId, compatibleProfiles y atributos de acceso. El cruce común usa el mismo ID en B y C |
| Projection | policy, tick, demanda del lote, allocations por ruta y perfil, pendingByProfile con motivo, cargas por recurso, recomendados, en tránsito y llegadas. Los estados de una persona son excluyentes dentro del conteo de su lote |
| Event | id único, type, resourceId o noticeId según tipo, actorRole, effectiveTick, payload y version asignada por el servidor. El reporte agrega categoría, fuente y estado de revisión |
| Notice | id, version, runId, policy, profileId, routeId opcional, texto, motivo, vigencia, estado digital y estado de acuse físico. Un aviso retirado permanece consultable en el historial |

**Caso patrón compartido.** ID metro-exit-v1, franja ilustrativa de cinco minutos, primera llegada de 500 personas, 400 flexibles y 100 que requieren C. A admite 50, B y C consumen el mismo cruce de 430 pasos en el intervalo, B recibe 250 y C recibe 180. Las pruebas del primer intervalo suponen recursos restantes suficientes y D inactivo. D puede aportar 200 plazas por acceso independiente bajo intervención. Declarar explícitamente si su recorrido admite a quienes requieren acceso compatible. En la referencia con cero pendientes, D sí cumple esas condiciones. Usar cohortes y comercios ficticios, dibujar coordenadas solo para ilustración. Los casos de calor, arroyos, cierres y tasa de aceptación se parametrizan por escenario.

**Ejemplos de intercambio.** Un comando ciudadano y una proyección resumida de la misma ejecución. El fixture completo amplía las cargas y perfiles que aquí se ilustran.

~~~json
{
  "commandId": "cmd-001",
  "expectedVersion": 3,
  "type": "report.submit",
  "actorRole": "citizen",
  "resourceId": "passage-C",
  "effectiveTick": 0,
  "payload": {"category": "arroyo", "source": "citizen", "severity": "high"}
}
~~~

~~~json
{
  "schemaVersion": 1, "scenarioId": "metro-exit-v1", "runId": "demo-01",
  "simulated": true, "policy": "balanced", "tick": 0, "version": 4,
  "demand": 500, "allocations": {"A": {"flex": 50}, "B": {"flex": 250}},
  "pendingByProfile": [
    {"profile": "flex", "count": 100, "reason": "destination_capacity"},
    {"profile": "access", "count": 100, "reason": "no_compatible_route"}
  ],
  "loads": [{"resourceId": "cross-BC", "used": 250, "capacity": 430, "unit": "personsPerTick"}],
  "inTransit": 0, "arrived": 0, "recommended": 300
}
~~~

| Interfaz propuesta | Productor → consumidor | Conducta acordada |
|---|---|---|
| GET /api/v1/scenarios/{id} | API → todos | Escenario y geometría local, o referencia relativa a la geometría. 404 para ID desconocido |
| POST /api/v1/runs | Control → API | Recibe scenarioId y parámetros de demanda, aceptación y políticas. 201 devuelve runId, tick inicial, version y modo simulado. Reiniciar crea una ejecución nueva |
| POST /api/v1/runs/{id}/commands | Vistas → API | Comandos report.submit, report.review, market.update, clock.advance, intervention.apply y node.ack. Respuesta 200 con versión y eventos emitidos |
| GET /api/v1/runs/{id}/state?policy=balanced | API → mapas, control y público | Snapshot consistente con reloj, proyección, incidencias, restricciones y avisos. Políticas shortest, balanced e intervention |
| GET /api/v1/runs/{id}/events?afterVersion=3 | API → control y pruebas | Historial ordenado para auditoría y reconexión. Una actualización puede incluir varios eventos en la misma versión |
| WS /api/v1/runs/{id}/stream | API → clientes | Cuando se habilite, publicar runId y nueva versión después de confirmar cambios. El cliente vuelve a leer state. Consulta HTTP como alternativa |
| simulate(scenario, priorState, events, policy, tick) | I1 → adaptador de I5 | Función determinista, sin acceso a red ni base de datos. Devuelve estado siguiente y proyección |
| handle(command, state) y publish(projection, priorNotices) | I3/I4 → I5 | I3 decide estados de incidencia y restricciones. I4 calcula disponibilidad, avisos y retiro. I5 ordena transición, simulación y publicación |

Aplicar reportes, reloj y condiciones externas a las políticas comparadas desde el mismo estado inicial. Solo intervention incorpora el cambio operativo autorizado. Ejecutar ramas hipotéticas por separado y publicar orientación desde la política activa elegida para la demo. En una actualización dentro del mismo tick recalcular desde el último estado confirmado de movimiento, liberando solo reservas redirigibles. Así se evita sumar dos veces llegadas o trasladar personas ya en tránsito.

**Consistencia.** I5 confirma evento, proyección y avisos como una unidad lógica. Un commandId repetido con el mismo contenido devuelve el resultado anterior. Si cambió el contenido o expectedVersion difiere, responder 409 y refrescar estado. ID inexistente devuelve 404, carga inválida 422 y rol no permitido 403. Ejemplo de error: `{"code":"stale_version","currentVersion":4}`. Los roles de demo son simulados. Solo el operador revisa incidentes o activa intervenciones. El comercio actualiza su servicio y el voluntario acusa recibo de una versión concreta. En reconexión, aplicar primero el snapshot vigente y descartar respuestas anteriores. Publicar un aviso nuevo genera una tarea de retiro para la ficha anterior.

## 6. Backlog individual

P0 es indispensable para la demo, P1 complementa la experiencia y P2 prepara evolución. Las dependencias indicadas son requisitos para integrar o completar la tarea. Toda tarea P0 arranca con los contratos o los ejemplos anteriores. Tamaños relativos B, M y A significan bajo, medio y alto. El esfuerzo se estima por tarea, sujeto a revisión con las habilidades reales. Cada fila combina historia, trabajo, entrega y prueba observable.

| ID · origen | Historia de usuario y trabajo | Prioridad / tamaño | Depende de | Entrega y aceptación |
|---|---|---|---|---|
| I1-01 · S2-01/03/11 | Como visitante necesito una ruta compatible. Modelar grafo y repartir lotes según capacidad y acceso | P0/A | Caso patrón | Motor asigna 480, conserva 20 pendientes y respeta la reserva de C |
| I1-02 · S2-12 | Como operador quiero anticipar colas. Implementar reloj, tasas, tránsito y aceptación en tres políticas | P0/A | Modelo de recursos | Runner reproduce intervalos y cierre, conserva cohortes y explica el límite |
| I1-03 · S2-03 | Como evaluador quiero detectar inequidad. Comparar casos pequeños con referencia OR-Tools | P0/M | Salida de asignación | Prueba detecta un reparto que desperdicia capacidad accesible |
| I1-04 | Como operador quiero explorar sensibilidad a la demanda | P1/M | Reloj | Barrido de parámetros reproducible |
| I1-05 | Como planificador quiero predicción calibrada | P2/A | Series y validación posteriores | Evaluación en eventos reservados frente a línea base |
| I2-01 · S2-01/02 | Como operador quiero reconocer recursos compartidos. Dibujar grafo local y capas territoriales | P0/M | IDs v1 | Cada tramo seleccionable muestra su unidad y coincide con el grafo |
| I2-02 · S2-04/09 | Como jurado quiero comparar el mismo instante. Sincronizar cámara, representar flujos y límites y entregar gráficas comparativas Recharts | P0/A | Snapshot doble | Seleccionar cross-BC muestra una sola carga y ambas vistas mantienen el tick |
| I2-03 · S2-09 | Como usuario de teclado quiero consultar recursos. Añadir foco, etiquetas y alternativa textual | P0/M | Catálogo | Se completa la consulta sin ratón ni interpretación exclusiva del color |
| I2-04 | Como visitante quiero explorar servicios y desniveles | P1/M | Capas | Filtros culturales y perspectiva 2.5D con retorno a 2D |
| I2-05 | Como planificador quiero un gemelo actualizado | P2/A | Datos autorizados y calibración | Recursos sincronizados con procedencia y vigencia auditables |
| I3-01 · S2-05 | Como ciudadano quiero reportar un arroyo. Implementar formulario, validación y deduplicación | P0/M | Event v1 | Repetir el envío produce una incidencia identificable |
| I3-02 · S2-06 | Como operador necesito revisar excepciones. Pausar solo recursos afectados y registrar resolución | P0/A | Estados de reporte | C queda en pausa, se registra motivo y una contradicción pendiente impide reapertura automática |
| I3-03 · S2-06/10 | Como visitante quiero conocer el alcance de una alerta. Publicar estado y motivo para BQ Safe | P0/M | Restricciones | Se distingue pausa preventiva de cierre verificado y se conserva historial |
| I3-04 | Como operador quiero contrastar reportes independientes | P1/M | Reportes | Confirmaciones duplicadas no aumentan corroboración |
| I3-05 | Como operador quiero contrastar señales institucionales | P2/A | Permisos y fuente real | Fuente identificada y protocolo de precedencia validado |
| I4-01 · S2-07 | Como comercio quiero actualizar mi recepción. Implementar capacidad y vencimiento por servicio | P0/M | Resource y Event | Un cierre retira solo opciones afectadas y produce un evento reproducible |
| I4-02 · S2-08 | Como visitante quiero orientación vigente incluso sin teléfono. Crear aviso público y ficha accesible | P0/A | Notice y Projection | Ficha y pantalla coinciden en versión, texto y vigencia |
| I4-03 · S2-08/10 | Como voluntario quiero confirmar el retiro. Registrar acuse por versión y mostrar tareas pendientes | P0/M | Aviso previo | El retiro digital deja el físico pendiente hasta el acuse correcto |
| I4-04 | Como visitante quiero consultar al asistente y comprender la indicación | P1/M | Aviso vigente | Interfaz BQ AI responde preguntas del escenario con explicación local verificable; traducción opcional conserva motivo y vigencia |
| I4-05 | Como residente quiero identificar oportunidades de empleo, capacitación y voluntariado | P1/M | Acuerdos futuros | Catálogo demostrativo BQ Jobs distingue oportunidades ilustrativas de vacantes confirmadas |
| I5-01 · S2-01/10 | Como equipo queremos probar el mismo escenario. Preparar base común, contratos, mocks y CI | P0/M | Acuerdo inicial | Cada frente arranca con su comando en modo local |
| I5-02 · S2-04/12 | Como operador quiero elegir políticas y observar resultados. Implementar panel y API de ejecuciones | P0/A | Fixture v1 | Las tres políticas comparten reloj y entradas, diferencias explicadas mediante las gráficas Recharts entregadas por I2 |
| I5-03 · S2-06/10 | Como jurado quiero repetir la secuencia completa. Integrar adaptadores, pruebas y reinicio | P0/A | Contratos para empezar, cinco entregas para cierre | El guion pasa dos veces, incluye acuse, caso de tránsito y estado pendiente |
| I5-04 | Como operador quiero recibir actualizaciones sin refrescar | P1/M | API de eventos | WebSocket anuncia versión y reconexión recupera snapshot por HTTP |
| I5-05 | Como coordinador quiero operación persistente multiusuario | P2/A | Modelo y gobernanza | PostGIS y control de acceso conservan transiciones concurrentes |

I1 e I5 concentran incertidumbre técnica. Proteger su capacidad dejando pruebas de componentes, pantallas de dominio y correcciones en manos de sus autores. Para equilibrar la carga, I2 asume desde el inicio las gráficas comparativas y I3 automatiza el caso de excepción bajo integration/incidents/. I4 mantiene los componentes visuales compartidos de atención y accesibilidad; I1 mantiene las pruebas matemáticas y su adaptador. I5 conserva la API, el reloj, la composición del panel y la coordinación de integración. En cada revisión comparar entregas pendientes y dificultades observadas antes de repartir P1.

## 7. Git y GitHub

Propuesta para el desarrollo posterior, con cinco ramas de trabajo desde el mismo commit de arranque. Usar sprint2/i1-motor, sprint2/i2-territorio, sprint2/i3-incidencias, sprint2/i4-orientacion y sprint2/i5-control. Tras el arranque común, actualizar las cinco ramas. Usar commits pequeños como feat(engine): modelar capacidad de paso, test(outreach): comprobar retiro duplicado o fix(control): descartar versión antigua.

Cada titular modifica su carpeta y abre PR pequeños hacia main con evidencia del caso aislado, contrato afectado y prueba de regresión. Integrar primero la base común, luego incrementos verticales detrás del selector mock/real. Mantener main ejecutable con adaptadores simulados durante la transición. Actualizar cada rama desde main tras integrar contratos o dependencias. Si se reutiliza la rama personal en sucesivos PR, incorporar main antes de abrir el siguiente y verificar que el diff solo contiene el incremento pendiente.

Proponer protección de main en GitHub con PR, revisión por un compañero y CI obligatoria. El consumidor revisa los cambios de contrato. I5 mantiene configuración raíz, registro de rutas, lockfiles y esquemas comunes. I2 mantiene las gráficas comparativas en features/territory/charts/; I3 mantiene integration/incidents/; I4 mantiene apps/web/shared/ui/ y sus estilos compartidos, acordados con todos. Los demás proponen adiciones en su PR y coordinan su incorporación con el propietario. Campos opcionales nuevos deben aceptar los fixtures históricos. Un cambio incompatible requiere contrato paralelo, migración de consumidores y prueba conjunta antes de retirar la versión previa. Resolver conflictos con los dos autores y conservar ambas necesidades funcionales.

## 8. Dependencias e integración progresiva

En la matriz, cada fila consume las salidas de las columnas. El sustituto local permite trabajar mientras se desarrolla el productor.

| Consumidor ↓ / productor → | I1 motor | I2 territorio | I3 reportes | I4 atención | I5 control | Sustituto local |
|---|---|---|---|---|---|---|
| I1 motor | — | Grafo y barreras | Restricciones | Disponibilidad | Reloj y política elegida | Fixture + lista de eventos |
| I2 territorio | Cargas y motivos | — | Estado del riesgo | Servicios vigentes | Tick y política | Dos snapshots |
| I3 reportes | — | IDs de recursos | — | — | Comandos y versión | Despachador en memoria |
| I4 atención | Recomendaciones | Nombres y condiciones | Alertas | — | Versión y reloj | Avisos y eventos grabados |
| I5 control | Simulación | Mapas | Bandeja y restricciones | Disponibilidad y acuses | — | Adaptadores de prueba |

**Hitos de integración, sin duración prefijada.**

1. **Contrato verificable.** I5 publica ejemplos nominales y de fallo. Cada integrante valida un ejemplo ajeno. CI comprueba JSON, tipos, referencias de rutas, unidades y coincidencia entre esquemas y OpenAPI. El contrato incluye error, dato caducado y estado vacío.
2. **Primera integración de lectura.** Conectar I1 con I5 y reemplazar los snapshots de I2 por respuestas reales del motor. La misma entrada debe producir los mismos valores en runner, API y mapa. Si difieren, comparar primero runId, política, tick y versión.
3. **Primera integración de escritura.** Conectar I3 e I4 por separado al bus de comandos de I5. Reproducir dos veces el mismo evento y probar un comando sobre versión antigua. Confirmar que un cambio válido afecta el grafo, el aviso y el historial de una sola ejecución.
4. **Ensayo completo.** Sustituir los últimos mocks de dominio por adaptadores reales. Mantener datos territoriales ficticios rotulados. Registrar qué componentes son funcionales y cuáles conceptuales. Ejecutar el recorrido nominal y repetir con condiciones adversas.
5. **Validación de experiencia.** Una persona ajena al desarrollo explica qué restringe la asignación y encuentra la orientación vigente por teclado. Una segunda persona interpreta la ficha presencial y confirma su retirada. Registrar observaciones, correcciones y asuntos abiertos.

**Detección anticipada.** Cada PR ejecuta pruebas propias y de contrato contra respuestas anteriores. Para cada componente integrado, repetir el mismo caso con implementación real y con el doble. Registrar desviaciones por recurso, perfil, intervalo y versión. Revisar en la reunión de seguimiento bloqueos, cambios de contrato y qué conexión se probará a continuación. Si el mapa falla, la vista textual permite diagnosticar si la discrepancia procede de los datos o del renderizado.

### 8.1. Responsabilidad de integración distribuida

Cada autor entrega su adaptador probado contra los contratos v1 y participa en la conexión de su componente. I5 coordina el orden de integración y conserva la propiedad de la API; no desarrolla las piezas faltantes de los demás. I2 entrega gráficas reutilizables para BQ Control; I3 aporta la prueba automatizada de incidencia; I4 verifica la coherencia visual y el retiro de avisos; I1 verifica la equivalencia entre runner y API. Revisar la carga tras el arranque y antes de iniciar P1. La asignación definitiva de personas depende de sus habilidades y disponibilidad.

## 9. Aceptación conjunta y entrega al jurado

| Ensayo | Resultado verificable | Quién aporta evidencia |
|---|---|---|
| Misma demanda, política de ruta corta y balanceo | Ruta corta admite 50 y deja 450. Balanceo asigna A=50, B=250, C=180, deja 20 y usa 430 pasos compartidos. Las 100 personas que necesitan C reciben plaza compatible | I1, I2, I5 |
| Arroyo antes de iniciar movimiento | Pausa preventiva de C. Quedan 300 asignados y 200 pendientes, incluidas las 100 personas con necesidad específica. BQ Safe explica el motivo y BQ Control permite revisión | I1, I3, I5 |
| Intervención con D independiente | Con D accesible y autorizado en el escenario, admite 200 y elimina la cola. Al quitar compatibilidad, permanece pendiente la cohorte afectada | I1, I2, I5 |
| Incidencia durante desplazamiento | Solo se reasigna demanda redirigible. Las personas en tránsito se conservan y reciben orientación de campo. La contabilidad del lote no duplica recomendaciones y llegadas | I1, I3, I4 |
| Comercio cerrado o dato vencido | La recepción afectada deja de ser elegible, se actualiza el aviso público y el Node registra por separado retirada y acuse con versión | I3, I4, I5 |
| Corte de conexión, duplicado y reinicio | Se accede al escenario local, se identifica vigencia, reintento no duplica acciones y una ejecución nueva reproduce el resultado esperado | Los cinco |
| Accesibilidad y aprendizaje | Mapa, lista textual y ficha comunican capacidad, motivo y vigencia. Registrar prueba de tareas, éxito o fallo y ajuste realizado | I2, I4, I5 |

**Interpretación de la comparación.** La política shortest es una referencia simplificada que selecciona la ruta más corta A sin redistribuir el excedente en el intervalo inicial. No representa todos los navegadores ni constituye una comparación empírica con productos comerciales. Los resultados 50/450, 480/20 y 300/200 son expectativas del escenario sintético, no mediciones urbanas ni pruebas ya ejecutadas. Mantener iguales demanda, reloj, capacidades y condiciones externas al comparar políticas.

**Definición de terminado.** Cada titular entrega su componente ejecutable, comando de prueba aislada, datos de ejemplo, reporte de casos pasados y limitaciones. El equipo entrega el programa articulado, el prototipo integrado, el escenario reproducible, la matriz de pruebas, la ficha BQ Node, el registro de decisiones, los indicadores y la hoja de ruta de la propuesta oficial. El ensayo final recorre tres políticas, un incidente, una revisión humana, un cambio comercial y un acuse presencial. La evidencia debe distinguir resultados del simulador, observaciones de usabilidad e hipótesis de impacto urbano. El cierre requiere un arranque limpio por un compañero y pruebas conjuntas con los componentes P0 reales conectados.
