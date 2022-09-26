import NotFound from "./NotFound.svelte";

describe("NotFound", () => {
  it("shows passed props correctly", () => {
    cy.mount(NotFound, {
      props: {
        title: "nakamoto",
        subtitle: "Sorry, the requested project was not found.",
      },
    });
    cy.get("body").contains("nakamoto").should("be.visible");
    cy.get("body")
      .contains("Sorry, the requested project was not found.")
      .should("be.visible");
    cy.get("button").contains("Back").should("be.visible");
  });
});
