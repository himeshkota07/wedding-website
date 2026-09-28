import type { Metadata } from "next";
import { Anek_Latin, Courgette, Kurale } from "next/font/google";
import "./globals.css";

// Body: Anek, from an Indian foundry, with Telugu and Kannada siblings for the
// planned language toggle.
const anek = Anek_Latin({
  variable: "--font-body",
  subsets: ["latin"],
});

// Headings: a letterpress serif with the warmth of a printed patrika.
const kurale = Kurale({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

// The couple's names, in the brush lettering of the printed invite.
const courgette = Courgette({
  variable: "--font-names",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Our Wedding",
  description: "Join us as we celebrate our wedding.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anek.variable} ${kurale.variable} ${courgette.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
