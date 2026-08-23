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
