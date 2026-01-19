import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BookE — Exchange, Loan & Giveaway",
  description: "A modern marketplace for books: sell, loan, giveaway — with trust signals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> 
        <Providers>
          <TopNav />
          <PageTransition>
            <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
          </PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
