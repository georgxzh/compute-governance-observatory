import type { Metadata } from "next";
import { Geist, Geist_Mono, Gilda_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gildaDisplay = Gilda_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compute Governance Observatory",
  description:
    "Estimate the compute, chips, energy, cost, and training time behind AI training runs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${gildaDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08080c]">
        {children}
        <a
          href="https://bluedot.org"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Built following a BlueDot Impact course"
          className="fixed bottom-4 right-4 z-50 opacity-25 grayscale transition-opacity hover:opacity-70"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/bluedot-impact-logo.svg" alt="BlueDot Impact" className="h-4 w-auto" />
        </a>
      </body>
    </html>
  );
}
