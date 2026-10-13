import QRCode from "qrcode";

export default async function SiteQrCode() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 148,
    color: { dark: "#4a2a1d", light: "#fcfaf6" },
  });

  return (
    <figure className="flex items-center gap-5">
      <div className="shrink-0 bg-paper p-2 ring-1 ring-brass" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="max-w-[22ch] text-ink-soft">
        Scan to open this site on another phone, or print it on an invite.
      </figcaption>
    </figure>
  );
}
