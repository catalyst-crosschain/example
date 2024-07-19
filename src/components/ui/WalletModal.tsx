'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [hasSolanaWallet, setHasSolanaWallet] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkForSolanaWallet();
    }
  }, [isOpen]);

  const checkForSolanaWallet = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const detected = Math.random() > 0.5;
      setHasSolanaWallet(detected);
      setIsLoading(false);
    }, 1500);
  };

  const connectSolana = () => {
    console.log("Connecting to Solana wallet");
    onClose();
  };

  const connectEthereum = () => {
    console.log("Connecting to Ethereum wallet");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-purple-900 text-white max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Connect Wallet</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-32"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </motion.div>
          ) : hasSolanaWallet ? (
            <motion.div
              key="solana"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogDescription className="text-center mb-4">
                Solana wallet detected! Connect to continue.
              </DialogDescription>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                onClick={connectSolana}
              >
                Connect Solana Wallet
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="ethereum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogDescription className="text-center mb-4">
                No Solana wallet detected. You can connect with an Ethereum wallet instead.
              </DialogDescription>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                onClick={connectEthereum}
              >
                Connect Ethereum Wallet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;