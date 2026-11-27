// Agregador congelado de POIs — Fase 0 (BQ360)
// Combina los datasets independientes de Dev 4 y Dev 5 sin conflictos de merge.
import type { Poi } from "@/types/bq360";
import { EXPLORE_POIS } from "@/data/explore-pois";
import { ASSISTANCE_POIS } from "@/data/assistance-pois";

export const ALL_POIS: Poi[] = [...EXPLORE_POIS, ...ASSISTANCE_POIS];
