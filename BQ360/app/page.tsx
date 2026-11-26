"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Accessibility,
  Bell,
  Bus,
  CalendarDays,
  ChevronRight,
  CloudSun,
  Crosshair,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  MapPin,
  Menu,
  Navigation,
  Recycle,
  Route,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  Utensils,
  X,
} from "lucide-react"

const modules = [
  { name: "Moverse", short: "Move", icon: Bus, color: "yellow" },
  { name: "Explorar", short: "Explore", icon: Landmark, color: "blue" },
  { name: "Cuidarte", short: "Safe", icon: ShieldCheck, color: "red" },
  { name: "Comprar", short: "Market", icon: ShoppingBag, color: "green" },
]

const mapFilters = [
  { name: "Todo", icon: MapPin },
  { name: "Movilidad", icon: Bus },
  { name: "Cultura", icon: Landmark },
  { name: "Comercio", icon: Utensils },
  { name: "Accesible", icon: Accessibility },
]

export default function BQ360Home() {
  const [mapOpen, setMapOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("Todo")
  const [mapQuery, setMapQuery] = useState("Barranquilla, Colombia")

  return (
    <main className="bq-app">
      <header className="bq-header">
        <button className="bq-icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
        <Link href="/" className="bq-brand" aria-label="Inicio BQ360"><span>BQ</span><strong>360</strong></Link>
        <button className="bq-icon-button notification-button" aria-label="Notificaciones"><Bell size={20} /><span /></button>
      </header>

      <section className="bq-content">
        <div className="bq-greeting">
          <div><p>Buenos dias,</p><h1>Quillero/a</h1></div>
          <button className="weather-pill" aria-label="Estado del clima"><CloudSun size={18} /><span>31°</span></button>
        </div>

        <button className="bq-search" onClick={() => setMapOpen(true)}><Search size={19} /><span>¿A dónde quieres ir hoy?</span></button>

        <section className="quick-map" aria-label="Vista rapida del mapa">
          <iframe
            className="bq-map-frame"
            title="Mapa de Barranquilla"
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-status"><span className="live-dot" /><span>La ciudad se mueve bien</span></div>
          <button className="open-map" onClick={() => setMapOpen(true)}><Navigation size={17} /> Abrir mapa</button>
        </section>

        <section className="module-section">
          <div className="section-heading"><div><p>Para tu dia</p><h2>Explora Barranquilla</h2></div><button aria-label="Ver todos los modulos"><ChevronRight size={21} /></button></div>
          <div className="module-grid">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <button className={`module-card module-${module.color}`} key={module.name} onClick={() => setMapOpen(true)}>
                  <span className="module-icon"><Icon size={23} /></span>
                  <span><small>{module.short}</small><strong>{module.name}</strong></span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="city-status">
          <div className="section-heading compact"><div><p>En tiempo real</p><h2>Estado de la ciudad</h2></div></div>
          <div className="status-grid">
            <button><span className="status-icon green"><Route size={20} /></span><span><small>Movilidad</small><strong>Sin congestión</strong></span></button>
            <button><span className="status-icon blue"><Recycle size={20} /></span><span><small>Ambiental</small><strong>Calidad buena</strong></span></button>
          </div>
        </section>

        <section className="nearby-section">
          <div className="section-heading compact"><div><p>Cerca de ti</p><h2>Lo mejor hoy</h2></div><button aria-label="Ver mas"><ChevronRight size={21} /></button></div>
          <div className="event-strip">
            <article className="event-card event-red"><span className="event-tag">Cultura</span><h3>Gran Malecón</h3><p><MapPin size={14} /> Río Magdalena</p><button>Ver ruta <ChevronRight size={14} /></button></article>
            <article className="event-card event-yellow"><span className="event-tag">Comercios</span><h3>Sazón costeña</h3><p><MapPin size={14} /> Centro histórico</p><button>Descubrir <ChevronRight size={14} /></button></article>
          </div>
        </section>
      </section>

      <nav className="bq-nav" aria-label="Navegacion principal">
        <button className="active"><Home size={21} /><span>Inicio</span></button>
        <button onClick={() => setMapOpen(true)}><MapPin size={21} /><span>Mapa</span></button>
        <button className="nav-create" onClick={() => setMapOpen(true)} aria-label="Crear reporte"><span><Crosshair size={23} /></span></button>
        <Link href="/events"><CalendarDays size={21} /><span>Agenda</span></Link>
        <Link href="/profile"><Users size={21} /><span>Perfil</span></Link>
      </nav>

      {menuOpen && (
        <div className="bq-menu" role="dialog" aria-modal="true" aria-label="Menu principal">
          <button className="bq-menu-backdrop" aria-label="Cerrar menu" onClick={() => setMenuOpen(false)} />
          <aside>
            <div className="bq-menu-brand"><span>BQ</span><strong>360</strong></div>
            <p className="bq-menu-kicker">Barranquilla conectada</p>
            <button onClick={() => setMapOpen(true)}><Navigation size={20} /><span>Explorar la ciudad</span></button>
            <Link href="/events"><CalendarDays size={20} /><span>Agenda cultural</span></Link>
            <Link href="/groups"><Users size={20} /><span>Comunidades</span></Link>
            <Link href="/profile"><ShieldCheck size={20} /><span>Mi perfil</span></Link>
            <button className="bq-menu-close" onClick={() => setMenuOpen(false)}><X size={18} /> Cerrar</button>
          </aside>
        </div>
      )}

      {mapOpen && (
        <section className="map-screen" role="dialog" aria-modal="true" aria-label="Mapa de Barranquilla">
          <div className="city-pattern map-full">
            <iframe
              className="bq-map-frame bq-map-frame-full"
              title="Mapa completo de Barranquilla"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="animated-route route-a" /><span className="animated-route route-b" /><span className="animated-route route-c" />
            <span className="river river-one" /><span className="river river-two" />
            <span className="district district-a" /><span className="district district-b" /><span className="district district-c" />
            <span className="map-pin pin-a"><Landmark size={19} /></span><span className="map-pin pin-b"><Bus size={19} /></span>
            <span className="map-pin pin-c"><Utensils size={19} /></span><span className="map-pin pin-d"><HeartPulse size={19} /></span><span className="map-pin pin-e"><Recycle size={19} /></span>
          </div>
          <header className="map-header">
            <button className="bq-icon-button" onClick={() => setMapOpen(false)} aria-label="Cerrar mapa"><X size={21} /></button>
            <div className="map-search"><Search size={17} /><span>Buscar lugar o servicio</span></div>
          </header>
          <div className="map-filters">
            {mapFilters.map((filter) => {
              const Icon = filter.icon
              return <button key={filter.name} className={activeFilter === filter.name ? "active" : ""} onClick={() => {
                setActiveFilter(filter.name)
                const queries: Record<string, string> = {
                  Todo: "Barranquilla, Colombia",
                  Movilidad: "Transmetro Barranquilla",
                  Cultura: "Gran Malecón del Río Barranquilla",
                  Comercio: "Centro Histórico Barranquilla",
                  Accesible: "Barranquilla Colombia rutas accesibles",
                }
                setMapQuery(queries[filter.name])
              }}><Icon size={15} /> {filter.name}</button>
            })}
          </div>
          <button className="locate-button" aria-label="Usar mi ubicacion"><Crosshair size={20} /></button>
          <div className="map-detail">
            <div className="drag-handle" />
            <p>Recomendación BQ360</p>
            <h2>{activeFilter === "Todo" ? "Barranquilla te espera" : `${activeFilter} alrededor`}</h2>
            <div className="map-detail-row">
              <span><Navigation size={18} /><small>Ruta segura</small></span>
              <span><Bus size={18} /><small>12 min</small></span>
              <span><Leaf size={18} /><small>Bajo impacto</small></span>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
