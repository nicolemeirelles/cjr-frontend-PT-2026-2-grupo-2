export function timeAgo(iso: string, now = Date.now()) {
  const minutes = Math.max(
    0,
    Math.floor((now - new Date(iso).getTime()) / 60000),
  );
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export const isRating = (v: unknown): v is number =>
  Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5;

export const cleanText = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : undefined;
