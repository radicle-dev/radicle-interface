export const rootMock = {
  message: "Welcome!",
  service: "radicle-http-api",
  version: "0.2.0",
  path: "/",
  links: [
    {
      href: "/v1/projects",
      rel: "projects",
      type: "GET",
    },
    {
      href: "/v1/peer",
      rel: "peer",
      type: "GET",
    },
    {
      href: "/v1/delegates/:urn/projects",
      rel: "projects",
      type: "GET",
    },
  ],
};

export const treeMock = {
  path: "",
  entries: [
    {
      path: "src",
      info: {
        name: "src",
        objectType: "TREE",
        lastCommit: null,
      },
    },
    {
      path: "test",
      info: {
        name: "test",
        objectType: "TREE",
        lastCommit: null,
      },
    },
    {
      path: "wallet",
      info: {
        name: "wallet",
        objectType: "TREE",
        lastCommit: null,
      },
    },
    {
      path: ".gitignore",
      info: {
        name: ".gitignore",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: ".gitsigners",
      info: {
        name: ".gitsigners",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "CONTRIBUTING.md",
      info: {
        name: "CONTRIBUTING.md",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "Cargo.lock",
      info: {
        name: "Cargo.lock",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "Cargo.toml",
      info: {
        name: "Cargo.toml",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "LICENSE",
      info: {
        name: "LICENSE",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "README.md",
      info: {
        name: "README.md",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "deny.toml",
      info: {
        name: "deny.toml",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
    {
      path: "rust-toolchain",
      info: {
        name: "rust-toolchain",
        objectType: "BLOB",
        lastCommit: null,
      },
    },
  ],
  info: {
    name: "",
    objectType: "TREE",
    lastCommit: {
      sha1: "6e8a614a30adbfd681a472b89c54605f978b0b25",
      author: {
        name: "Cypher",
        email: "cypher@server.ky",
      },
      summary: "[p2p] cbfmgr: Remove testing empty watch list",
      description:
        "The cost for implementation and maintenance does not justify the test.",
      committer: {
        name: "Alexis Sellier",
        email: "self@cloudhead.io",
      },
      committerTime: 1641930360,
    },
  },
  stats: {
    commits: 883,
    branches: 1,
    contributors: 8,
  },
};

export const readmeMock = {
  binary: false,
  html: false,
  content:
    "nakamoto\n========\n\nNakamoto is a privacy-preserving Bitcoin light-client implementation in Rust,\nwith a focus on low resource utilization, modularity and security.\n\nThe vision for the project is to build a set of libraries targeting light\nclient functionality, that are easy to embed in any program and on any\nplatform, be it mobile or desktop. The project's small cpu, memory and code\nfootprint is made possible by its efficient runtime and minimal set of\ndependencies. The implementation language, Rust, opens up the possibility for\nprograms written in other languages (eg. Swift, Python, Java), to bind directly\nto it via a foreign function interface (FFI).\n\n---\n\n    [dependencies]\n    nakamoto = \"0.3.0\"\n\nRequires `rustc 1.53` or greater.\n\n## Design\n\nNakamoto is split into several crates, each handling a different aspect of the\nlight-client protocol. Although these crates are designed to be used in tandem,\nswapping implementations is trivial, due to the explicit boundaries between\nthem, and the use of traits. From a high-level, we have:\n\n* `nakamoto-client`: the core light-client library\n* `nakamoto-p2p`: the protocol state-machine implementation\n* `nakamoto-chain`: the block store and fork selection logic\n* `nakamoto-net-poll`: the default *poll*-based networking library\n* `nakamoto-common`: common functionality used by all crates\n* `nakamoto-node`: a standalone light-client daemon\n* `nakamoto-wallet`: a very basic watch-only wallet built on the above crates\n\nFor an overview of the above, see the [architecture diagram](docs/architecture.svg)\nin the `docs` folder.\n\n## Status\n\nWhile the project is still in its infancy, the base functionality has been\nimplemented. Nakamoto is able to discover peers, download and verify the\nlongest chain and handle forks, while implementing the full header verification\nprotocol.\n\nClient side block filtering (BIP 157/158) is implemented and working. See\n`nakamoto-wallet` for an example of how to use it.\n\nOnce peer-to-peer layer encryption (BIP 151) lands in Core, it will also\nbe implemented in Nakamoto.\n\nFinally, a C FFI will be implemented, to make it easy to embed the client\nin mobile applications.\n\nThough wallet functionality will slowly be added, it isn't the primary focus\nof this project, which sits one level below wallets.\n\n## Projects goals\n\n* __High assurance__: the library should be thoroughly tested using modern\n  techniques such as *property* and *model-based testing* as well as *discrete\n  event simulation* and *fuzzing*. These approaches benefit from a clean\n  separation between I/O and protocol logic and have been shown to catch more\n  bugs than unit testing.\n\n* __Security__: as a library that may find its way into wallet implementations,\n  a primary goal is security and auditability. For this reason, we try to\n  minimize the total dependency footprint, keep the code easy to read and\n  forbid any unsafe code.\n\n* __Efficiency__: blockchain synchronization should be done as efficiently as\n  possible, with low memory, disk and bandwidth overhead. We target\n  resource-constrained environments, such as mobile.\n\n* __Privacy__: when possible, privacy-preserving techniques should be employed.\n  *Client Side Block Filtering* (BIP 157/158) should be used over bloom\n  filters (BIP 37) to ensure user privacy and provide censorship resistance.\n\n## Running the tests\n\n    cargo test --all\n\n## Running the daemon\n\n    cargo run --release -p nakamoto-node -- --testnet\n\n## Contributing\n\nIf you'd like to contribute to the development of Nakamoto, please get in touch!\nOtherwise, do read the contribution [guidelines](CONTRIBUTING.md).\n\n## Donations\n\nTo help fund the project and ensure its ongoing development and maintenance, your\nsupport in Bitcoin is appreciated at the following address:\n\n    bc1qa47tl4vmz8j82wdsdkmxex30r23c9ljs84fxah\n\n## Motivation\n\nLooking at ecosystems that aren't light-client friendly—Ethereum for example—we\nsee that the vast majority of users are forced into trusting third parties when\ntransacting on the network.  This is completely counter to the idea and *raison\nd'être* of blockchains, and poses a giant security and privacy risk.\nUnfortunately, this is due to the lackluster support for light-clients, both at\nthe protocol level, and in terms of the available implementations. Light-clients\nare necessary for the average user to be able to securely interface with a\nnetwork like Ethereum or Bitcoin.\n\nFor this purpose, Nakamoto was conceived as a client that can efficiently run\non any mobile device, with the highest standards of privacy and security\nachievable given the constraints.\n\n## License\n\nLicensed under the MIT license.\n&copy; 2020 Alexis Sellier (<https://cloudhead.io>)\n",
  info: {
    name: "README.md",
    objectType: "BLOB",
    lastCommit: {
      sha1: "93dace5c86ccabb647a99e50e4f9382d24eab43b",
      author: { name: "Alexis Sellier", email: "self@cloudhead.io" },
      summary: "Migrate to edition 2021",
      description:
        "This includes a version bump to 0.3.0.\nThis includes support for rust 1.57",
      committer: { name: "Alexis Sellier", email: "self@cloudhead.io" },
      committerTime: 1638730635,
    },
  },
  path: "README.md",
};

export const infoMock = {
  head: "6e8a614a30adbfd681a472b89c54605f978b0b25",
  meta: {
    urn: "rad:git:hnrknktqojdakynn6kkkywjuz7xqgm85ziauo",
    name: "nakamoto",
    description:
      "Privacy-preserving Bitcoin light-client implementation in Rust",
    defaultBranch: "master",
    maintainers: ["rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio"],
    delegates: ["hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe"],
  },
};

export const peerMock = {
  id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
};

export const remoteMock = [
  "hyn9diwfnytahjq8u3iw63h9jte1ydcatxax3saymwdxqu1zo645pe",
];
