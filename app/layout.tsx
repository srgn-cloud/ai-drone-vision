import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGRI DRONE VISION | Intelligens mezőgazdasági felmérés",
  description: "Drónfotók AI-alapú vizuális ellenőrzése, eltérésjelölés, vadkár- és belvízgyanú felmérése, gazdálkodói jelentés.",
  applicationName: "AGRI DRONE VISION",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hu" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

