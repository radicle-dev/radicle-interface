import Search from "./Search.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import "@public/index.css";

describe('Logic', () => {
  it("show a appropiate placeholder", () => {
    render(Search);
    cy.get("input").should("have.attr", "placeholder", "Search a name or address...");
  });

  it("allow input a query and navigates accordingly", () => {
    render(Search);
    cy.get("input").type("cloudhead.radicle.eth{enter}");
    cy.get("input").should("have.value", "cloudhead.radicle.eth");
    cy.url().should("contain", "/resolver/query?q=cloudhead.radicle.eth");
  });
});

describe("Events", () => {
  it("should fire an event when the input changes", () => {
    const { component } = render(Search);
    const mock = cy.spy();
    component.$on("search", mock);

    cy.get("input").then(([input]) => {
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mock).to.have.been.calledOnce;
    });
  });
});
