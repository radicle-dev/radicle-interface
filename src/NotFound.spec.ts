import NotFound from "./NotFound.svelte";
import { render } from "@testing-library/svelte";
import "@public/index.css";

describe("NotFound", () => {
  it("shows passed props correctly", () => {
    render(NotFound, {
      props: {
        title: "nakamoto",
        subtitle: "Sorry, the requested project was not found.",
      },
    });
    cy.findByText("nakamoto");
    cy.findByText("Sorry, the requested project was not found.");
    cy.findByText("Back");
  });
});
