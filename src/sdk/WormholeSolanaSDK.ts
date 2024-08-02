import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import { TokenBridgeAbi } from "./TokenBridgeAbi";

export class WormholeSolanaSDK {
  private solanaConnection: Connection;
  private tokenBridgeAddress: string;
  private wormholeBridgeAddress: string;

  constructor(
    solanaRpcUrl: string,
    tokenBridgeAddress: string,
    wormholeBridgeAddress: string
  ) {
    this.solanaConnection = new Connection(solanaRpcUrl);
    this.tokenBridgeAddress = tokenBridgeAddress;
    this.wormholeBridgeAddress = wormholeBridgeAddress;
  }

  async transferFromEthToSolana(
    amount: string,
    tokenAddress: string,
    recipientSolanaAddress: string,
    signer: ethers.Signer
  ) {
    const tokenBridgeContract = new ethers.Contract(
      this.tokenBridgeAddress,
      TokenBridgeAbi,
      signer
    );

    const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(4));
    const recipientBytes32 = ethers.utils.hexZeroPad(new PublicKey(recipientSolanaAddress).toBuffer(), 32);

    const tx = await tokenBridgeContract.transferTokens(
      tokenAddress,
      2, // CHAIN_ID_SOLANA
      recipientBytes32,
      amount,
      0, // No relayer fee
      nonce
    );

    const receipt = await tx.wait();
    console.log("Transfer initiated:", receipt.transactionHash);
    
    return receipt.transactionHash;
  }

  async getTokenBalance(publicKey: string, mintAddress: string): Promise<number> {
    const account = await this.solanaConnection.getTokenAccountsByOwner(
      new PublicKey(publicKey),
      { mint: new PublicKey(mintAddress) }
    );
    if (account.value.length === 0) {
      return 0;
    }
    const balance = await this.solanaConnection.getTokenAccountBalance(account.value[0].pubkey);
    return balance.value.uiAmount || 0;
  }

  async getSignedVAA(txHash: string): Promise<string> {
    console.log("Fetching signed VAA for transaction:", txHash);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return "mock-signed-vaa";
  }

  async redeemOnSolana(signedVAA: string, payerAddress: string): Promise<string> {
    console.log("Redeeming on Solana for address:", payerAddress);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return "mock-redeem-transaction-hash";
  }
}

export default WormholeSolanaSDK;