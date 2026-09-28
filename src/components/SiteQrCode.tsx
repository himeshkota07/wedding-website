import QRCode from "qrcode";

export default async function SiteQrCode() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 160 });

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-xl border border-hairline/60 bg-white/80 p-3 shadow-sm backdrop-blur"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="max-w-[160px] text-center text-xs text-foreground/60">
        Scan to visit this site &mdash; handy for printed invites
      </p>
    </div>
  );
}
