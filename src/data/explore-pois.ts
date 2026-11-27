// Archivo exclusivo de Dev 4 — Dataset inicial Fase 0 (muestra verificada de Barranquilla)
import type { Poi } from "@/types/bq360";

export const EXPLORE_POIS: Poi[] = [
  {
    id: "poi-gran-malecon",
    layer: "turismo",
    name: {
      es: "Gran Malecón del Río",
      en: "Gran Malecón Riverfront",
      pt: "Gran Malecón do Rio",
      fr: "Gran Malecón du Fleuve",
    },
    description: {
      es: "Corredor turístico y gastronómico de 5 km frente al río Magdalena con zonas accesibles y espacios para Fan Fest.",
      en: "5 km riverside promenade along the Magdalena River featuring accessible walkways, dining, and Fan Fest spaces.",
      pt: "Calçadão turístico e gastronômico de 5 km às margens do rio Magdalena com acessibilidade e áreas de Fan Fest.",
      fr: "Promenade fluviale de 5 km le long du fleuve Magdalena avec accès universel, gastronomie et espaces Fan Fest.",
    },
    address: "Av. del Río, Sector Puerta de Oro, Barranquilla",
    coords: { lat: 11.0156, lng: -74.7875 },
    priceCop: 0,
    isPopularEconomy: false,
    accessible: true,
    tags: ["turismo", "rio", "fanfest", "accesible"],
  },
  {
    id: "poi-museo-carnaval",
    layer: "cultura",
    name: {
      es: "Museo del Carnaval de Barranquilla",
      en: "Barranquilla Carnival Museum",
      pt: "Museu do Carnaval de Barranquilla",
      fr: "Musée du Carnaval de Barranquilla",
    },
    description: {
      es: "Patrimonio vivo de la Unesco en Barrio Abajo con historia, vestuarios, danzas y música tradicional del Caribe.",
      en: "UNESCO living heritage space in Barrio Abajo showcasing Carnival history, costumes, dances, and Caribbean music.",
      pt: "Patrimônio imaterial da UNESCO em Barrio Abajo com história, fantasias, danças e música do Caribe.",
      fr: "Patrimoine immatériel de l'UNESCO à Barrio Abajo présentant l'histoire, les costumes et les danses du Carnaval.",
    },
    address: "Cra. 54 #49B-39, Barrio Abajo, Barranquilla",
    coords: { lat: 10.9866, lng: -74.7867 },
    priceCop: 20000,
    isPopularEconomy: false,
    accessible: true,
    tags: ["cultura", "carnaval", "patrimonio", "barrio-abajo"],
  },
];
