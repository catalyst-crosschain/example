import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { DAppProvider, Config, Mainnet } from '@usedapp/core';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Game with Wormhole Integration",
  description: "A Solana game with cross-chain payments using Wormhole",
};

// Dynamically import components that use client-side only features
const ClientSideProviders = dynamic(() => import('../components/ClientSideProviders'), { ssr: false });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSideProviders>
          {children}
        </ClientSideProviders>
      </body>
    </html>
  );
}