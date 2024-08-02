import { Wormhole, TokenId, TokenTransfer, CircleTransfer, amount, signSendWait } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import { Signer as EthersSigner } from "ethers";

class WormholeIntegration {
  private wh: Wormhole;

  constructor() {
    this.initWormhole();
  }

  private async initWormhole() {
    this.wh = await Wormhole.init("Testnet", [evm, solana]);
  }

  async purchaseSkinWithCrossChainPayment(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: EthersSigner,
    tokenAddress: string
  ) {
    try {
      const sourceChain = this.wh.getChain("Ethereum");
      const destinationChain = this.wh.getChain("Solana");

      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const token: TokenId = Wormhole.tokenId("Ethereum", tokenAddress);

      const sndTb = await sourceChain.getTokenBridge();

      const transfer = sndTb.transfer(sourceAddress.address, destinationAddress, token.address, skinPrice);

      console.log("Starting transfer");
      const srcTxids = await signSendWait(sourceChain, transfer, ethereumSigner);
      console.log(`Started transfer: `, srcTxids);

      const [whm] = await sourceChain.parseTransaction(srcTxids[srcTxids.length - 1]!.txid);

      console.log("Getting Attestation");
      const vaa = await this.wh.getVaa(whm!, "TokenBridge:Transfer", 60_000);
      console.log(`Got Attestation: `, vaa);

      const rcvTb = await destinationChain.getTokenBridge();
      const redeem = rcvTb.redeem(playerSolanaAddress, vaa!);

      const solanaBalance = await rcvTb.getBalance(tokenAddress, playerSolanaAddress);
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
      const sourceChain = this.wh.getChain("Ethereum");
      const destinationChain = this.wh.getChain("Solana");

      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const transfer = await this.wh.circleTransfer(
        skinPrice,
        sourceAddress,
        destinationAddress,
        false // true for automatic transfer
      );

      const quote = await CircleTransfer.quoteTransfer(sourceChain, destinationChain, transfer.transfer);
      console.log("CCTP transfer quote:", quote);

      console.log("Starting Transfer");
      const srcTxids = await transfer.initiateTransfer(ethereumSigner);
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