const GB = 1024;

const data = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatData(megabytes: number): string {
  if (megabytes < GB) return `${data.format(Math.round(megabytes))} MB`;

  return `${data.format(Math.round((megabytes / GB) * 100) / 100)} GB`;
}

const day = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDay(iso: string): string {
  return day.format(new Date(iso));
}

const slashDay = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `12/Dec/2026`. Assembled from parts because no locale separates with slashes. */
export function formatSlashDay(iso: string): string {
  const parts = slashDay.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return `${part("day")}/${part("month")}/${part("year")}`;
}
