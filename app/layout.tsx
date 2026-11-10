import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "[your name] ~ terminal portfolio",
    template: "%s ~ [your name]",
  },
  description: "cs student who likes building web stuff",
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <Nav />
        <main className="w-full flex-1">{children}</main>
      </body>
    </html>
  );
}
