"use client";

import type { ComponentType } from "react";
import { CalendarClock, Compass, Map, ShieldPlus } from "lucide-react";
import { useBQ360 } from "@/context/BQ360Context";
import type { TabId } from "@/types/bq360";

interface NavItem {
  id: TabId;
  labelKey: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "map", labelKey: "shell.tab.map", Icon: Map },
  { id: "events", labelKey: "shell.tab.events", Icon: CalendarClock },
  { id: "explore", labelKey: "shell.tab.explore", Icon: Compass },
  { id: "assistance", labelKey: "shell.tab.assistance", Icon: ShieldPlus },
];

export function BottomNav() {
  const { activeTab, setActiveTab, t } = useBQ360();

  return (
    <nav
      aria-label={t("shell.nav.primary")}
      className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map(({ id, labelKey, Icon }) => {
          const isActive = activeTab === id;

          return (
            <li key={id} className="min-w-0">
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(id)}
                className={`bq-touch-target flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 border-t-[3px] px-1 py-1.5 text-[0.6875rem] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B2545] ${
                  isActive
                    ? "border-[#0B2545] bg-[#0B2545]/[0.04] font-bold text-[#0B2545]"
                    : "border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0B2545]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-[#0B2545]/12 text-[#0B2545]" : ""
                  }`}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={isActive ? 2.4 : 1.85}
                  />
                </span>
                <span className="max-w-full truncate">{t(labelKey)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
