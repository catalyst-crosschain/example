import { wormhole, TokenId, TokenTransfer, CircleTransfer, amount, signSendWait, Network, Chain, TokenAddress, Wormhole, AccountAddress } from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";
import { Signer as EthersSigner } from "ethers";
import { EthersSignerAdapter } from '../utils/EthersSignerAdapter';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

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

      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const token: TokenId<"Ethereum"> = Wormhole.tokenId("Ethereum", tokenAddress);

      const sndTb = await sourceChain.getTokenBridge();

      const transfer = sndTb.transfer(
        sourceAddress.address as AccountAddress<"Ethereum">,
        destinationAddress,
        token.address as TokenAddress<"Ethereum">,
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
      const redeem = rcvTb.redeem(destinationAddress.address as AccountAddress<"Solana">, vaa!);

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

      const sourceAddress = Wormhole.chainAddress("Ethereum", playerEthereumAddress);
      const destinationAddress = Wormhole.chainAddress("Solana", playerSolanaAddress);

      const transfer = await wh.circleTransfer(
        skinPrice,
        sourceAddress,
        destinationAddress,
        false
      );

      const quote = await CircleTransfer.quoteTransfer(sourceChain, destinationChain, transfer.transfer);
      console.log("CCTP transfer quote:", quote);

      const wormholeSigner = new EthersSignerAdapter(ethereumSigner, "Ethereum" as Chain);
      const srcTxids = await transfer.initiateTransfer(wormholeSigner);
      console.log(`Started Transfer: `, srcTxids);

      const attestIds = await transfer.fetchAttestation(60_000);
      console.log(`Got Attestation: `, attestIds);

      return true;
    } catch (error) {
      console.error("Error during CCTP skin purchase payment:", error);
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
