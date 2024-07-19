'use client';

import React from 'react';
import Image from 'next/image';
import Skins from '@/components/skins';
import { Button } from '@/components/ui/button';
import WalletModal from '@/components/ui/WalletModal';
import useSound from 'use-sound';

export default function Home() {
  const [isWalletModalOpen, setIsWalletModalOpen] = React.useState(false);
  const [playClickSound] = useSound('/click-sound.mp3');

  const handleWalletClick = () => {
    playClickSound();
    setIsWalletModalOpen(true);
  };

  return (
    <main className="h-screen overflow-hidden bg-fixed bg-cover bg-center" style={{ backgroundImage: 'url("/bg-1.gif")' }}>
      <div className="h-full bg-black bg-opacity-50 flex flex-col">
        <header className="p-4 flex justify-between items-center">
          <Image src="/game-logo.svg" alt="Game Logo" width={40} height={40} />
          <Button
            onClick={handleWalletClick}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Connect Wallet
          </Button>
        </header>
        
        <section className="flex-grow">
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-300 tracking-wider">equip skin for your rifle!</h1>
          <Skins />
        </section>

        <WalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)}
        />
      </div>
    </main>
  );
}