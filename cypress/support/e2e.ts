/* eslint-disable @typescript-eslint/no-unused-vars */
import '@cypress/code-coverage/support';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import '@testing-library/cypress/add-commands';
import { BigNumber, ethers } from 'ethers';
import { Resolver } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum: any;
    localStorage: Storage;
  }
}

export class MockExtensionProvider extends ethers.providers.BaseProvider {
  isMetaMask = true;
  currentAddress: string;

  constructor(network: ethers.providers.Networkish, address: string) {
    super(network);
    this.currentAddress = address;
    console.log("Creating Mock provider");
  }

  get ready(): Promise<ethers.providers.Network> {
    return Promise.resolve(this.network);
  }

  getSigner(addressOrIndex?: string | number): JsonRpcSigner {
    return new JsonRpcSigner({}, this as unknown as JsonRpcProvider, addressOrIndex);
  }

  async getResolver(name: string): Promise<null | Resolver> {
    const address = "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0";
    return new Resolver(this, address, name, address);
  }

  async lookupAddress(address: string | Promise<string>): Promise<string | null> {
    return "mock.eth";
  }

  changeAccount(address: string): void {
    this.currentAddress = address;
    this.emit("accountsChanged", [address]);
  }

  async request({ method, params }: { method: string; params: any }): Promise<any> {
    switch (method) {
      case 'eth_chainId':
        return this.network.chainId;
      case 'net_version':
        return this.network.chainId;
      case 'eth_call':
        return resolveEthCall(params);
      case 'eth_accounts':
        return [this.currentAddress];
      case 'eth_requestAccounts':
        return [this.currentAddress];
      case 'eth_getCode':
        return "0x";
      case 'eth_blockNumber':
        return BigNumber.from(1);
      case 'eth_estimateGas':
        return BigNumber.from(21000);
      case 'eth_sendTransaction':
        return "0x8829dea7e20ebcf6dbfd942e3613d7ac49b9aef3ecbed396acfc5901713f5983";
      case 'eth_getTransactionByHash':
        return {
          hash: "0x8829dea7e20ebcf6dbfd942e3613d7ac49b9aef3ecbed396acfc5901713f5983",
          to: "0x0000000000000000000000000000000000000000",
          from: "0x0000000000000000000000000000000000000000",
          nonce: 123,
          gasLimit: BigNumber.from(21000),
          gasPrice: BigNumber.from(40),
          data: "0x",
          value: BigNumber.from(0),
          chainId: 4,
        };
      case 'eth_getTransactionCount':
        return BigNumber.from(123);
      case 'eth_getTransactionReceipt':
        return {
          to: '0x01139F82659A3bD56D1f051D57D4Bc96a3b9Ef05',
          from: '0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8',
          contractAddress: null,
          transactionIndex: 338,
          gasUsed: BigNumber.from('0x5208'),
          logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          blockHash: '0xdbe7ca0dd26310cd5415202c67467d46795cfec922dbb47e4cc4ff388e7856d2',
          transactionHash: '0x8829dea7e20ebcf6dbfd942e3613d7ac49b9aef3ecbed396acfc5901713f5983',
          logs: [],
          blockNumber: 14451272,
          confirmations: 53,
          cumulativeGasUsed: BigNumber.from('0x01b11d57'),
          effectiveGasPrice: BigNumber.from('0x0dffd03ca0'),
          status: 1,
          type: 2,
          byzantium: true
        };
      default:
        console.log("Unknown method", method);
        break;
    }
  }
}

function resolveEthCall(params: { to: string; data: string }[]): string {
  const [{ to, data }] = params;

  // Get Resolver
  if (to === "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e") {
    return "0x0000000000000000000000004976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41";
  // Get ENS Attributes
  } else if (to === "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41" && data === "0x59d1d43c567c364804de7bbedb53f583e483f6b73513fd2f44299e281024e4719da0b332000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000") {
    return "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f68747470733a2f2f636c6f7564686561642e696f2f6176617461722e706e6700";
  // Get Org informations
  } else if (to === "0x8152237402e0f194176154c3a6ea1eb99b611482" && data === "0x8da5cb5b") {
    return "0x000000000000000000000000ceab094641905c209cc796fc8037dd9ecc87ca2f";
    // Get Token Balance
  } else if (to === "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3" && data === "0x70a082310000000000000000000000003256a804085c24f3451cab2c98a37e16deec5721") {
    return "0x00000000000000000000000000000000000000000000000246DDF97976680000";
  // getMaxWithdrawAmount
  } else if (to === "0x9aa75397ed632a3060acb5de7f96e2457bceed8d" && data === "0xf516440c") {
    return "0x000000000000000000000000000000000000000000000001D7D843DC3B480000";
  // Get resolved address from ENS
  } else if (to === "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41") {
    return "0x000000000000000000000000394b920c5d39e0ca40fca2871569b6b90d750c7c";
    // Return 0 for token balances else
  } else {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
}
