import type { Metadata, Viewport } from "next";
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

// On phones, the keyboard shrinks the layout instead of sliding over it, so
// the chat sheet (pinned to the bottom) stays above the keyboard while typing.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
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
