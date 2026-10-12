export type Wish = {
  id: string;
  name: string;
  relation: string | null;
  message: string;
  created_at: string;
};

export const WISH_LIMITS = { name: 80, relation: 80, message: 600 } as const;

export function formatWishDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
