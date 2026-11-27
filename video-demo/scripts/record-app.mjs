import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLIPS_DIR = path.join(ROOT, "public", "clips");
const TIMELINE_PATH = path.join(ROOT, "src", "timeline.json");
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const VIEWPORT = { width: 416, height: 878 };
const VIDEO_SIZE = { width: 416, height: 878 };

const TAP_INDICATOR_SCRIPT = `
  window.addEventListener('pointerdown', (e) => {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = (e.clientX - 18) + 'px';
    dot.style.top = (e.clientY - 18) + 'px';
    dot.style.width = '36px';
    dot.style.height = '36px';
    dot.style.borderRadius = '9999px';
    dot.style.background = 'rgba(243, 201, 34, 0.55)';
    dot.style.border = '3px solid #10284B';
    dot.style.pointerEvents = 'none';
    dot.style.zIndex = '999999';
    dot.style.transform = 'scale(0.6)';
    dot.style.transition = 'transform 320ms ease-out, opacity 320ms ease-out';
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = 'scale(1.35)';
      dot.style.opacity = '0';
    });
    setTimeout(() => dot.remove(), 360);
  }, true);
`;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function smoothScroll(page, deltaY, steps = 12) {
  const stepY = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => {
      const main = document.querySelector("main") || document.scrollingElement;
      if (main) main.scrollBy(0, y);
      window.scrollBy(0, y);
    }, stepY);
    await sleep(55);
  }
}

