'use client';

import React from 'react';
import Image from 'next/image';
import Skins from '@/components/skins';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEthers } from '@usedapp/core';
import useSound from 'use-sound';

export default function Home() {
  const { connected: solanaConnected, connect: connectSolana } = useWallet();
  const { activateBrowserWallet, account: ethereumAccount } = useEthers();
  const [playClickSound] = useSound('/click-sound.mp3');

  const handleWalletConnect = () => {
    playClickSound();
    if (!solanaConnected) {
      connectSolana();
    }
    if (!ethereumAccount) {
      activateBrowserWallet();
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url("/bg-1.gif")' }}>
      <div className="h-full bg-black bg-opacity-50 flex flex-col">
        <header className="p-4 flex justify-between items-center">
          <Image src="/game-logo.svg" alt="Game Logo" width={40} height={40} />
          <Button
            onClick={handleWalletConnect}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {solanaConnected && ethereumAccount ? 'Wallets Connected' : 'Connect Wallets'}
          </Button>
        </header>
        
        <section className="flex-grow">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-300 tracking-wider">Equip skin for your rifle!</h1>
          <Skins />
        </section>
      </div>
    </main>
  );
}