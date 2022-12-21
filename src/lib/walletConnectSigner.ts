import type WalletConnect from "@walletconnect/client";
import type { Deferrable } from "@ethersproject/properties";
import type {
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/abstract-provider";
import type {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";

import * as ethers from "ethers";
import * as ethersBytes from "@ethersproject/bytes";
import { _TypedDataEncoder } from "ethers/lib/utils";
import { resolveProperties } from "@ethersproject/properties";

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
        "The connected wallet has no accounts or there is a connection problem",
      );
    }
    return ethers.utils.getAddress(accountAddress);
  }

  async _signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    // Populate any ENS names (in-place)
    const populated = await _TypedDataEncoder.resolveNames(
      domain,
      types,
      value,
      async (name: string) => {
        const address = await this.provider.resolveName(name);
        if (address === null) {
          throw Error("resolver or addr is not configured for ENS name");
        }
        return address;
      },
    );

    const address = await this.getAddress();
    const signature = await this.walletConnect.signTypedData([
      address.toLowerCase(),
      JSON.stringify(
        _TypedDataEncoder.getPayload(populated.domain, types, populated.value),
      ),
    ]);
    return signature;
  }

  async signMessage(message: ethers.Bytes | string): Promise<string> {
    const prefix = ethers.utils.toUtf8Bytes(
      `\x19Ethereum Signed Message:\n${message.length}`,
    );
    const data =
      typeof message === "string" ? ethers.utils.toUtf8Bytes(message) : message;

    const msg = ethers.utils.concat([prefix, data]);
    const address = await this.getAddress();
    const keccakMessage = ethers.utils.keccak256(msg);
    const signature = await this.walletConnect.signMessage([
      address,
      keccakMessage,
    ]);

    return signature;
  }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>,
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
      wait: (confirmations?: number) => {
        return this.provider?.waitForTransaction(txHash, confirmations);
      },
    };
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>,
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

  connect(): ethers.Signer {
    throw new Error("WalletConnectSigner.connect should never be called");
  }
}

function maybeBigNumberToString(
  bn: ethers.BigNumberish | undefined,
): string | undefined {
  if (bn === undefined) {
    return undefined;
  } else {
    return ethers.BigNumber.from(bn).toString();
  }
}

function bytesLikeToString(
  bytes: ethersBytes.BytesLike | undefined,
): string | undefined {
  if (bytes === undefined) {
    return undefined;
  } else {
    return ethersBytes.hexlify(bytes);
  }
}
