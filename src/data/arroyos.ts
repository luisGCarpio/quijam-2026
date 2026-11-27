import type { ArroyoZone } from "@/types/bq360";

export const ARROYO_ZONES: ArroyoZone[] = [
  {
    id: "arroyo-carrera-21",
    name: "Corredor Carrera 21",
    riskLevel: "critico",
    coords: [
      { lat: 10.9440, lng: -74.8050 },
      { lat: 10.9580, lng: -74.8035 },
      { lat: 10.9740, lng: -74.8015 },
      { lat: 10.9850, lng: -74.7990 },
    ],
  },
  {
    id: "arroyo-calle-76",
    name: "Calle 76 / 84",
    riskLevel: "critico",
    coords: [
      { lat: 11.0010, lng: -74.8090 },
      { lat: 11.0000, lng: -74.7970 },
      { lat: 10.9990, lng: -74.7900 },
    ],
  },
  {
    id: "arroyo-la-felicidad",
    name: "La Felicidad",
    riskLevel: "moderado",
    coords: [
      { lat: 10.9660, lng: -74.7780 },
      { lat: 10.9720, lng: -74.7830 },
      { lat: 10.9780, lng: -74.7880 },
    ],
  },
];
