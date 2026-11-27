import type { EventInfo, EventsLang } from "@/data/events";
import type { EventsCopy } from "@/i18n/events";
import styles from "./events.module.css";

type EventCardProps = {
  event: EventInfo;
  lang: EventsLang;
  copy: EventsCopy;
  attendance: number;
  weatherLabel: string;
  accessibleRoute: boolean;
  onNavigate?: (destination: { lat: number; lng: number; label: string }) => void;
};

const categoryIcon = {
  deporte: "⚽",
  cultura: "✺",
  fanfest: "▣",
  ciudad: "⌖",
} as const;

export function EventCard({ event, lang, copy, attendance, weatherLabel, accessibleRoute, onNavigate }: EventCardProps) {
  const occupancy = Math.round((attendance / event.capacity) * 100);
  const level = occupancy >= 85 ? "critical" : occupancy >= 65 ? "high" : "normal";
  const levelLabel = level === "critical" ? copy.critical : level === "high" ? copy.high : copy.normal;
  const title = event.name[lang] || event.name.es;
  const destination = `https://www.google.com/maps/dir/?api=1&destination=${event.coords.lat},${event.coords.lng}`;
  const accessLabel = event.accessibleEntry ? copy.accessible : copy.accessUnknown;

  return (
    <article className={`${styles.eventCard} ${styles[`eventCard${level[0].toUpperCase()}${level.slice(1)}`]}`}>
      <div className={styles.eventCardHeader}>
        <span className={`${styles.eventIcon} ${styles[`eventIcon${event.category[0].toUpperCase()}${event.category.slice(1)}`]}`} aria-hidden="true">
          {categoryIcon[event.category]}
        </span>
        <span className={`${styles.levelBadge} ${styles[`level${level[0].toUpperCase()}${level.slice(1)}`]}`}>
          <span className={styles.levelDot} />{levelLabel}
        </span>
      </div>

      <div className={styles.eventTitleBlock}>
        <h3>{title}</h3>
        <p>{event.venue}</p>
      </div>

      <div className={styles.occupancyBlock}>
        <div className={styles.occupancyHeading}>
          <span>{copy.occupancy}</span>
          <strong className={styles[`occupancyText${level[0].toUpperCase()}${level.slice(1)}`]}>{occupancy}%</strong>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`${copy.occupancy}: ${title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(occupancy, 100)}
          aria-valuetext={`${occupancy}% ${copy.occupancy}`}
        >
          <span className={`${styles.progressFill} ${styles[`progress${level[0].toUpperCase()}${level.slice(1)}`]}`} style={{ width: `${Math.min(occupancy, 100)}%` }} />
        </div>
        <div className={styles.peopleRow}>
          <strong>{attendance.toLocaleString(lang === "es" ? "es-CO" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US")}</strong>
          <span>{copy.people}</span>
          <span className={styles.peopleDivider}>/</span>
          <span>{event.capacity.toLocaleString(lang === "es" ? "es-CO" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : "en-US")} {copy.capacity}</span>
        </div>
      </div>

      <div className={styles.eventDetails}>
        <span className={styles.detailPill}><span aria-hidden="true">◷</span>{copy.schedule} · {event.schedule}</span>
        <span className={styles.detailPill}><span aria-hidden="true">☁</span>{weatherLabel}</span>
        <span className={`${styles.detailPill} ${event.accessibleEntry && accessibleRoute ? styles.accessPill : ""}`}>
          <span aria-hidden="true">♿</span>{accessLabel}
        </span>
      </div>

      {onNavigate ? (
        <button
          className={styles.routeButton}
          type="button"
          onClick={() => onNavigate({ ...event.coords, label: title })}
          aria-label={`${copy.goThere}: ${title}`}
        >
          <span>{copy.goThere}</span><span aria-hidden="true">↗</span>
        </button>
      ) : (
        <a className={styles.routeButton} href={destination} target="_blank" rel="noreferrer" aria-label={`${copy.directions}: ${title}`}>
          <span>{copy.directions}</span><span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}
