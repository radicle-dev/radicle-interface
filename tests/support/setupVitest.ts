// Found in https://github.com/belgattitude/nextjs-monorepo-example/pull/2913
// Hack for vitest 0.25.2 / happy-dom. Keep till those issues are fixed
// - https://github.com/vitest-dev/vitest/issues/2305#issuecomment-1311420462
// - https://github.com/capricorn86/happy-dom/issues/569

import { URL } from "node:url";
//@ts-expect-error The two types don't match, but for this hack we have to
//overwrite the given URL by happy-dom with the URL class passed by Node
globalThis.URL = URL;
