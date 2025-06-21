import type { Metadata } from "next";
import "@/styles/globals.css";
import '@mysten/dapp-kit/dist/index.css';
import AppWalletProvider from "@/components/providers/WalletProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ThemeScript from "@/components/providers/ThemeScript";

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
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <AppWalletProvider>
            <main className="min-h-screen bg-background">
              <ClientLayout>
                {children}
              </ClientLayout>
            </main>
          </AppWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
