import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSessionUser } from "@/lib/queries";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "ZaraSuno — Listen to the world's best books",
  description:
    "Audiobooks & book summaries in English and Urdu. Unlock with coins, listen chapter by chapter.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <StoreProvider initialSignedIn={!!user}>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
