/// <reference types="cypress" />
import { MockExtensionProvider } from "../support";

describe("MetaMask", () => {
  it("Lets user connect with Metamask provider", () => {
    cy.visit("/faucet", {
      onBeforeLoad(win) {
        win.ethereum = new MockExtensionProvider("rinkeby", "0x3256a804085C24f3451cAb2C98a37e16DEEc5721");
      }
    });
    cy.get("button.connect").click();
    cy.get("button.secondary").click();
    cy.get("button.address").should("contain", "3256 – 5721");
    cy.window().then((win) => {
      win.ethereum.changeAccount("0xd3b5586D15140B6f793b260fd90588A0dAefc5B6");
    });
    cy.get("button.address").should("contain", "d3b5 – c5B6");
  });
});
