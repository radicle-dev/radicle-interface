import Error from "./Error.svelte";
import { render } from "@testing-library/svelte";
import { Failure } from '@app/error';
import "@public/index.css";

describe('Error', function () {
  it("should show passed in props", () => {
    render(Error, { props: {
      subtitle: "Subtitle of Modal",
      error: {
        type: Failure.InsufficientBalance,
        txHash: "0x8b678e51f970c5307bf45a8bcea373b597f9acbcea5c5ba784a1d383361a89d1",
        message: "Not enough RAD"
      }
    }
    });
    cy.findByText("Error");
    cy.findByText("Subtitle of Modal");
    cy.findByText("Not enough RAD");
    cy.findByText("Back");
  });

  it("should show custom error message", () => {
    render(Error, { props: {
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
    } });
    cy.findByText("Error message to check for");
  });

  it("should change button label to Close when floating", () => {
    render(Error, { props: {
      title: "Title of Modal",
      subtitle: "Subtitle of Modal",
      message: "Error message to check for",
      floating: true
    } });
    cy.findByText("Close");
  });
});
