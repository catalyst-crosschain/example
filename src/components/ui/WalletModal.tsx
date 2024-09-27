import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletContext } from '@/components/WalletProvider';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { solanaWallet, ethereumWallet, connectSolana, connectEthereum } = useWalletContext();
  const [isLoading, setIsLoading] = useState(true);

  const checkForWallets = useCallback(async () => {
    setIsLoading(true);
    const isSolanaAvailable = window.solana && window.solana.isPhantom;
    
    if (!isSolanaAvailable) {
      setIsLoading(false);
    } else {
      try {
        await connectSolana();
      } catch (error) {
        console.error('Failed to connect to Solana wallet:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [connectSolana]);

  useEffect(() => {
    if (isOpen) {
      checkForWallets();
    }
  }, [isOpen, checkForWallets]);

  const handleConnectEthereum = async () => {
    await connectEthereum();
    onClose();
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
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </motion.div>
          ) : solanaWallet.connected ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogDescription className="text-center mb-4">
                Connected to Solana wallet: {solanaWallet.publicKey?.toBase58().slice(0, 8)}...
              </DialogDescription>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                onClick={onClose}
              >
                Close
              </Button>
            </motion.div>
          ) : !window.solana?.isPhantom ? (
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
                onClick={handleConnectEthereum}
              >
                Connect Ethereum Wallet
              </Button>
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;