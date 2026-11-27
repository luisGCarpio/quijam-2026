import type { TabId } from "@/types/bq360";

const TABS: readonly TabId[] = ["map", "events", "explore", "assistance"];

/** Read a valid tab without changing the current history entry. */
export function readTabFromLocation(): TabId {
  if (typeof window === "undefined") return "map";
  const value = new URL(window.location.href).searchParams.get("tab");
  return TABS.includes(value as TabId) ? (value as TabId) : "map";
}

/** Record an explicit tab change, preserving unrelated query parameters and hash. */
export function navigateTab(tab: TabId): void {
  if (typeof window === "undefined" || readTabFromLocation() === tab) return;
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
