import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEthers } from '@usedapp/core';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connected: solanaConnected, connect: connectSolana } = useWallet();
  const { activateBrowserWallet, account: ethereumAccount } = useEthers();

  const handleSolanaConnect = () => {
    connectSolana();
  };

  const handleEthereumConnect = () => {
    activateBrowserWallet();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-purple-900 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Connect Wallets</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center mb-4">
          Connect your Solana and Ethereum wallets to continue.
        </DialogDescription>
        <div className="flex flex-col gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
              onClick={handleSolanaConnect}
              disabled={solanaConnected}
            >
              {solanaConnected ? 'Solana Wallet Connected' : 'Connect Solana Wallet'}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              onClick={handleEthereumConnect}
              disabled={!!ethereumAccount}
            >
              {ethereumAccount ? 'Ethereum Wallet Connected' : 'Connect Ethereum Wallet'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;