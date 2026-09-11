import type { Metadata } from "next";
import { Cinzel, Spectral, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import TransactionTray from "@/components/TransactionTray";
import { WalletProvider } from "@/lib/wallet-context";
import { NotificationProvider } from "@/lib/notification-context";
import { TransactionProvider } from "@/lib/transaction-context";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Gumifi Ecosystem",
  description:
    "The decentralized ecosystem to launch, trade, create, and own digital assets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${spectral.variable} ${jetbrains.variable} font-body bg-void text-ivory antialiased`}
      >
        <WalletProvider>
          <NotificationProvider>
            <TransactionProvider>
              <Header />
              <main className="min-h-screen pb-20 md:pb-0">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BottomNav />
              <TransactionTray />
            </TransactionProvider>
          </NotificationProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
