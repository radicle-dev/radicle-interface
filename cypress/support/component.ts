import { mount } from "cypress/svelte";
import { Buffer } from "buffer";

//@ts-expect-error We need Buffer on the window object in the test env for component testing
window.Buffer = Buffer;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);
