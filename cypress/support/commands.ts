/// <reference types="cypress" />
import { providers } from "ethers";
import { homestead } from "../../src/config.json";

// Sets up the injected provider to be a mock ethereum provider
Cypress.Commands.overwrite('visit', (original, url, options) => {
  return original(url, {
    ...options,
    onBeforeLoad(win) {
      options && options.onBeforeLoad && options.onBeforeLoad(win);
      win.localStorage.clear();
      win.ethereum = new providers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${homestead.alchemy.key}`, 1);
    },
  });
});
