{
  description = "Radicle web frontend";
  inputs = {
    nixpkgs.follows = "heartwood/nixpkgs";
    flake-utils.follows = "heartwood/flake-utils";
    heartwood = {
      url = "git+https://seed.radicle.xyz/z3gqcJUoA1n9HaHKufZs5FCSGazv5.git?ref=refs/namespaces/z6MksFqXN3Yhqk8pTJdUGLwATkRfQvwZXPqR2qMEhbS9wzpT/refs/tags/v1.0.0-rc.11";
    };
  };

  outputs = {
    self,
    heartwood,
    nixpkgs,
    flake-utils,
    ...
  }@inputs:
    {
      nixosModules.radicle-explorer = { config, lib, pkgs, ... }: {
        options.services.radicle-explorer.enable = lib.mkEnableOption "Local radicle web interface";
        config = lib.mkIf config.services.radicle-explorer.enable {
          services.nginx = {
            enable = true;
            virtualHosts.localhost = {
              listen = [ { addr = "127.0.0.1"; port = 4433; ssl = false; } ];
              rejectSSL = true;
              locations = {
                "/" = {
                  index = "index.html";
                  root = self.packages.${pkgs.system}.radicle-explorer;
                  extraConfig = ''
                    try_files $uri $uri/ /index.html;
                  '';
                };
              };
            };
          };
        };
      };
    } //

    (flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [(import heartwood.inputs.rust-overlay)];
      };
      inherit (pkgs) lib;

      rustToolChain = pkgs.rust-bin.fromRustupToolchainFile radicle-httpd/rust-toolchain;
      craneLib = (heartwood.inputs.crane.mkLib pkgs).overrideToolchain rustToolChain;
      basicArgs = {
        pname = "radicle-httpd";
        src = ./radicle-httpd;
        strictDeps = true;
      };
    in {

      checks = {
        radicle-explorer =  self.packages.${system}.radicle-explorer.override { doCheck = true; };
      };

      packages = {
        default = self.packages.${system}.radicle-explorer;

        twemoji-assets = pkgs.fetchFromGitHub {
          owner = "twitter";
          repo = "twemoji";
          rev = "v14.0.2";
          hash = "sha256-YoOnZ5uVukzi/6bLi22Y8U5TpplPzB7ji42l+/ys5xI=";
        };

        radicle-explorer = pkgs.callPackage ({
          lib, buildNpmPackage, doCheck ? false
        }: let
          # We need rad debug binaries
          devProfile = _: { CARGO_PROFILE = ""; };
          checkBins = pkgs.buildEnv {
            name = "heartwood-debug-bins";
            paths = with heartwood.packages.${system}; [
              (default.overrideAttrs devProfile)
              self.packages.${system}.radicle-httpd
            ];
          };
        in buildNpmPackage rec {
          pname = "radicle-explorer";
          version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
          src = ./.;
          npmDepsHash = "sha256-JerBiY39TNsrDmdoJIZNuUhekP860q6/0ttSL/Gd7e0=";
          postPatch = ''
            patchShebangs --build ./scripts
            mkdir -p "public/twemoji"
            cp -t public/twemoji -r -- ${self.packages.${system}.twemoji-assets}/assets/svg/*
            : >scripts/install-twemoji-assets
          '';
          dontConfigure = true;

          inherit doCheck;
          nativeCheckInputs = with pkgs; [
            which
            gitMinimal
          ];
          checkPhase = ''
            runHook preCheck
            scripts/install-binaries -l ${checkBins}/bin
            scripts/check
            {
              npm run test:unit
              npm run test:http-client:unit
            } | tee /dev/null
            runHook postCheck
          '';

          installPhase = ''
            runHook preInstall
            mkdir -p "$out"
            cp -r -t "$out" build/*
            runHook postInstall
          '';
        }) {};

        radicle-httpd = craneLib.buildPackage (basicArgs // {
          inherit (craneLib.crateNameFromCargoToml {cargoToml = ./radicle-httpd + "/Cargo.toml";}) pname version;
          cargoArtifacts = craneLib.buildDepsOnly basicArgs;

          nativeBuildInputs = with pkgs;
            [
              git
              # Add additional build inputs here
              asciidoctor installShellFiles
            ]
            ++ lib.optionals pkgs.stdenv.isDarwin (with pkgs; [
              # Additional darwin specific inputs can be set here
              libiconv
              darwin.apple_sdk.frameworks.Security
            ]);

          env =
            {
              RADICLE_VERSION = "nix-" + (self.shortRev or self.dirtyShortRev or "unknown");
            }
            // (
              if self ? rev || self ? dirtyRev
              then {
                GIT_HEAD = self.rev or self.dirtyRev;
              }
              else {}
            );

          cargoExtraArgs = "-p radicle-httpd";
          doCheck = false;
          postInstall = ''
            for page in radicle-httpd.1.adoc; do
              asciidoctor -d manpage -b manpage $page
              installManPage ''${page::-5}
            done
          '';
        });
      };
    }));
}
