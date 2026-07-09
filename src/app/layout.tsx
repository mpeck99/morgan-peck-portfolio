import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "@/styles/globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Morgan Peck | UX Engineer",
  description: "Frontend engineering portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}