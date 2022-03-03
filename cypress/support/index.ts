/* eslint-disable @typescript-eslint/no-unused-vars */
import '@cypress/code-coverage/support';
import '@testing-library/cypress/add-commands';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class MockExtensionProvider extends ethers.providers.BaseProvider {
  isMetaMask = true;

  constructor() {
    super({ name: "homestead", chainId: 1 });
    console.log("Creating Mock provider");
  }
  async request({ method, params }: { method: string; params: any }): Promise<any> {
    switch (method) {
      case 'eth_chainId':
        return "1";
      case 'net_version':
        return "1";
      case 'eth_call':
        return resolveEthCall(params);
      case 'eth_getCode':
        return "0x";
      default:
        console.log("Unknown method", method);
        break;
    }
  }
}

function resolveEthCall(params: { to: string; data: string }[]): string {
  // Get Resolver
  if (params[0].to === "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e") {
    return "0x0000000000000000000000004976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41";
  // Get ENS Attributes
  } else if (params[0].to === "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41" && params[0].data === "0x59d1d43c567c364804de7bbedb53f583e483f6b73513fd2f44299e281024e4719da0b332000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000066176617461720000000000000000000000000000000000000000000000000000") {
    return "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f68747470733a2f2f636c6f7564686561642e696f2f6176617461722e706e6700";
  // Get Org informations
  } else if (params[0].to === "0x8152237402e0f194176154c3a6ea1eb99b611482" && params[0].data === "0x8da5cb5b") {
    return "0x000000000000000000000000ceab094641905c209cc796fc8037dd9ecc87ca2f";
  } else {
    return "0x000000000000000000000000394b920c5d39e0ca40fca2871569b6b90d750c7c";
  }
}
