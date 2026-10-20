import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BackgroundMusic from "@/components/BackgroundMusic";
import FloatingChat from "@/components/FloatingChat";
import { BUILT_IN_SONG, getMusic } from "@/lib/music";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const music = await getMusic();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackgroundMusic
        masterSrc={music.master?.url ?? BUILT_IN_SONG}
        openingSrc={music.opening?.url ?? music.master?.url ?? BUILT_IN_SONG}
      />
      <FloatingChat />
    </div>
  );
}
