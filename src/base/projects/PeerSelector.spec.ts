import PeerSelector from "./PeerSelector.svelte";

const defaultProps = {
  peer: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
  peers: [
    {
      id: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
      person: { name: "sebastinez" },
      delegate: true,
    },
  ],
};

describe("Logic", () => {
  it("show delegate name and badge", () => {
    cy.mount(PeerSelector, {
      props: defaultProps,
    });
    cy.get("span.peer-id").should("have.text", "sebastinez");
    cy.get("span.badge.primary").should("have.text", "delegate");
  });

  it("show peer id with badge if no name available", () => {
    cy.mount(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            id: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            delegate: true,
          },
        ],
      },
    });
    cy.get("span.peer-id").should("have.text", "hyyg55…p7ofue");
    cy.get("span.badge.primary").should("have.text", "delegate");
  });

  it("show only peer id if no additional data available", () => {
    cy.mount(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            id: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            delegate: false,
          },
        ],
      },
    });
    cy.get("span.peer-id").should("have.text", "hyyg55…p7ofue");
  });
});

describe("Layout", () => {
  it("should highlight the current peer", () => {
    cy.mount(PeerSelector, {
      props: { ...defaultProps },
    });
    cy.get("div.selector").click();
    cy.get("div.dropdown-item").should("have.class", "selected");
  });
});

describe("Events", () => {
  it("dispatch peerChanged event if clicking on a peer", () => {
    const peerChangedSpy = cy.spy().as("peerChangedSpy");

    cy.mount(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            id: "hyy841u4phudmr8s5rg1jjwd1ct7x7438wmjwtsm464y8uyxyhyi6c",
            person: { name: "cloudhead" },
            delegate: true,
          },
          {
            id: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            person: { name: "sebastinez" },
            delegate: true,
          },
        ],
      },
    }).then(({ component }) => {
      component.$on("peerChanged", peerChangedSpy);
    });

    cy.get("body").contains("sebastinez").click();
    cy.get("body").contains("cloudhead").click();
    cy.get("@peerChangedSpy").should("have.been.called");
  });
});
