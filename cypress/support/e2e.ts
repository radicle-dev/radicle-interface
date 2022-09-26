/* eslint-disable @typescript-eslint/no-unused-vars */
import "@cypress/code-coverage/support";

declare global {
  interface Window {
    ethereum: any;
    localStorage: Storage;
  }
}
