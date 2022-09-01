/* eslint-disable @typescript-eslint/no-unused-vars */
import "@cypress/code-coverage/support";
import "@testing-library/cypress/add-commands";

declare global {
  interface Window {
    ethereum: any;
    localStorage: Storage;
  }
}
