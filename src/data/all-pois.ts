// Agregador de POIs — reúne las 7 capas (Turismo, Cultura, Comercio, Ambiente, Salud, Seguridad, Movilidad)
import type { Poi } from "@/types/bq360";
import { EXPLORE_POIS } from "@/data/explore-pois";
import { ASSISTANCE_POIS } from "@/data/assistance-pois";
import { MOBILITY_POIS } from "@/data/mobility-pois";

export const ALL_POIS: Poi[] = [
  ...EXPLORE_POIS,
  ...ASSISTANCE_POIS,
  ...MOBILITY_POIS,
];
