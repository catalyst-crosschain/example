import {
  Wormhole,
  TokenId,
  ChainAddress,
  TokenTransfer,
  CircleTransfer,
  Network,
} from "@wormhole-foundation/sdk";
import evm from "@wormhole-foundation/sdk/evm";
import solana from "@wormhole-foundation/sdk/solana";

export class WormholeSolanaSDK {
  wh: Wormhole<Network>;

  constructor(network: "Testnet" | "Mainnet") {
    this.initWormhole(network);
  }

  private async initWormhole(network: "Testnet" | "Mainnet") {
    this.wh = await Wormhole.init(network, [evm, solana]);
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
    return await this.wh.tokenTransfer(
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
    return await this.wh.circleTransfer(
      amount,
      sourceAddress,
      destinationAddress,
      automatic,
      payload,
      nativeGas
    );
  }

  getChain(chainName: string) {
    return this.wh.getChain(chainName);
  }

  async getTokenBalance(chain: string, tokenAddress: string, walletAddress: string): Promise<bigint> {
    const chainContext = this.wh.getChain(chain);
    const tokenBridge = await chainContext.getTokenBridge();
    return await tokenBridge.getBalance(tokenAddress, walletAddress);
  }
}

export default WormholeSolanaSDK;