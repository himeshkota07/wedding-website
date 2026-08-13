import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BackgroundMusic from "@/components/BackgroundMusic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackgroundMusic />
    </div>
  );
}
