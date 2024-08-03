import {
  wormhole,
  TokenId,
  ChainAddress,
  TokenTransfer,
  CircleTransfer,
  Network,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";

export class WormholeSolanaSDK {
  private whPromise: Promise<ReturnType<typeof wormhole>>;

  constructor(network: "Testnet" | "Mainnet") {
    this.whPromise = this.initWormhole(network);
  }

  private async initWormhole(network: "Testnet" | "Mainnet"): Promise<ReturnType<typeof wormhole>> {
    return await wormhole(network, [evm, solana]);
  }

  private async getWormhole(): Promise<ReturnType<typeof wormhole>> {
    return await this.whPromise;
  }

  async tokenTransfer(
    token: TokenId,
    amount: bigint,
    sourceAddress: ChainAddress,
    destinationAddress: ChainAddress,
    automatic: boolean = false,
    payload?: Uint8Array,
    nativeGas?: bigint
  ): Promise<TokenTransfer<Network>> {
    const wh = await this.getWormhole();
    return await wh.tokenTransfer(
      token,
      amount,
      sourceAddress,
      destinationAddress,
      automatic,
      payload,
      nativeGas
    );
  }

  async circleTransfer(
    amount: bigint,
    sourceAddress: ChainAddress,
    destinationAddress: ChainAddress,
    automatic: boolean = false,
    payload?: Uint8Array,
    nativeGas?: bigint
  ): Promise<CircleTransfer<Network>> {
    const wh = await this.getWormhole();
    return await wh.circleTransfer(
      amount,
      sourceAddress,
      destinationAddress,
      automatic,
      payload,
      nativeGas
    );
  }

  async getChain(chainName: string) {
    const wh = await this.getWormhole();
    return wh.getChain(chainName);
  }

  async getTokenBalance(chain: string, tokenAddress: string, walletAddress: string): Promise<bigint> {
    const wh = await this.getWormhole();
    const chainContext = wh.getChain(chain);
    const tokenBridge = await chainContext.getTokenBridge();
    return await tokenBridge.getBalance(tokenAddress, walletAddress);
  }
}

export default WormholeSolanaSDK;