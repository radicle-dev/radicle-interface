import PeerSelector from "./PeerSelector.svelte";
import { mount } from "radicle-svelte-unit-test";
import { styles } from "@test/support/index";

const defaultProps = {
  peer: "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
  peers: [
    {
      "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
      "name": "sebastinez",
      "delegate": true
    }
  ],
  toggleDropdown: () => console.log("toggle"),
};

describe('PeerSelector', function () {
  it("Render correctly with default props", () => {
    mount(PeerSelector, {
      props: defaultProps
    }, styles);
    cy.get("span.peer-id").should("has.text", "sebastinez");
    cy.get("span.badge").should("has.text", "delegate");
  });

  it("Test Peer selection", () => {
    mount(PeerSelector, {
      props: {
        ...defaultProps, peers: [
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            "name": "sebastinez",
            "delegate": false
          },
          {
            "id": "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
            "name": "cloudhead",
            "delegate": true
          },
        ],
        peersDropdown: true
      }, callbacks: {
        peerChanged: cy.stub().as("peerChanged")
      }
    }, styles);
    cy.get("div.dropdown > div").last().click();
    cy.get("@peerChanged")
      .should("be.calledOnce")
      .its("firstCall.args.0.detail")
      .should("equal", "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1");
  });
  it("If no peers are provided, no dropdown should be showed", () => {
    mount(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [],
        peersDropdown: true
      }
    }, styles);
    cy.get("div.dropdown > div.dropdown-item").should("not.exist");
  });
  it("If peer identity is not being resolved, fallback to peer id", () => {
    mount(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
          }
        ],
        peersDropdown: true
      }
    }, styles);
    cy.get("span.peer-id").should("has.text", "hyyg55…p7ofue");
    cy.get("span.badge").should("not.exist");
    cy.get("div.dropdown > .dropdown-item")
      .first()
      .should("contain", "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue");
  });
});
