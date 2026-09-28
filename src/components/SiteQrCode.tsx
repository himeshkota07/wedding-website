import QRCode from "qrcode";

export default async function SiteQrCode() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 1,
    width: 148,
    color: { dark: "#3d2517", light: "#fbf3e2" },
  });

  return (
    <figure className="flex items-center gap-5">
      <div className="shrink-0 bg-paper p-2 ring-1 ring-brass" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className="max-w-[22ch] text-paper/85">
        Scan to open this site on another phone, or print it on an invite.
      </figcaption>
    </figure>
  );
}
