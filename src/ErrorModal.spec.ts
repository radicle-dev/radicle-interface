import ErrorModal from "./ErrorModal.svelte";
import { Failure } from "@app/error";

describe("Error", () => {
  it("should show passed in props", () => {
    cy.mount(ErrorModal, {
      props: {
        subtitle: "Subtitle of Modal",
        error: {
          type: Failure.InsufficientBalance,
          txHash:
            "0x8b678e51f970c5307bf45a8bcea373b597f9acbcea5c5ba784a1d383361a89d1",
          message: "Not enough RAD",
        },
      },
    });
    cy.get("body").contains("Error").should("be.visible");
    cy.get("body").contains("Subtitle of Modal").should("be.visible");
    cy.get("body").contains("Not enough RAD").should("be.visible");
    cy.get("button").contains("Back").should("be.visible");
  });

  it("should show custom error message", () => {
    cy.mount(ErrorModal, {
      props: {
        subtitle: "Subtitle of Modal",
        message: "Error message to check for",
      },
    });
    cy.get("body").contains("Error message to check for").should("be.visible");
  });

  it("should change button label to Close when floating", () => {
    cy.mount(ErrorModal, {
      props: {
        title: "Title of Modal",
        subtitle: "Subtitle of Modal",
        message: "Error message to check for",
        floating: true,
      },
    });
    cy.get("button").contains("Close").should("be.visible");
  });
});
