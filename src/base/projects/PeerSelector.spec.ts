import PeerSelector from "./PeerSelector.svelte";
import { describe, test } from "vitest";
import { render, screen } from "@testing-library/svelte";

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
  test("Render correctly with default props", () => {
    render(PeerSelector, {
      props: defaultProps
    });
    screen.findByText("sebastinez");
    screen.findByText("delegate");
  });

  test("Test Peer selection", () => {
    render(PeerSelector, {
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
      }
    });
  });
  test("If no peers are provided, no dropdown should be showed", () => {
    render(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [],
        peersDropdown: true
      }
    });
  });
  test("If peer identity is not being resolved, fallback to peer id", () => {
    render(PeerSelector, {
      props: {
        ...defaultProps,
        peers: [
          {
            "id": "hyyg555wwkkutaysg6yr67qnu5d5ji54iur3n5uzzszndh8dp7ofue",
          }
        ],
        peersDropdown: true
      }
    });
  });
});
