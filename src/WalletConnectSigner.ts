import type WalletConnect from "@walletconnect/client";
import * as ethers from "ethers";
import * as ethersBytes from "@ethersproject/bytes";
import type {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";

import {
  Deferrable,
  resolveProperties,
} from "@ethersproject/properties";
import { _TypedDataEncoder } from "ethers/lib/utils";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";

export class WalletConnectSigner extends ethers.Signer {
  public walletConnect: WalletConnect;

  public readonly provider: ethers.providers.JsonRpcProvider;
  constructor(
    walletConnect: WalletConnect,
    provider: ethers.providers.JsonRpcProvider,
  ) {
    super();
    this.provider = provider;
    this.walletConnect = walletConnect;
  }

  async getAddress(): Promise<string> {
    const accountAddress = this.walletConnect.accounts[0];
    if (!accountAddress) {
      throw new Error(
        "The connected wallet has no accounts or there is a connection problem"
      );
    }
    return accountAddress;
  }

  async _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    // Populate any ENS names (in-place)
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
      return this.provider.resolveName(name);
    });

    const address = await this.getAddress();
    const signature = await this.walletConnect.signTypedData([
      address.toLowerCase(),
      JSON.stringify(_TypedDataEncoder.getPayload(populated.domain, types, populated.value)),
    ]);
    return signature;
  }

  async signMessage(message: ethers.Bytes | string): Promise<string> {
    const prefix = ethers.utils.toUtf8Bytes(
      `\x19Ethereum Signed Message:\n${message.length}`
    );
    const msg = ethers.utils.concat([prefix, message]);
    const address = await this.getAddress();
    const keccakMessage = ethers.utils.keccak256(msg);
    const signature = await this.walletConnect.signMessage([
      address.toLowerCase(),
      keccakMessage,
    ]);
    return signature;
  }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    const tx = await resolveProperties(transaction);
    const from = tx.from || (await this.getAddress());

    const txHash = await this.walletConnect.sendTransaction({
      from,
      to: tx.to,
      value: maybeBigNumberToString(tx.value),
      data: bytesLikeToString(tx.data),
    });
    return <TransactionResponse>{
      hash: txHash,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      data: bytesLikeToString(tx.data) || "",
      value: tx.value,
      chainId: tx.chainId,
      confirmations: 0,
      from: from,
      wait: (confirmations?: number) => { return this.provider?.waitForTransaction(txHash, confirmations); }
    };
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    const tx = await resolveProperties(transaction);
    const from = tx.from || (await this.getAddress());
    const nonce = await this.provider.getTransactionCount(from);

    const signedTx = await this.walletConnect.signTransaction({
      from,
      to: tx.to,
      value: maybeBigNumberToString(tx.value || 0),
      gasLimit: maybeBigNumberToString(tx.gasLimit || 200 * 1000),
      gasPrice: maybeBigNumberToString(tx.gasPrice || 0),
      nonce,
      data: bytesLikeToString(tx.data),
    });
    return signedTx;
  }

  connect(_provider: Provider): ethers.Signer {
    throw new Error("WalletConnectSigner.connect should never be called");
  }
}

function maybeBigNumberToString(
  bn: ethers.BigNumberish | undefined
): string | undefined {
  if (bn === undefined) {
    return undefined;
  } else {
    return ethers.BigNumber.from(bn).toString();
  }
}

function bytesLikeToString(
  bytes: ethersBytes.BytesLike | undefined
): string | undefined {
  if (bytes === undefined) {
    return undefined;
  } else {
    return ethersBytes.hexlify(bytes);
  }
}
