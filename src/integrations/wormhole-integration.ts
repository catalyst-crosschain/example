import { wormhole, TokenId, TokenTransfer, CircleTransfer, amount, signSendWait, Network, Chain, TokenAddress } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import { Signer as EthersSigner } from "ethers";
import { EthersSignerAdapter } from '../utils/EthersSignerAdapter';

class WormholeIntegration {
  private whPromise: Promise<ReturnType<typeof wormhole>>;

  constructor() {
    this.whPromise = this.initWormhole();
  }

  private async initWormhole(): Promise<ReturnType<typeof wormhole>> {
    return await wormhole("Testnet", [evm, solana]);
  }

  private async getWormhole(): Promise<ReturnType<typeof wormhole>> {
    return await this.whPromise;
  }

  async purchaseSkinWithCrossChainPayment(
    skinPrice: bigint,
    playerEthereumAddress: string,
    playerSolanaAddress: string,
    ethereumSigner: EthersSigner,
    tokenAddress: string
  ) {
    try {
      const wh = await this.getWormhole();
      const sourceChain = wh.getChain("Ethereum");
      const destinationChain = wh.getChain("Solana");

      const sourceAddress = wh.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = wh.chainAddress("Solana", playerSolanaAddress);

      const token: TokenId<"Ethereum"> = wh.tokenId("Ethereum", tokenAddress);

      const sndTb = await sourceChain.getTokenBridge();

      const transfer = sndTb.transfer(
        sourceAddress.address as TokenAddress<"Ethereum">,
        destinationAddress,
        token.address,
        skinPrice
      );

      console.log("Starting transfer");
      const wormholeSigner = new EthersSignerAdapter(ethereumSigner, "Ethereum" as Chain);
      const srcTxids = await signSendWait(sourceChain, transfer, wormholeSigner);
      console.log(`Started transfer: `, srcTxids);

      const [whm] = await sourceChain.parseTransaction(srcTxids[srcTxids.length - 1]!.txid);

      console.log("Getting Attestation");
      const vaa = await wh.getVaa(whm!, "TokenBridge:Transfer", 60_000);
      console.log(`Got Attestation: `, vaa);

      const rcvTb = await destinationChain.getTokenBridge();
      const redeem = rcvTb.redeem(playerSolanaAddress, vaa!);

      // Note: You'll need to implement a way to sign and send this transaction on Solana
      // const destTxids = await signSendWait(destinationChain, redeem, solanaSigner);
      // console.log(`Completed Transfer: `, destTxids);

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
      const wh = await this.getWormhole();
      const sourceChain = wh.getChain("Ethereum");
      const destinationChain = wh.getChain("Solana");

      const sourceAddress = wh.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = wh.chainAddress("Solana", playerSolanaAddress);

      const transfer = await wh.circleTransfer(
        skinPrice,
        sourceAddress,
        destinationAddress,
        false // Set to true for automatic transfer
      );

      const quote = await CircleTransfer.quoteTransfer(sourceChain, destinationChain, transfer.transfer);
      console.log("CCTP transfer quote:", quote);

      console.log("Starting Transfer");
      const wormholeSigner = new EthersSignerAdapter(ethereumSigner, "Ethereum" as Chain);
      const srcTxids = await transfer.initiateTransfer(wormholeSigner);
      console.log(`Started Transfer: `, srcTxids);

      console.log("Waiting for Attestation");
      const attestIds = await transfer.fetchAttestation(60_000);
      console.log(`Got Attestation: `, attestIds);

      // Note: You'll need to implement a way to complete the transfer on Solana
      // const dstTxids = await transfer.completeTransfer(solanaSigner);
      // console.log(`Completed Transfer: `, dstTxids);

      return true;
    } catch (error) {
      console.error("Error during CCTP skin purchase payment:", error);
      return false;
    }
  }
}

export const wormholeIntegration = new WormholeIntegration();