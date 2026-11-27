"use client";

import { useEffect, useRef } from "react";
import { useBQ360 } from "@/context/BQ360Context";
import MapTab from "@/features/map/MapTab";
import EventsTab from "@/features/events/EventsTab";
import ExploreTab from "@/features/explore/ExploreTab";
import AssistanceTab from "@/features/assistance/AssistanceTab";
import SimulatorDrawer from "@/features/simulator/SimulatorDrawer";
import TopBar from "@/components/shell/TopBar";
import BottomNav from "@/components/shell/BottomNav";
import ToastBanner from "@/components/shell/ToastBanner";
import NotificationDrawer from "@/components/shell/NotificationDrawer";

export function AppShell() {
  const { activeTab, t } = useBQ360();
  const mainRef = useRef<HTMLElement>(null);

  // Al cambiar de pestaña, vuelve al inicio del área de contenido principal
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="min-h-dvh w-full bg-[var(--surface-backdrop)] sm:flex sm:flex-col sm:items-center sm:justify-center sm:px-4 sm:py-5">
      <div className="bq-shell-frame relative mx-auto flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-white sm:h-[min(calc(100dvh-3.5rem),880px)] sm:rounded-[28px]">
        <a
          href="#main-content"
          className="visually-hidden fixed left-3 top-3 z-50 rounded-lg bg-bq-navy px-3 py-2 text-xs font-bold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bq-yellow"
        >
          {t("shell.skipToContent")}
        </a>

        <TopBar />

        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white focus:outline-none"
        >
          <h1 className="visually-hidden">
            {t(`shell.tab.title.${activeTab}`)}
          </h1>
          {activeTab === "map" && <MapTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "explore" && <ExploreTab />}
          {activeTab === "assistance" && <AssistanceTab />}
        </main>

        <BottomNav />

        <ToastBanner />
        <NotificationDrawer />
        <SimulatorDrawer />
      </div>

      {/* Pie discreto oficial QUIJAM en escritorio (DESIGN.md §2) */}
      <footer className="mt-2.5 hidden w-full max-w-[440px] items-center justify-between px-2 text-[0.6875rem] font-medium text-bq-muted sm:flex">
        <span>QUIJAM · Bootcamp de Innovación</span>
        <span className="font-semibold text-bq-navy">Barranquilla 2034</span>
      </footer>
    </div>
  );
}

export default AppShell;
