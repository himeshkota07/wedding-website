import QRCode from "qrcode";

export default async function SiteQrCode() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 160 });

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-lg border border-black/10 bg-white p-3"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="max-w-[160px] text-center text-xs text-zinc-500">
        Scan to visit this site &mdash; handy for printed invites
      </p>
    </div>
  );
}
