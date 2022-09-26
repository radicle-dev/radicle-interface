import BlockTimer from "./BlockTimer.svelte";

describe("BlockTimer", () => {
  describe("when latestBlock === startBlock", () => {
    it("shows 0% progress", () => {
      cy.mount(BlockTimer, {
        props: {
          latestBlock: 1,
          startBlock: 1,
          duration: 3,
        },
      });

      cy.get(".progress-bar").should("have.attr", "style", "width: 0%;");
    });
  });

  describe("when latestBlock < duration + startBlock", () => {
    it("shows 33% progress", () => {
      cy.mount(BlockTimer, {
        props: {
          latestBlock: 2,
          startBlock: 1,
          duration: 3,
        },
      });

      cy.get(".progress-bar").should("have.attr", "style", "width: 33%;");
    });

    it("shows 66% progress", () => {
      cy.mount(BlockTimer, {
        props: {
          latestBlock: 3,
          startBlock: 1,
          duration: 3,
        },
      });

      cy.get(".progress-bar").should("have.attr", "style", "width: 66%;");
    });
  });

  describe("when latestBlock === duration + startBlock", () => {
    it("shows 100% progress", () => {
      cy.mount(BlockTimer, {
        props: {
          latestBlock: 4,
          startBlock: 1,
          duration: 3,
        },
      });

      cy.get(".progress-bar").should("have.attr", "style", "width: 100%;");
    });
  });

  describe("when latestBlock > duration + startBlock", () => {
    it("shows 100% progress", () => {
      cy.mount(BlockTimer, {
        props: {
          latestBlock: 6,
          startBlock: 1,
          duration: 3,
        },
      });

      cy.get(".progress-bar").should("have.attr", "style", "width: 100%;");
    });
  });
});
