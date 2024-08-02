import { Signer as EthersSigner } from "ethers";
import { Signer, SignedTx, UnsignedTransaction, ChainName } from "@wormhole-foundation/sdk";

export class EthersSignerAdapter implements Signer {
  constructor(private ethersSigner: EthersSigner, private chainName: ChainName) {}

  async sign(transactions: UnsignedTransaction[]): Promise<SignedTx[]> {
    return Promise.all(
      transactions.map(async (tx) => {
        const signedTx = await this.ethersSigner.signTransaction(tx as any);
        return { signedTx };
      })
    );
  }

  async address(): Promise<string> {
    return await this.ethersSigner.getAddress();
  }

  chain(): ChainName {
    return this.chainName;
  }
}