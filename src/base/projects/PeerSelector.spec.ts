import PeerSelector from "./PeerSelector.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import "@public/index.css";

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

describe('Logic', function () {
  it("show delegate name and badge", () => {
    render(PeerSelector, {
      props: defaultProps
    });
    cy.get("span.peer-id").should("have.text", "sebastinez");
    cy.get("span.badge.primary").should("have.text", "delegate");
  });

  it("show peer id with badge if no name available", () => {
    render(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            "delegate": true
          }
        ],
      }
    });
    cy.get("span.peer-id").should("have.text", "hyyg55…p7ofue");
    cy.get("span.badge.primary").should("have.text", "delegate");
  });

  it("show only peer id if no additional data available", () => {
    render(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
          }
        ]
      }
    });
    cy.get("span.peer-id").should("have.text", "hyyg55…p7ofue");
  });
});

describe("Layout", () => {
  it("should highlight the current peer", () => {
    render(PeerSelector, {
      props: { ...defaultProps, peersDropdown: true }
    });
    cy.get("div.dropdown-item").should("have.class", "selected");
  });
});

describe('Events', () => {
  it("dispatch peerChanged event if clicking on a peer", () => {
    cy.viewport("macbook-13");
    const { getByText, component } = render(PeerSelector, {
      props: {
        ...defaultProps,
        peersDropdown: true,
        peers: [
          {
            "id": "hyy841u4phudmr8s5rg1jjwd1ct7x7438wmjwtsm464y8uyxyhyi6c",
            "name": "cloudhead",
            "delegate": true
          },
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
            "name": "sebastinez",
            "delegate": true
          }
        ]
      }
    });

    const peer = getByText("cloudhead");
    const mock = cy.spy();
    component.$on("peerChanged", mock);

    fireEvent.click(peer);
    expect(mock).to.have.been.calledOnce;
  });
});
