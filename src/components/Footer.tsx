import Monogram from "@/components/ui/Monogram";

export default function Footer() {
  return (
    <footer className="border-t border-hairline/50 py-10 text-center">
      <Monogram size={48} className="mb-3 opacity-70" />
      <p className="font-script text-lg italic text-accent-deep">With love</p>
      <p className="mt-1 text-sm text-foreground/60">Made with love for our wedding.</p>
      <p className="mt-4 text-[11px] text-foreground/30">
        Puppet icon by{" "}
        <a href="https://lorcblog.blogspot.com" target="_blank" rel="noopener noreferrer" className="underline">
          Lorc
        </a>{" "}
        via{" "}
        <a href="https://game-icons.net" target="_blank" rel="noopener noreferrer" className="underline">
          game-icons.net
        </a>
        , CC BY 3.0
      </p>
    </footer>
  );
}
