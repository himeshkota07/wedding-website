export const WISH_COLORS = {
  haldi: { label: "Haldi", paper: "#f9d98f" },
  blush: { label: "Blush", paper: "#f6cfc4" },
  sage: { label: "Sage", paper: "#dfe5c8" },
  ivory: { label: "Ivory", paper: "#fffdf8" },
} as const;

export type WishColor = keyof typeof WISH_COLORS;

export function isWishColor(value: unknown): value is WishColor {
  return typeof value === "string" && value in WISH_COLORS;
}

export type Wish = {
  id: string;
  name: string;
  relation: string | null;
  message: string;
  created_at: string;
  color: WishColor;
  photo_url: string | null;
};

export const WISH_LIMITS = { name: 80, relation: 80, message: 600 } as const;

// Columns added by migration 0007 (colour + photo). Until it has been run on a
// database, reads and writes fall back to the original columns so the wishes
// section keeps working rather than erroring.
export const WISH_COLUMNS = "id, name, relation, message, created_at, color, photo_url";
export const LEGACY_WISH_COLUMNS = "id, name, relation, message, created_at";

/** Postgres "undefined column" / PostgREST "column not in schema cache": migration 0007 hasn't run yet. */
export function isMissingColumnError(error: { code?: string } | null) {
  return error?.code === "42703" || error?.code === "PGRST204";
}

/** Fill in what pre-0007 rows (or databases) don't have. */
export function withWishDefaults(row: Omit<Wish, "color" | "photo_url"> & Partial<Pick<Wish, "color" | "photo_url">>): Wish {
  return { ...row, color: isWishColor(row.color) ? row.color : "haldi", photo_url: row.photo_url ?? null };
}

export function formatWishDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
