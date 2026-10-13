import type { Metadata, Viewport } from "next";
import { Cinzel, Crimson_Pro, Noto_Serif_Kannada, Noto_Serif_Telugu, Tangerine } from "next/font/google";
import "./globals.css";

// "Heritage letterpress": calligraphy for the couple's names, Roman capitals
// for headings and a book serif for reading, like a printed patrika.

// Body: a book serif, comfortable at phone size for elders.
const crimson = Crimson_Pro({
  variable: "--font-body",
  subsets: ["latin"],
});

// Headings: carved Roman capitals.
const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
});

// The couple's names (and other signatures): pen calligraphy.
const tangerine = Tangerine({
  variable: "--font-names",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Telugu and Kannada in the same serif spirit, used wherever those scripts
// appear (the chat, wishes). Not preloaded: the browser only fetches them
// when a page actually shows Telugu or Kannada text.
const notoSerifTelugu = Noto_Serif_Telugu({
  variable: "--font-telugu",
  subsets: ["telugu"],
  preload: false,
});
const notoSerifKannada = Noto_Serif_Kannada({
  variable: "--font-kannada",
  subsets: ["kannada"],
  preload: false,
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
      className={`${crimson.variable} ${cinzel.variable} ${tangerine.variable} ${notoSerifTelugu.variable} ${notoSerifKannada.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
