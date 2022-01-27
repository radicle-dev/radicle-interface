import Error from "./Error.svelte";
import { mount } from "cypress-svelte-unit-test";
import { Failure } from '@app/error';
import { cssFile } from "@test/support/styles";

describe('Error', function () {
  it("Open Error modal with default props", () => {
    mount(Error, { props: {
      subtitle: "Subtitle of Modal",
      error: {
        type: Failure.InsufficientBalance,
        txHash: "0x8b678e51f970c5307bf45a8bcea373b597f9acbcea5c5ba784a1d383361a89d1",
        message: "Not enough RAD"
      }
    }
    }, cssFile);
    cy.get("[data-cy=title]").should("have.text", " Error");
    cy.get("[data-cy=subtitle]").should("have.text", "Subtitle of Modal");
    cy.get("[data-cy=body]").should("have.text", "Error: Not enough RAD");
    cy.get("[data-cy=action-btn]").should("have.text", "Back");
  });
  it("Open Error modal with custom message", () => {
    mount(Error, { props: {
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
    } }, cssFile);
    cy.get("[data-cy=subtitle]").should("have.text", "Subtitle of Modal");
    cy.get("[data-cy=body]").should("have.text", "Error: Error message to check for");
    cy.get("[data-cy=action-btn]").should("have.text", "Back");
  });
  it("Check floating modal changes button label to Close", () => {
    mount(Error, { props: {
      title: "Title of Modal",
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
      floating: true
    } }, cssFile);
    cy.get("[data-cy=action-btn]").should("have.text", "Close");
  });
});
