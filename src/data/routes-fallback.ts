import type { LatLng, RouteFallback } from "@/types/bq360";

const plaza: LatLng = { lat: 10.9878, lng: -74.7889 };
const metro: LatLng = { lat: 10.9269, lng: -74.8005 };
const malecon: LatLng = { lat: 11.0156, lng: -74.7875 };
const barrioAbajo: LatLng = { lat: 10.9866, lng: -74.7867 };
const romelio: LatLng = { lat: 10.9939, lng: -74.7883 };
const aeropuerto: LatLng = { lat: 10.8896, lng: -74.7808 };

export const ROUTES_FALLBACK: RouteFallback[] = [
  {
    id: "plaza-metro",
    fromLabel: "Plaza de la Paz",
    toLabel: "Estadio Metropolitano",
    directPath: [plaza, { lat: 10.9700, lng: -74.7950 }, { lat: 10.9480, lng: -74.7975 }, metro],
    alternativePath: [plaza, { lat: 10.9810, lng: -74.8020 }, { lat: 10.9520, lng: -74.8110 }, metro],
    directMinutes: 22,
    alternativeMinutes: 27,
    accessibleFriendly: true,
  },
  {
    id: "plaza-malecon",
    fromLabel: "Plaza de la Paz",
    toLabel: "Gran Malecón",
    directPath: [plaza, { lat: 10.9980, lng: -74.7878 }, malecon],
    alternativePath: [plaza, barrioAbajo, { lat: 11.0040, lng: -74.7940 }, malecon],
    directMinutes: 14,
    alternativeMinutes: 17,
    accessibleFriendly: true,
  },
  {
    id: "plaza-romelio",
    fromLabel: "Plaza de la Paz",
    toLabel: "Estadio Romelio Martínez",
    directPath: [plaza, romelio],
    alternativePath: [plaza, { lat: 10.9890, lng: -74.7980 }, romelio],
    directMinutes: 8,
    alternativeMinutes: 10,
    accessibleFriendly: true,
  },
  {
    id: "plaza-aeropuerto",
    fromLabel: "Plaza de la Paz",
    toLabel: "Aeropuerto Ernesto Cortissoz",
    directPath: [plaza, { lat: 10.9550, lng: -74.7860 }, { lat: 10.9180, lng: -74.7830 }, aeropuerto],
    alternativePath: [plaza, { lat: 10.9710, lng: -74.8030 }, { lat: 10.9250, lng: -74.7950 }, aeropuerto],
    directMinutes: 25,
    alternativeMinutes: 31,
    accessibleFriendly: true,
  },
];
