import type { LocalizedText, Poi } from "@/types/bq360";

export type ExploreCategory = "turismo" | "cultura" | "comercio" | "ambiente";

export type CoordAccuracy = "verified" | "reference";

export type AccessibilityTag =
  | "ramp"
  | "stepFree"
  | "elevator"
  | "accessibleRestroom"
  | "accessibleParking"
  | "audioGuide"
  | "visualSupport"
  | "signLanguage";

export type SustainabilityTag =
  | "greenArea"
  | "shade"
  | "hydration"
  | "recycling"
  | "localEconomy"
  | "handmade"
  | "lowImpact"
  | "biodegradable"
  | "arroyoInfo"
  | "culturalHeritage"
  | "publicSpace"
  | "family"
  | "river"
  | "carnival"
  | "food";

export interface ExplorePoi extends Poi {
  category: ExploreCategory;
  coordAccuracy: CoordAccuracy;
  image?: string;
  locationNote?: LocalizedText;
  priceNote?: LocalizedText;
  accessibilityTags: AccessibilityTag[];
  sustainabilityTags: SustainabilityTag[];
}

const referencePriceNote: LocalizedText = {
  es: "Precio referencial; confirma en el sitio.",
  en: "Reference price; confirm at the venue.",
  pt: "Preço referencial; confirme no local.",
  fr: "Prix indicatif ; à confirmer sur place.",
};

const casaCarnavalNote: LocalizedText = {
  es: "Coordenada referencial de la manzana; confirma la entrada exacta en el sitio.",
  en: "Reference coordinate for the block; confirm the exact entrance on site.",
  pt: "Coordenada referencial da quadra; confirme a entrada exata no local.",
  fr: "Coordonnée indicative du pâté de maisons ; confirmez l’entrée exacte sur place.",
};

const hydrationNote: LocalizedText = {
  es: "Punto de referencia del Gran Malecón; la ubicación exacta del punto de hidratación puede variar.",
  en: "Gran Malecón reference point; the exact hydration station may vary.",
  pt: "Ponto de referência do Gran Malecón; o local exato da hidratação pode variar.",
  fr: "Point de référence du Gran Malecón ; l’emplacement exact de l’hydratation peut varier.",
};

const arroyoNote: LocalizedText = {
  es: "Punto de referencia ciudadana para prevención de arroyos; no es una estación única verificada.",
  en: "Citizen reference point for arroyo prevention; it is not a single verified station.",
  pt: "Ponto de referência cidadã para prevenção de enxurradas; não é uma estação única verificada.",
  fr: "Point de référence citoyen pour la prévention des arroyos ; ce n’est pas une station unique vérifiée.",
};

