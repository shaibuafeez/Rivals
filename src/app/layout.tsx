import type { Metadata } from "next";
import "@/styles/globals.css";
import '@mysten/dapp-kit/dist/index.css';
import AppWalletProvider from "@/components/providers/WalletProvider";

// Using system fonts instead of Google Fonts to avoid network issues

export const metadata: Metadata = {
  title: "NFT Battles",
  description: "Battle for Sui Dominance with your NFTs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <AppWalletProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </AppWalletProvider>
      </body>
    </html>
  );
}
