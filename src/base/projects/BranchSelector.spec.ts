import BranchSelector from "./BranchSelector.svelte";
import { describe, test } from "vitest";
import { render, screen } from "@testing-library/svelte";

const defaultProps = {
  project: {
    head: "e678629cd37c770c640a2cd997fc76303c815772",
    urn: "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio",
    name: "nakamoto",
    description: "Privacy-preserving Bitcoin light-client implementation in Rust",
    defaultBranch: "master",
    maintainers: [
      "rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"
    ],
    delegates: [
      "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe"
    ]
  },
  branches: { "master": "e678629cd37c770c640a2cd997fc76303c815772" },
  revision: "e678629cd37c770c640a2cd997fc76303c815772",
  toggleDropdown: () => "branch"
};

describe('BranchSelector', function () {
  test("Render with commit = head and branch listing", () => {
    render(BranchSelector, {
      props: defaultProps
    });
    screen.findByText("master");
    screen.findByText("e678629");
  });

  test("Render with commit != head, passing a branch as rev and branch listing", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps, branches: {
          "master": "e678629cd37c770c640a2cd997fc76303c815772",
          "feature-branch": "29e8b7b0f3019b8e8a6d9bfb0964ee78f4ff12f5",
          "xyz": "debf82ef3623ec11751a993bda85bac2ff1c6f00",
        },
        revision: "feature-branch"
      }
    });
    screen.findByText("29e8b7b");
  });

  test("Render with commit != head passing a commit as rev and branch listing", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "debf82ef3623ec11751a993bda85bac2ff1c6f00"
      }
    });
    screen.findByText("debf82ef3623ec11751a993bda85bac2ff1c6f00");
  });

  test("Render with commit = head, without branch listing", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "e678629cd37c770c640a2cd997fc76303c815772",
        branches: {},
      }
    });
    screen.findByText("e678629cd37c770c640a2cd997fc76303c815772");
  });

  test("Render without branch listing, commit != head", () => {
    render(BranchSelector, {
      props: {
        ...defaultProps,
        revision: "6b84e519d3c535879eb2b9ee8457bb70ca275a75",
        branches: {},
      }
    });
    screen.findByText("6b84e519d3c535879eb2b9ee8457bb70ca275a75");
  });
});
