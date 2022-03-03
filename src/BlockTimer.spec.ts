import BlockTimer from "./BlockTimer.svelte";
import { render } from "@testing-library/svelte";
import "@public/index.css";
import type { EventType, Listener } from "@ethersproject/abstract-provider";


describe('BlockTimer', function () {
  it("increases correctly the loading bar", () => {
    let block = 1;
    const props = {
      config: {
        provider: {
          on: (event: EventType, listener: Listener) => {
            if (event === "block") {
              listener(block);
            }
          }
        }
      },
      startBlock: 1,
      duration: 3
    };

    const { rerender } = render(BlockTimer, props);

    cy.get("div.loader").should("have.attr", "style", "width: 0%;").then(() => {
      block += 1;
      rerender(props);
    });

    cy.get("div.loader").last().should("have.attr", "style", "width: 33%;").then(() => {
      block += 1;
      rerender(props);
    });

    cy.get("div.loader").last().should("have.attr", "style", "width: 66%;").then(() => {
      block += 1;
      rerender(props);
    });

    cy.get("div.loader").last().should("have.attr", "style", "width: 99%;").then(() => {
      block += 1;
      rerender(props);
    });
  });
});