async function recordScene(browser, sceneId, targetSec, actions) {
  const tmpDir = path.join(CLIPS_DIR, `_tmp_${sceneId}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: "es-CO",
    recordVideo: {
      dir: tmpDir,
      size: VIDEO_SIZE,
    },
  });

  await context.addInitScript(TAP_INDICATOR_SCRIPT);
  const page = await context.newPage();

  const startedAt = Date.now();
  await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 45000 });
  await sleep(1200);

  await actions(page);

  // Asegurar que el clip cubra la duracion de la narracion
  const elapsedSec = (Date.now() - startedAt) / 1000;
  const remainingMs = Math.max(800, (targetSec + 1.0 - elapsedSec) * 1000);
  await sleep(remainingMs);

  const videoPath = await page.video().path();
  await context.close();

  const finalPath = path.join(CLIPS_DIR, `${sceneId}.webm`);
  fs.copyFileSync(videoPath, finalPath);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`  [OK] Clip grabado: public/clips/${sceneId}.webm`);
}

async function setScenarioSilent(browser, scenarioRegex) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, locale: "es-CO" });
  const page = await ctx.newPage();
  try {
    await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 45000 });
    await sleep(600);
    const simBtn = page.getByRole("button", { name: /Simulador/i });
    await simBtn.click();
    await sleep(500);
    const btn = page.getByRole("button", { name: scenarioRegex }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await sleep(700);
    }
  } finally {
    await ctx.close();
  }
}

async function main() {
  fs.mkdirSync(CLIPS_DIR, { recursive: true });
  const timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, "utf-8"));
  const durationById = Object.fromEntries(
    timeline.scenes.map((s) => [s.id, s.durationSec])
  );

  console.log(`Grabando pantallas de BQ360 desde ${APP_URL}...`);
  const browser = await chromium.launch({ headless: true });

  try {
    // Asegurar estado inicial limpio ("Operacion normal")
    await setScenarioSilent(browser, /Operación normal/i);

    // Escena 02: TopBar (Idiomas, Monedas, Alto Contraste)
    await recordScene(
      browser,
      "02-topbar",
      durationById["02-topbar"] || 28,
      async (page) => {
        await sleep(1500);
        const langSelect = page.locator("header select").nth(0);
        const currencySelect = page.locator("header select").nth(1);

        // Cambiar idiomas: ES -> EN -> PT -> FR -> ES
        await langSelect.selectOption("en");
        await sleep(2600);
        await langSelect.selectOption("pt");
        await sleep(2200);
        await langSelect.selectOption("fr");
        await sleep(2000);
        await langSelect.selectOption("es");
        await sleep(1800);

        // Cambiar monedas: COP -> USD -> EUR -> COP
        await currencySelect.selectOption("USD");
        await sleep(2200);
        await currencySelect.selectOption("EUR");
        await sleep(2000);
        await currencySelect.selectOption("COP");
        await sleep(1800);

        // Activar y desactivar Alto Contraste WCAG AAA
        const contrastBtn = page
          .locator("header button[aria-pressed]")
          .first();
        await contrastBtn.click();
        await sleep(4500);
        await smoothScroll(page, 220);
        await sleep(2000);
        await smoothScroll(page, -220);
        await sleep(1200);
        await contrastBtn.click();
        await sleep(1500);
      }
    );

    // Escena 03: Mapa + Simulador de Arroyos + Rutas Seguras
    await recordScene(
      browser,
      "03-mapa-simulador",
      durationById["03-mapa-simulador"] || 35,
      async (page) => {
        await sleep(2000);

        // Abrir el Simulador (boton amarillo en header)
        const simBtn = page.getByRole("button", { name: /Simulador/i });
        await simBtn.click();
        await sleep(2200);

        // Seleccionar escenario "Lluvia fuerte + alerta de arroyos"
        const rainBtn = page.getByRole("button", {
          name: /Lluvia fuerte/i,
        });
        await rainBtn.click();
        await sleep(2600);

        // Cerrar drawer del simulador
        const closeBtn = page
          .locator("dialog button[aria-label*='Cerrar'], dialog button:has-text('Cerrar')")
          .first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
        } else {
          await page.keyboard.press("Escape");
        }
        await sleep(2200);

        // Mostrar banner rojo de arroyos + comparador de rutas + reportes
        await smoothScroll(page, 380);
        await sleep(4000);
        await smoothScroll(page, 360);
        await sleep(3500);

        // Abrir brevemente modal de Reporte Ciudadano
        const reportBtn = page.getByRole("button", { name: /Reportar/i });
        if (await reportBtn.isVisible().catch(() => false)) {
          await reportBtn.click();
          await sleep(3200);
          await page.keyboard.press("Escape");
          await sleep(1500);
        }

        await smoothScroll(page, -740);
      }
    );

    // Restaurar a Operacion normal antes de grabar Eventos
    await setScenarioSilent(browser, /Operación normal/i);

    // Escena 04: Eventos 2034
    await recordScene(
      browser,
      "04-eventos",
      durationById["04-eventos"] || 24,
      async (page) => {
        await sleep(1000);
        const eventsTab = page.locator("nav button", { hasText: /Eventos/i });
        await eventsTab.click();
        await sleep(2500);

        await smoothScroll(page, 420);
        await sleep(3200);
        await smoothScroll(page, 420);
        await sleep(3200);
        await smoothScroll(page, 420);
        await sleep(3000);
        await smoothScroll(page, -600);
      }
    );

    // Escena 05: Explorar + Asistencia
    await recordScene(
      browser,
      "05-explorar-asistencia",
      durationById["05-explorar-asistencia"] || 28,
      async (page) => {
        await sleep(800);
        const exploreTab = page.locator("nav button", { hasText: /Explorar/i });
        await exploreTab.click();
        await sleep(2400);

        // Tocar un par de chips de categoria si existen
        const pills = page.locator("main button[aria-pressed]");
        const pillCount = await pills.count();
        if (pillCount > 2) {
          await pills.nth(1).click();
          await sleep(2000);
          await pills.nth(2).click();
          await sleep(2000);
          await pills.nth(0).click();
          await sleep(1500);
        }

        await smoothScroll(page, 360);
        await sleep(2200);

        // Cambiar a Asistencia
        const assistTab = page.locator("nav button", {
          hasText: /Asistencia/i,
        });
        await assistTab.click();
        await sleep(2500);

        await smoothScroll(page, 380);
        await sleep(3200);
        await smoothScroll(page, 380);
        await sleep(3200);
      }
    );
  } finally {
    await browser.close();
  }

  console.log("\nTodos los clips de pantalla fueron grabados correctamente.");
}

main().catch((err) => {
  console.error("Error grabando clips:", err);
  process.exit(1);
});
