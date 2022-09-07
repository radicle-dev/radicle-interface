/// <reference types="cypress" />
import { MockProvider } from "@rsksmart/mock-web3-provider";

describe("landing page", () => {
  it("displays correctly projects", () => {
    cy.intercept(
      { pathname: "/v1/projects/*" },
      { fixture: "projectInfo.json" },
    ).as("projectInfo");
    cy.visit("/", {
      onBeforeLoad(win) {
        const address = "0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D";
        const privateKey =
          "de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3";
        win.ethereum = new MockProvider({
          address,
          privateKey,
          networkVersion: 1,
        });
      },
    });
    cy.wait("@projectInfo");
    cy.get(".project .name")
      .first()
      .should("have.text", "bright-forest-protocol");
  });
});
