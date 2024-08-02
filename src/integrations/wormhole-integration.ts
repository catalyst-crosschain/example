import WormholeSolanaSDK from '../sdk/WormholeSolanaSDK';
import { Signer as EthersSigner } from "ethers";
import { ChainAddress, TokenId, TokenTransfer, CircleTransfer, Wormhole } from "@wormhole-foundation/sdk";
import { EthersSignerAdapter } from '../utils/EthersSignerAdapter';

class WormholeIntegration {
  private sdk: WormholeSolanaSDK;

  constructor() {
    this.sdk = new WormholeSolanaSDK("Testnet");
  }

  async purchaseSkinWithCrossChainPayment(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: EthersSigner,
    tokenAddress: string
  ) {
    try {
      const sourceChain = this.sdk.getChain("Ethereum");
      const destinationChain = this.sdk.getChain("Solana");

      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const token: TokenId = Wormhole.tokenId("Ethereum", tokenAddress);

      const transfer = await this.sdk.tokenTransfer(
        token,
        skinPrice,
        sourceAddress,
        destinationAddress,
        false // true for automatic transfer
      );

      const quote = await TokenTransfer.quoteTransfer(
        this.sdk.wh,
        sourceChain,
        destinationChain,
        transfer.transfer
      );
      console.log("Transfer quote:", quote);

      console.log("Starting transfer");
      const wormholeSigner = new EthersSignerAdapter(ethereumSigner, "Ethereum");
      const srcTxids = await transfer.initiateTransfer(wormholeSigner);
      console.log(`Started transfer: `, srcTxids);

      console.log("Getting Attestation");
      const attestIds = await transfer.fetchAttestation(60_000);
      console.log(`Got Attestation: `, attestIds);

      const solanaBalance = await this.sdk.getTokenBalance(
        "Solana",
        tokenAddress,
        playerSolanaAddress
      );

      console.log('New Solana token balance:', solanaBalance.toString());

      return true;
    } catch (error) {
      console.error("Error during skin purchase payment:", error);
      return false;
    }
  }

  async purchaseSkinWithCCTP(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: EthersSigner
  ) {
    try {
      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const transfer = await this.sdk.circleTransfer(
        skinPrice,
        sourceAddress,
        destinationAddress,
        false
      );

      const quote = await CircleTransfer.quoteTransfer(
        this.sdk.getChain("Ethereum"),
        this.sdk.getChain("Solana"),
        transfer.transfer
      );
      console.log("CCTP transfer quote:", quote);

      console.log("Starting Transfer");
      const wormholeSigner = new EthersSignerAdapter(ethereumSigner, "Ethereum");
      const srcTxids = await transfer.initiateTransfer(wormholeSigner);
      console.log(`Started Transfer: `, srcTxids);

      console.log("Waiting for Attestation");
      const attestIds = await transfer.fetchAttestation(60_000);
      console.log(`Got Attestation: `, attestIds);

      return true;
    } catch (error) {
      console.error("Error during CCTP skin purchase payment:", error);
      return false;
    }
  }
}

export const wormholeIntegration = new WormholeIntegration();