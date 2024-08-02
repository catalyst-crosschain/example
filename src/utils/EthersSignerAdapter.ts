import { Signer as EthersSigner } from "ethers";
import { Signer, SignedTx, UnsignedTransaction } from "@wormhole-foundation/sdk";

export class EthersSignerAdapter implements Signer {
  constructor(private ethersSigner: EthersSigner, private chainName: string) {}

  async sign(transactions: UnsignedTransaction[]): Promise<SignedTx[]> {
    return Promise.all(
      transactions.map(async (tx) => {
        const signedTx = await this.ethersSigner.signTransaction(tx as any);
        return { signedTx };
      })
    );
  }

  address(): string {
    return this.ethersSigner.getAddress();
  }

  chain(): string {
    return this.chainName;
  }
}