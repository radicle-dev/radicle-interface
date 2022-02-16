import type { Config } from "@app/config";
import View from "./View.svelte";
import { test, beforeAll, afterAll } from "vitest";
import { readmeMock, infoMock, treeMock, rootMock, peerMock, remoteMock } from "../../../fixtures/projects";
import { isSafe } from "../../../fixtures/safe";
import { render, screen } from "@testing-library/svelte";
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const defaultProps = {
  url: "/",
  id: "nakamoto",
  seedHost: "seed.mock.io",
  config: {
    orgs: {
      subgraph: "https://mock.subgraph",
    },
    seed: {
      api: { port: 8777 },
      git: { port: 8777 },
      link: { port: 8777 }
    },
    safe: {
      api: "https://safe-transaction.gnosis.io",
      viewer: "https://gnosis-safe.io/app/#/safes"
    },
    network: {
      name: "rinkeby"
    }
  } as Config
};

export const restHandlers = [
  rest.get('https://mock.subgraph', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(isSafe));
  }),
  rest.get('https://seed.mock.io:8777', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(rootMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/peer', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(peerMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/nakamoto', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(infoMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo/remotes', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(remoteMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo/tree/6e8a614a30adbfd681a472b89c54605f978b0b25', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(treeMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo/tree/1e54ae2ed58b5f7a7afb9365f0bd3a85c57d9af1', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ...treeMock, info: { lastCommit: { sha1: "1e54ae2ed58b5f7a7afb9365f0bd3a85c57d9af1" } } }));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo/readme/6e8a614a30adbfd681a472b89c54605f978b0b25', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(readmeMock));
  }),
  rest.get('https://seed.mock.io:8777/v1/projects/rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo/readme/1e54ae2ed58b5f7a7afb9365f0bd3a85c57d9af1', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(readmeMock));
  }),
];

const server = setupServer(...restHandlers);
beforeAll(() => server.listen());
afterAll(() => server.close());

test("mount component", async () => {
  const { rerender } = render(View, { props: defaultProps });
  await screen.findByText("nakamoto");
  await screen.findByText("rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo");
  await screen.findByText("Privacy-preserving Bitcoin light-client implementation in Rust");
  await screen.findByText("6e8a614", { selector: "div.hash.desktop" });
  await screen.findByText("master");

  rerender({ ...defaultProps, url: "/tree/1e54ae2ed58b5f7a7afb9365f0bd3a85c57d9af1" });
  await screen.findByText("1e54ae2ed58b5f7a7afb9365f0bd3a85c57d9af1", { selector: "div.hash.desktop" });
});
