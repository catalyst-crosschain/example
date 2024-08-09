import { ChainName, TokenId, ChainAddress } from "@wormhole-foundation/sdk";
import { Signer as EthersSigner } from "ethers";
import WormholeSolanaSDK from '../sdk/WormholeSolanaSDK';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

class WormholeIntegration {
  private sdk: WormholeSolanaSDK;

  constructor() {
    this.sdk = new WormholeSolanaSDK("Testnet"); // Use "Mainnet" for production
  }

  async purchaseSkinWithCrossChainPayment(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: EthersSigner,
    tokenAddress: string
  ) {
    try {
      const sourceChain = await this.sdk.getChain("Ethereum" as ChainName);
      const destinationChain = await this.sdk.getChain("Solana" as ChainName);

      const sourceAddress = WormholeSolanaSDK.chainAddress("Ethereum" as ChainName, playerEthereumAddress);
      const destinationAddress = WormholeSolanaSDK.chainAddress("Solana" as ChainName, playerSolanaAddress);

      const token: TokenId = WormholeSolanaSDK.tokenId("Ethereum" as ChainName, tokenAddress);

      const transfer = await this.sdk.tokenTransfer(
        token,
        skinPrice,
        sourceAddress,
        destinationAddress,
        false // Set to true for automatic transfer
      );

      console.log("Starting transfer");
      const srcTxids = await transfer.initiateTransfer(ethereumSigner as any);
      console.log(`Started transfer: `, srcTxids);

      console.log("Getting Attestation");
      const attestIds = await transfer.fetchAttestation(60_000);
      console.log(`Got Attestation: `, attestIds);

      const solanaConnection = new Connection((destinationChain as any).rpc);
      const solanaTokenAccount = await this.findAssociatedTokenAddress(
        new PublicKey(playerSolanaAddress),
        new PublicKey(tokenAddress)
      );
      const solanaBalance = await solanaConnection.getTokenAccountBalance(solanaTokenAccount);
      console.log('New Solana token balance:', solanaBalance.value.uiAmount);

      return true;
    } catch (error) {
      console.error("Error during skin purchase payment:", error);
      return false;
    }
  }

  private async findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
    return (await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
  }
}

export const wormholeIntegration = new WormholeIntegration();
