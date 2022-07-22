import '@testing-library/cypress/add-commands';
import { Buffer } from "buffer";

//@ts-expect-error We need Buffer on the window object in the test env for component testing
window.Buffer = Buffer;
