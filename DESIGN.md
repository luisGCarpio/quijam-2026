# Guía de Diseño — QUIJAM · Barranquilla 2034 (BQ360 · Quilla3D)

## 1. Paleta de Colores (Blanco + 4 principales)

| Rol | Nombre | HEX | Uso recomendado |
| :--- | :--- | :--- | :--- |
| **Base** | Blanco Puro | `#FFFFFF` | Fondo principal de diapositivas, póster y tarjetas limpias. |
| **Primario** | Azul Marino Profundo | `#10284B` | Títulos principales, texto en negrita, bloques de contraste y barra lateral. |
| **Acento 1** | Verde Caribe | `#268C44` | Sostenibilidad, economía verde, íconos de acción y estados positivos. |
| **Acento 2** | Amarillo Dorado | `#F3C922` | Resaltados, alertas preventivas, métricas clave y trabajo colaborativo. |
| **Acento 3** | Rojo Coral | `#D9323B` | Etiquetas de sección (`CONECTA`, `PROBLEMA`), alertas críticas y énfasis. |

> **Color secundario opcional (5.ª dimensión):** Celeste `#6AB4E2` (usado en el quinto ícono y detalles gráficos de la franja lateral; útil para *Ciudad inteligente* o *Economía azul*).  
> **Texto de cuerpo:** Gris oscuro / carbón `#1F2937` sobre blanco para lectura cómoda.

---

## 2. Tipografía

La presentación utiliza una familia **sans-serif limpia y moderna** (estilo *Open Sans*, *Inter* o *Segoe UI*). Para mantener consistencia en web, Figma, Canva o PowerPoint:

* **Fuente principal (Títulos y cuerpo):** `Inter` o `Open Sans` (alternativa en PowerPoint/Windows: `Segoe UI` o `Calibri`).
* **Jerarquía tipográfica:**
  * **Etiqueta de sección (Kicker):** Mayúsculas, `Bold`, tamaño pequeño (`11–13 pt`), en `#10284B` junto a ícono circular en color acento.
  * **Título principal:** `Bold` / `ExtraBold`, tamaño grande (`28–36 pt`), en Azul Marino `#10284B`.
  * **Subtítulo:** `Regular`, tamaño mediano (`16–18 pt`), en `#1F2937`.
  * **Ítems / Listas:** Concepto clave en `Bold` (`#10284B`) seguido de explicación corta en `Regular` (`#1F2937`).
  * **Pie de página:** `Regular` (`10–11 pt`), discreto en esquina inferior izquierda (`QUIJAM · Bootcamp de Innovación`) y número a la derecha.

---

## 3. Estilo Visual y Componentes

* **Fondo limpio y aireado:** Mucho espacio en blanco (`#FFFFFF`) para priorizar legibilidad rápida.
* **Íconos en círculos sólidos:** Íconos vectoriales minimalistas en blanco (o azul marino sobre amarillo/celeste) dentro de círculos de color sólido para diferenciar categorías.
* **Franja gráfica lateral (identidad QUIJAM):** Borde derecho en Azul Marino `#10284B` con formas orgánicas/geométricas abstractas en Rojo Coral, Amarillo Dorado y Celeste.
* **Regla de contraste:** Usar texto blanco sobre `#10284B`, `#268C44` y `#D9323B`; usar texto `#10284B` sobre `#FFFFFF`, `#F3C922` y `#6AB4E2`.

---

## 4. Variables CSS (Listas para web / prototipo)

```css
:root {
  --color-bg: #FFFFFF;
  --color-navy: #10284B;
  --color-green: #268C44;
  --color-yellow: #F3C922;
  --color-red: #D9323B;
  --color-sky: #6AB4E2;
  --color-text: #1F2937;

  --font-primary: 'Inter', 'Open Sans', 'Segoe UI', sans-serif;
}