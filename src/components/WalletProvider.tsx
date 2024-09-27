import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ethers } from 'ethers';
import WormholeConnect, { WormholeConnectConfig } from '@wormhole-foundation/wormhole-connect';

interface WalletContextType {
  solanaWallet: any;
  ethereumWallet: ethers.providers.Web3Provider | null;
  connectSolana: () => Promise<void>;
  connectEthereum: () => Promise<void>;
  disconnectWallet: () => void;
  isWormholeModalOpen: boolean;
  openWormholeModal: () => void;
  closeWormholeModal: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

const wormholeConfig: WormholeConnectConfig = {
  env: "mainnet",
  networks: ["ethereum", "polygon", "solana"],
  tokens: ["ETH", "WETH", "MATIC", "WMATIC", "SOL", "WSOL"],
  rpcs: {
    ethereum: "https://rpc.ankr.com/eth",
    solana: "https://rpc.ankr.com/solana",
    polygon: "https://rpc.ankr.com/polygon",
  },
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const solanaWallet = useWallet();
  const [ethereumWallet, setEthereumWallet] = useState<ethers.providers.Web3Provider | null>(null);
  const [isWormholeModalOpen, setIsWormholeModalOpen] = useState(false);

  const connectSolana = async () => {
    if (!solanaWallet.connected) {
      await solanaWallet.connect();
    }
  };

  const connectEthereum = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setEthereumWallet(provider);
      } catch (error) {
        console.error('Failed to connect to Ethereum wallet:', error);
      }
    } else {
      console.error('Ethereum wallet not detected');
    }
  };

  const disconnectWallet = () => {
    if (solanaWallet.connected) {
      solanaWallet.disconnect();
    }
    if (ethereumWallet) {
      setEthereumWallet(null);
    }
  };

  const openWormholeModal = () => {
    setIsWormholeModalOpen(true);
  };

  const closeWormholeModal = () => {
    setIsWormholeModalOpen(false);
  };

  return (
    <WalletContext.Provider value={{
      solanaWallet,
      ethereumWallet,
      connectSolana,
      connectEthereum,
      disconnectWallet,
      isWormholeModalOpen,
      openWormholeModal,
      closeWormholeModal,
    }}>
      {children}
      {isWormholeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <WormholeConnect config={wormholeConfig} />
            <button onClick={closeWormholeModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </WalletContext.Provider>
  );
};

export default WalletProvider;