# Cómo desarrollar y probar Asistencia en la rama del Dev 5

Trabajaremos en `feat/dev5-assistance-inclusion`. El primer objetivo es abrir la pestaña en un navegador y pulsar **Salud más cercana** desde Plaza de la Paz. La prueba pasa cuando aparece el nombre y las coordenadas del establecimiento elegido. Con ese recorrido funcionando podremos iterar sobre el diseño, el directorio, la moneda y la inclusión mientras el equipo construye el resto de BQ360.

El [plan de Asistencia](./PLAN_DEV5_ASISTENCIA.md) define el diseño y la experiencia. El [plan del equipo](./PLAN_DESARROLLO.md) define las responsabilidades y las firmas compartidas. Esta guía cubre el trabajo que podemos entregar antes de unir las ramas.

## Punto de partida y archivos propios

Ya existen `src/features/assistance/AssistanceTab.tsx`, `src/data/assistance-pois.ts` y `src/lib/geo.ts`. La pantalla recibe acciones mediante propiedades. Hoy los textos están en español, las tasas están dentro del componente y los puntos del directorio tienen un nombre simple. Estos son los primeros elementos que conviene adaptar.

| Ubicación a cargo del Dev 5 | Trabajo |
| --- | --- |
| `src/features/assistance/` | Pantalla y sus tres bloques, tipos de propiedades y vista local de prueba. |
| `src/data/assistance-pois.ts` | Directorio exportado como `ASSISTANCE_POIS`, compatible con el tipo `Poi` del plan. |
| `src/data/currency-rates.ts` y `src/lib/currency.ts` | Tasas, precios referenciales y formato monetario reutilizable por Explorar. |
| `src/lib/geo.ts` y `src/i18n/assistance.ts` | Distancia, cercanía y diccionario propio en ES, EN, PT y FR. |

La rama puede avanzar con los contratos documentados. La incorporación de paquetes, la página principal, los estilos globales, el contexto, los agregadores y el motor de rutas corresponden a los responsables indicados en el plan del equipo.

## Primer cambio que vamos a programar

1. Crear un componente cliente de prueba que importe la pantalla existente. Mantendrá en memoria el origen, el idioma, la moneda, el modo, las preferencias y el último destino. Arrancará en Plaza de la Paz, ES y COP.
2. Para abrirlo, preparar una miniaplicación Next dentro de `src/features/assistance/preview/`, con su propio `app/page.tsx`, layout y configuración local para resolver los imports de `src` y cargar Tailwind. Usará las dependencias instaladas en la raíz. Sus archivos generados deben quedar ignorados dentro de la propia carpeta.
3. Una vez creada esa miniaplicación, el comando previsto desde la raíz será `npx --no-install next dev src/features/assistance/preview -p 3005`. Abrir `http://localhost:3005` y comprobar que se ve el componente real. Esta vista es el primer entregable de implementación.
4. Hacer que la acción de ruta muestre el destino solicitado. Probar ambos botones con un origen conocido y después cambiarlo a las coordenadas de otro punto del directorio. Ese punto debe pasar a ser el más cercano de su categoría con distancia cero.

## Contrato entre la pestaña y quien la abre

| Interacción | En la vista local | Al integrar con BQ360 |
| --- | --- | --- |
| Ubicación, idioma, moneda y modo | La vista pasa coordenadas, una etiqueta explícita del origen, idioma, moneda y modo de ejemplo. Permite simular ubicación denegada. | Leer `userLocation`, `lang`, `currency` y `simulation.mode`. Acordar con el shell la etiqueta del origen predeterminado. |
| Elegir un destino | `navigateToRoute({ lat, lng, label })` registra los datos recibidos. | Pasar la acción homónima del contexto. El mapa calcula la ruta. |
| Cambiar una preferencia | `updateAccessibility(patch)` combina el cambio con el estado local. La vista aplica contraste y escala de texto y muestra la preferencia de ruta solicitada. | El contexto conserva el estado, el shell aplica el tema y el mapa interpreta `accessibleRoute`. |
| Probar una alerta | Mostrar el mensaje localizado y leerlo una vez si la voz está activa y disponible. | Conectar `testVoice` con `pushNotification`. El shell se encarga de la lectura. |

La pantalla conserva el estado propio de la interacción, como el monto escrito, el sentido del cambio y la apertura del directorio. Recibe las preferencias compartidas como propiedades, de modo que un cambio desde la barra superior también se refleje en Asistencia.

## Orden para completar los tres bloques

1. **Salud y Seguridad.** Extraer el directorio a `EmergencySection`. Ajustar los puntos a los campos documentados, incluidos nombres y descripciones localizados. Filtrar por capa y modo antes de calcular cercanía. Verificar procedencia de coordenadas y teléfonos, diferenciar los puestos temporales y mostrar distancia en línea recta. Probar categoría vacía y apertura del marcador.
2. **Tasa monetaria.** Extraer `CurrencyConverter` y las utilidades compartidas. Usar COP por unidad de moneda y conservar la firma de `formatCop` prevista por el equipo. La tabla seguirá la moneda global. Invertir cambiará solo el sentido del cálculo. Identificar origen y fecha de tasas y precios, incluidos los simulados.
3. **Centro de Inclusión.** Extraer `InclusionPanel`. Comprobar que cada interruptor cambia solo una preferencia, que las cuatro pueden combinarse y que la prueba de voz conserva el aviso visual.
4. **Idioma y diseño.** Completar el diccionario y aplicar la tipografía Geist y la paleta QUIJAM del plan. En cada idioma revisar la primera vista, los mensajes de error, las cifras y el foco al saltar a Moneda o Inclusión.

## Cuándo está lista tu rama

- [ ] La vista local abre desde una copia de la rama con las dependencias del proyecto. Permite probar Salud y Seguridad y observar el destino emitido.
- [ ] Se comprueban los tres pares con COP en ambos sentidos, un importe decimal, cero, entrada vacía e inválida, y las cinco referencias de precios.
- [ ] A 360 × 640 px se ven las dos acciones principales. A 320 px y con texto ampliado se puede completar cada acción sin desplazamiento horizontal. Se comprueba navegación con teclado en los cuatro idiomas.
- [ ] Alto contraste y texto grande tienen efecto visible, la preferencia de ruta llega a la vista de prueba y la alerta funciona con voz disponible o con aviso visual.
- [ ] Pasan `npm run lint` y `npm run build` desde la raíz. Se abre además la miniaplicación y se prueban los recorridos en navegador. El build de la raíz por sí solo no recorre la vista local.

## Ensayo del merge

Crear una rama temporal de integración desde la base acordada por el equipo. Incorporar allí los cambios y montar la misma pantalla desde un componente conectado a `useBQ360()`. Los archivos de prueba quedan fuera de la navegación pública. Si aparece una diferencia entre contratos, corregirla en la conexión y comprobar los tipos compartidos antes de modificar las pantallas.

El ensayo termina con tres recorridos reales: solicitar salud o seguridad y ver el destino correcto en Mapa, cambiar de moneda y comparar el mismo importe con Explorar, y activar una preferencia para observar su efecto fuera de Asistencia. Repetir la alerta con el simulador. Estos resultados, junto con lint y build en la rama combinada, permiten al equipo revisar el merge antes de incorporarlo a main.