export const EXPLORE_POIS: ExplorePoi[] = [
  {
    id: "gran-malecon",
    layer: "turismo",
    category: "turismo",
    coordAccuracy: "verified",
    name: {
      es: "Gran Malecón del Río",
      en: "Gran Malecón Riverfront",
      pt: "Gran Malecón do Rio",
      fr: "Gran Malecón du fleuve",
    },
    description: {
      es: "Paseo ribereño abierto con miradores, gastronomía y espacios para caminar junto al Magdalena.",
      en: "Open riverfront promenade with viewpoints, food and walking areas beside the Magdalena River.",
      pt: "Passeio ribeirinho aberto com mirantes, gastronomia e áreas para caminhar ao lado do Magdalena.",
      fr: "Promenade ouverte au bord du fleuve avec belvédères, restauration et espaces de marche le long du Magdalena.",
    },
    address: "Vía 40, Puerta de Oro",
    coords: { lat: 11.0258914, lng: -74.7988017 },
    priceCop: 0,
    accessible: true,
    tags: ["ramp", "stepFree", "accessibleParking", "greenArea", "shade", "river", "publicSpace", "family"],
    accessibilityTags: ["ramp", "stepFree", "accessibleParking"],
    sustainabilityTags: ["greenArea", "shade", "river", "publicSpace", "family"],
  },
  {
    id: "ventana-al-mundo",
    layer: "turismo",
    category: "turismo",
    coordAccuracy: "verified",
    name: {
      es: "Ventana al Mundo",
      en: "Window to the World",
      pt: "Janela para o Mundo",
      fr: "Fenêtre sur le monde",
    },
    description: {
      es: "Monumento de colores junto al río, pensado como símbolo de apertura de Barranquilla al mundo.",
      en: "Colorful monument by the river, conceived as a symbol of Barranquilla’s openness to the world.",
      pt: "Monumento colorido à beira do rio, pensado como símbolo da abertura de Barranquilla ao mundo.",
      fr: "Monument coloré au bord du fleuve, symbole de l’ouverture de Barranquilla au monde.",
    },
    address: "Vía 40 con calle 110, Puerta de Oro",
    coords: { lat: 11.03313, lng: -74.83142 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "publicSpace", "river", "culturalHeritage"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["publicSpace", "river", "culturalHeritage"],
  },
  {
    id: "aleta-del-tiburon",
    layer: "turismo",
    category: "turismo",
    coordAccuracy: "verified",
    name: {
      es: "Aleta del Tiburón",
      en: "Shark Fin",
      pt: "Barbatana do Tubarão",
      fr: "Aileron de requin",
    },
    description: {
      es: "Escultura urbana de gran formato que se ha convertido en un punto de encuentro y foto en la ribera.",
      en: "Large urban sculpture that has become a riverside meeting point and photo stop.",
      pt: "Escultura urbana de grande formato que se tornou ponto de encontro e foto na beira do rio.",
      fr: "Grande sculpture urbaine devenue un point de rencontre et de photo au bord du fleuve.",
    },
    address: "Vía 40, sector norte",
    coords: { lat: 10.9983168, lng: -74.7727638 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "publicSpace", "river", "culturalHeritage"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["publicSpace", "river", "culturalHeritage"],
  },
  {
    id: "intendencia-fluvial",
    layer: "turismo",
    category: "turismo",
    coordAccuracy: "verified",
    name: {
      es: "Intendencia Fluvial",
      en: "River Port Authority",
      pt: "Intendência Fluvial",
      fr: "Intendance fluviale",
    },
    description: {
      es: "Edificio patrimonial restaurado en la ribera, hoy espacio cultural y referencia arquitectónica de la ciudad.",
      en: "Restored heritage building on the riverfront, now a cultural space and architectural landmark.",
      pt: "Edifício patrimonial restaurado na beira do rio, hoje espaço cultural e referência arquitetônica.",
      fr: "Bâtiment patrimonial restauré au bord du fleuve, aujourd’hui espace culturel et repère architectural.",
    },
    address: "Vía 40 #36-135",
    coords: { lat: 10.98578, lng: -74.77581 },
    priceCop: 0,
    tags: ["culturalHeritage", "publicSpace"],
    accessibilityTags: [],
    sustainabilityTags: ["culturalHeritage", "publicSpace"],
  },
  {
    id: "plaza-de-la-paz",
    layer: "turismo",
    category: "turismo",
    coordAccuracy: "verified",
    name: {
      es: "Plaza de la Paz",
      en: "Plaza de la Paz",
      pt: "Praça da Paz",
      fr: "Plaza de la Paz",
    },
    description: {
      es: "Plaza cívica del centro histórico, rodeada de edificios institucionales y cerca de la Catedral.",
      en: "Civic square in the historic center, surrounded by institutional buildings and near the Cathedral.",
      pt: "Praça cívica do centro histórico, cercada por edifícios institucionais e perto da Catedral.",
      fr: "Place civique du centre historique, entourée de bâtiments institutionnels et proche de la cathédrale.",
    },
    address: "Carrera 54 con calle 50, Centro Histórico",
    coords: { lat: 10.9880922, lng: -74.7894142 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "ramp", "publicSpace", "culturalHeritage", "family", "shade"],
    accessibilityTags: ["stepFree", "ramp"],
    sustainabilityTags: ["publicSpace", "culturalHeritage", "family", "shade"],
  },
  {
    id: "museo-del-carnaval",
    layer: "cultura",
    category: "cultura",
    coordAccuracy: "verified",
    name: {
      es: "Museo del Carnaval",
      en: "Carnival Museum",
      pt: "Museu do Carnaval",
      fr: "Musée du Carnaval",
    },
    description: {
      es: "Museo dedicado a la historia, los personajes y la memoria del Carnaval de Barranquilla.",
      en: "Museum devoted to the history, characters and memory of the Barranquilla Carnival.",
      pt: "Museu dedicado à história, aos personagens e à memória do Carnaval de Barranquilla.",
      fr: "Musée consacré à l’histoire, aux personnages et à la mémoire du Carnaval de Barranquilla.",
    },
    address: "Carrera 54 #49B-03, Barrio Abajo",
    coords: { lat: 10.9928358, lng: -74.7876742 },
    tags: ["culturalHeritage", "carnival", "family"],
    accessibilityTags: [],
    sustainabilityTags: ["culturalHeritage", "carnival", "family"],
  },
  {
    id: "barrio-abajo",
    layer: "cultura",
    category: "cultura",
    coordAccuracy: "verified",
    name: {
      es: "Barrio Abajo",
      en: "Barrio Abajo",
      pt: "Barrio Abajo",
      fr: "Barrio Abajo",
    },
    description: {
      es: "Corredor cultural y gastronómico tradicional, cuna de expresiones del Carnaval y la vida de barrio.",
      en: "Traditional cultural and food corridor, home to Carnival expressions and neighborhood life.",
      pt: "Corredor cultural e gastronômico tradicional, berço de expressões do Carnaval e da vida de bairro.",
      fr: "Corridor culturel et gastronomique traditionnel, berceau des expressions du Carnaval et de la vie de quartier.",
    },
    address: "Carrera 50B, Barrio Abajo",
    coords: { lat: 10.9909327, lng: -74.7843801 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "culturalHeritage", "carnival", "localEconomy", "food", "publicSpace"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["culturalHeritage", "carnival", "localEconomy", "food", "publicSpace"],
  },
  {
    id: "casa-del-carnaval",
    layer: "cultura",
    category: "cultura",
    coordAccuracy: "reference",
    name: {
      es: "Casa del Carnaval",
      en: "Carnival House",
      pt: "Casa do Carnaval",
      fr: "Maison du Carnaval",
    },
    description: {
      es: "Sede de encuentro y difusión de la fiesta, con actividades culturales durante todo el año.",
      en: "Meeting and outreach venue for the festival, with cultural activities throughout the year.",
      pt: "Sede de encontro e difusão da festa, com atividades culturais durante todo o ano.",
      fr: "Lieu de rencontre et de diffusion de la fête, avec des activités culturelles toute l’année.",
    },
    address: "Carrera 54 #49B-39, Barrio Abajo",
    coords: { lat: 10.99275, lng: -74.78745 },
    priceCop: 0,
    locationNote: casaCarnavalNote,
    tags: ["culturalHeritage", "carnival", "family"],
    accessibilityTags: [],
    sustainabilityTags: ["culturalHeritage", "carnival", "family"],
  },
  {
    id: "teatro-amira-de-la-rosa",
    layer: "cultura",
    category: "cultura",
    coordAccuracy: "verified",
    name: {
      es: "Teatro Amira de la Rosa",
      en: "Amira de la Rosa Theater",
      pt: "Teatro Amira de la Rosa",
      fr: "Théâtre Amira de la Rosa",
    },
    description: {
      es: "Teatro histórico del centro, escenario de artes escénicas, música y programación cultural.",
      en: "Historic downtown theater for performing arts, music and cultural programming.",
      pt: "Teatro histórico do centro, palco de artes cênicas, música e programação cultural.",
      fr: "Théâtre historique du centre, scène des arts du spectacle, de la musique et de la programmation culturelle.",
    },
    address: "Carrera 54, Centro Histórico",
    coords: { lat: 10.9934507, lng: -74.7896481 },
    accessible: true,
    tags: ["stepFree", "culturalHeritage", "publicSpace"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["culturalHeritage", "publicSpace"],
  },
  {
    id: "cinemateca-del-caribe",
    layer: "cultura",
    category: "cultura",
    coordAccuracy: "verified",
    name: {
      es: "Cinemateca del Caribe",
      en: "Cinemateca del Caribe",
      pt: "Cinemateca del Caribe",
      fr: "Cinemateca del Caribe",
    },
    description: {
      es: "Sala de cine dedicada al cine de autor, latinoamericano y caribeño en el sector Country.",
      en: "Cinema dedicated to auteur, Latin American and Caribbean film in the Country area.",
      pt: "Sala de cinema dedicada ao cinema de autor, latino-americano e caribenho na região Country.",
      fr: "Cinéma consacré au cinéma d’auteur, latino-américain et caribéen dans le quartier Country.",
    },
    address: "Calle 76 #57-61, Country",
    coords: { lat: 11.0055967, lng: -74.8022166 },
    accessible: true,
    tags: ["stepFree", "elevator", "accessibleRestroom", "accessibleParking", "culturalHeritage", "publicSpace"],
    accessibilityTags: ["stepFree", "elevator", "accessibleRestroom", "accessibleParking"],
    sustainabilityTags: ["culturalHeritage", "publicSpace"],
  },
  {
    id: "galeria-72",
    layer: "comercio",
    category: "comercio",
    coordAccuracy: "verified",
    name: {
      es: "Galería 72 Artesanal y Comercial",
      en: "Galería 72 Crafts and Market",
      pt: "Galería 72 Artesanal e Comercial",
      fr: "Galería 72 Artisanat et Commerce",
    },
    description: {
      es: "Galería comercial con artesanías, productos locales y emprendimientos del centro de la ciudad.",
      en: "Market gallery with crafts, local products and downtown entrepreneurs.",
      pt: "Galeria comercial com artesanato, produtos locais e empreendimentos do centro.",
      fr: "Galerie commerciale avec artisanat, produits locaux et entrepreneurs du centre-ville.",
    },
    address: "Calle 72, Centro",
    coords: { lat: 10.9941233, lng: -74.8061062 },
    priceCop: 20000,
    priceNote: referencePriceNote,
    isPopularEconomy: true,
    accessible: true,
    tags: ["stepFree", "localEconomy", "handmade", "culturalHeritage"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["localEconomy", "handmade", "culturalHeritage"],
  },
  {
    id: "la-cueva",
    layer: "comercio",
    category: "comercio",
    coordAccuracy: "verified",
    name: {
      es: "La Cueva",
      en: "La Cueva",
      pt: "La Cueva",
      fr: "La Cueva",
    },
    description: {
      es: "Restaurante tradicional con cocina del Caribe y una historia ligada a la vida cultural de Barranquilla.",
      en: "Traditional restaurant with Caribbean cooking and a history tied to Barranquilla’s cultural life.",
      pt: "Restaurante tradicional com cozinha caribenha e uma história ligada à vida cultural de Barranquilla.",
      fr: "Restaurant traditionnel de cuisine caribéenne, lié à l’histoire culturelle de Barranquilla.",
    },
    address: "Carrera 43 #59-03",
    coords: { lat: 10.9856187, lng: -74.7964784 },
    priceCop: 45000,
    priceNote: referencePriceNote,
    accessible: true,
    tags: ["stepFree", "localEconomy", "food", "culturalHeritage"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["localEconomy", "food", "culturalHeritage"],
  },
  {
    id: "mercado-publico-del-caribe",
    layer: "comercio",
    category: "comercio",
    coordAccuracy: "verified",
    name: {
      es: "Mercado Público del Caribe",
      en: "Caribbean Public Market",
      pt: "Mercado Público do Caribe",
      fr: "Marché public des Caraïbes",
    },
    description: {
      es: "Mercado de productos y cocina local, ideal para probar sabores tradicionales como el arroz de lisa.",
      en: "Market for local produce and cooking, ideal for traditional flavors such as arroz de lisa.",
      pt: "Mercado de produtos e cozinha local, ideal para sabores tradicionais como o arroz de lisa.",
      fr: "Marché de produits et de cuisine locale, idéal pour des saveurs traditionnelles comme l’arroz de lisa.",
    },
    address: "Calle 34B #45C-40",
    coords: { lat: 10.9853559, lng: -74.7775807 },
    priceCop: 18000,
    priceNote: referencePriceNote,
    isPopularEconomy: true,
    accessible: true,
    tags: ["stepFree", "localEconomy", "food", "culturalHeritage"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["localEconomy", "food", "culturalHeritage"],
  },
  {
    id: "narcobollo",
    layer: "comercio",
    category: "comercio",
    coordAccuracy: "verified",
    name: {
      es: "Narcobollo",
      en: "Narcobollo",
      pt: "Narcobollo",
      fr: "Narcobollo",
    },
    description: {
      es: "Punto reconocido de arepa e’ huevo y comida rápida local, con precios de referencia para visitantes.",
      en: "Well-known spot for arepa e’ huevo and local fast food, with reference prices for visitors.",
      pt: "Ponto conhecido de arepa e’ huevo e comida rápida local, com preços de referência para visitantes.",
      fr: "Adresse connue pour l’arepa e’ huevo et la restauration rapide locale, avec des prix indicatifs.",
    },
    address: "Carrera 43 #84-188",
    coords: { lat: 10.9990596, lng: -74.821849 },
    priceCop: 7000,
    priceNote: referencePriceNote,
    isPopularEconomy: true,
    tags: ["localEconomy", "food", "handmade"],
    accessibilityTags: [],
    sustainabilityTags: ["localEconomy", "food", "handmade"],
  },
  {
    id: "manglares-del-rio",
    layer: "comercio",
    category: "comercio",
    coordAccuracy: "verified",
    name: {
      es: "Manglares del Río",
      en: "Manglares del Río",
      pt: "Manglares del Río",
      fr: "Manglares del Río",
    },
    description: {
      es: "Zona comercial de emprendedores y productos locales junto al río, con oferta gastronómica y artesanal.",
      en: "Commercial area for local entrepreneurs and products by the river, with food and crafts.",
      pt: "Área comercial de empreendedores e produtos locais junto ao rio, com gastronomia e artesanato.",
      fr: "Espace commercial d’entrepreneurs et de produits locaux au bord du fleuve, avec restauration et artisanat.",
    },
    address: "Vía 40, zona comercial Manglares del Río",
    coords: { lat: 11.0202966, lng: -74.7929489 },
    priceCop: 15000,
    priceNote: referencePriceNote,
    isPopularEconomy: true,
    accessible: true,
    tags: ["stepFree", "accessibleParking", "localEconomy", "handmade", "greenArea", "river", "family"],
    accessibilityTags: ["stepFree", "accessibleParking"],
    sustainabilityTags: ["localEconomy", "handmade", "greenArea", "river", "family"],
  },
  {
    id: "parque-venezuela",
    layer: "ambiente",
    category: "ambiente",
    coordAccuracy: "verified",
    name: {
      es: "Parque Venezuela",
      en: "Venezuela Park",
      pt: "Parque Venezuela",
      fr: "Parc Venezuela",
    },
    description: {
      es: "Parque urbano con árboles y espacios de descanso, útil como pausa de sombra en trayectos largos.",
      en: "Urban park with trees and resting areas, useful as a shade break on long walks.",
      pt: "Parque urbano com árvores e áreas de descanso, útil como pausa de sombra em trajetos longos.",
      fr: "Parc urbain avec arbres et espaces de repos, utile comme pause d’ombre lors de longues marches.",
    },
    address: "Carrera 54 con calle 74",
    coords: { lat: 11.0014556, lng: -74.8241723 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "ramp", "greenArea", "shade", "publicSpace", "family"],
    accessibilityTags: ["stepFree", "ramp"],
    sustainabilityTags: ["greenArea", "shade", "publicSpace", "family"],
  },
  {
    id: "parque-sagrado-corazon",
    layer: "ambiente",
    category: "ambiente",
    coordAccuracy: "verified",
    name: {
      es: "Parque Sagrado Corazón",
      en: "Sagrado Corazón Park",
      pt: "Parque Sagrado Coração",
      fr: "Parc Sagrado Corazón",
    },
    description: {
      es: "Parque de barrio con vegetación y recorridos cortos, apropiado para descansar y caminar con sombra.",
      en: "Neighborhood park with vegetation and short paths, suitable for resting and walking in shade.",
      pt: "Parque de bairro com vegetação e caminhos curtos, adequado para descansar e caminhar com sombra.",
      fr: "Parc de quartier avec végétation et courts sentiers, idéal pour se reposer et marcher à l’ombre.",
    },
    address: "Sector Alto Prado",
    coords: { lat: 10.9935946, lng: -74.8181115 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "greenArea", "shade", "publicSpace", "family"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["greenArea", "shade", "publicSpace", "family"],
  },
  {
    id: "punto-hidratacion-malecon",
    layer: "ambiente",
    category: "ambiente",
    coordAccuracy: "reference",
    name: {
      es: "Punto de Hidratación Gran Malecón",
      en: "Gran Malecón Hydration Point",
      pt: "Ponto de Hidratação Gran Malecón",
      fr: "Point d’hydratation Gran Malecón",
    },
    description: {
      es: "Referencia para hidratación y sombra durante el recorrido del Malecón, clave en días de calor extremo.",
      en: "Reference for hydration and shade along the Malecón, key on extreme heat days.",
      pt: "Referência para hidratação e sombra ao longo do Malecón, essencial em dias de calor extremo.",
      fr: "Référence pour l’hydratation et l’ombre le long du Malecón, essentielle par forte chaleur.",
    },
    address: "Gran Malecón, Puerta de Oro",
    coords: { lat: 11.0258914, lng: -74.7988017 },
    priceCop: 0,
    accessible: true,
    locationNote: hydrationNote,
    tags: ["stepFree", "hydration", "shade", "publicSpace", "river"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["hydration", "shade", "publicSpace", "river"],
  },
  {
    id: "parque-suri-salcedo",
    layer: "ambiente",
    category: "ambiente",
    coordAccuracy: "verified",
    name: {
      es: "Parque Surí Salcedo",
      en: "Surí Salcedo Park",
      pt: "Parque Surí Salcedo",
      fr: "Parc Surí Salcedo",
    },
    description: {
      es: "Parque tradicional con zonas verdes y sombra, punto de encuentro para caminar y descansar.",
      en: "Traditional park with green areas and shade, a meeting point for walking and resting.",
      pt: "Parque tradicional com áreas verdes e sombra, ponto de encontro para caminhar e descansar.",
      fr: "Parc traditionnel avec espaces verts et ombre, lieu de rencontre pour marcher et se reposer.",
    },
    address: "Carrera 47, Surí Salcedo",
    coords: { lat: 10.9940916, lng: -74.8042663 },
    priceCop: 0,
    accessible: true,
    tags: ["stepFree", "ramp", "greenArea", "shade", "publicSpace", "family"],
    accessibilityTags: ["stepFree", "ramp"],
    sustainabilityTags: ["greenArea", "shade", "publicSpace", "family"],
  },
  {
    id: "punto-reciclaje-arroyos",
    layer: "ambiente",
    category: "ambiente",
    coordAccuracy: "reference",
    name: {
      es: "Punto de Reciclaje y Prevención de Arroyos",
      en: "Recycling and Arroyo Prevention Point",
      pt: "Ponto de Reciclagem e Prevenção de Enxurradas",
      fr: "Point de recyclage et prévention des arroyos",
    },
    description: {
      es: "Punto de referencia para separar residuos y consultar recomendaciones ante lluvias y arroyos.",
      en: "Reference point to sort waste and check recommendations during rain and arroyos.",
      pt: "Ponto de referência para separar resíduos e consultar recomendações em chuvas e enxurradas.",
      fr: "Point de référence pour trier les déchets et consulter les recommandations en cas de pluie et d’arroyos.",
    },
    address: "Gran Malecón, sector Nativo",
    coords: { lat: 11.0167433, lng: -74.7895621 },
    priceCop: 0,
    accessible: true,
    locationNote: arroyoNote,
    tags: ["stepFree", "recycling", "arroyoInfo", "lowImpact", "publicSpace"],
    accessibilityTags: ["stepFree"],
    sustainabilityTags: ["recycling", "arroyoInfo", "lowImpact", "publicSpace"],
  },
];
