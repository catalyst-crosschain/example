import WormholeSolanaSDK from '../sdk/WormholeSolanaSDK';
import { ethers } from 'ethers';

class WormholeIntegration {
  private sdk: WormholeSolanaSDK | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
      const tokenBridgeAddress = process.env.NEXT_PUBLIC_TOKEN_BRIDGE_ADDRESS || '';
      const wormholeBridgeAddress = process.env.NEXT_PUBLIC_WORMHOLE_BRIDGE_ADDRESS || '';

      this.sdk = new WormholeSolanaSDK(
        solanaRpcUrl,
        tokenBridgeAddress,
        wormholeBridgeAddress
      );
    }
  }

  async purchaseSkinWithCrossChainPayment(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: ethers.Signer,
    tokenAddress: string
  ) {
    if (!this.sdk) {
      throw new Error("SDK not initialized. This method should only be called on the client side.");
    }

    try {
      const txHash = await this.sdk.transferFromEthToSolana(
        skinPrice.toString(),
        tokenAddress,
        playerSolanaAddress,
        ethereumSigner
      );

      console.log('Transfer initiated:', txHash);

      const signedVAA = await this.sdk.getSignedVAA(txHash);

      const redeemTxId = await this.sdk.redeemOnSolana(
        signedVAA,
        playerSolanaAddress
      );

      console.log('Redeemed on Solana:', redeemTxId);

      const solanaBalance = await this.sdk.getTokenBalance(
        playerSolanaAddress,
        tokenAddress
      );

      console.log('New Solana token balance:', solanaBalance);

      return true;
    } catch (error) {
      console.error("Error during skin purchase payment:", error);
      return false;
    }
  }
}

export const wormholeIntegration = new WormholeIntegration();