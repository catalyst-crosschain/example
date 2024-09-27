import { Signer as EthersSigner } from "ethers";
import { SignOnlySigner, Network, Chain, UnsignedTransaction, SignedTx } from "@wormhole-foundation/sdk";

export class EthersSignerAdapter<N extends Network, C extends Chain> implements SignOnlySigner<N, C> {
  constructor(private ethersSigner: EthersSigner, private chainName: C) {}

  async sign(transactions: UnsignedTransaction<N, C>[]): Promise<SignedTx[]> {
    return Promise.all(
      transactions.map(async (tx) => {
        const signedTx = await this.ethersSigner.signTransaction(tx as any);
        return { signedTx };
      })
    );
  }

  address(): string {
    return this.ethersSigner.getAddress().toString();
  }

  chain(): C {
    return this.chainName;
  }
}