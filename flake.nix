{
  description = "Radicle web frontend";
  inputs = {
    nixpkgs.follows = "heartwood/nixpkgs";
    flake-utils.follows = "heartwood/flake-utils";
    heartwood = {
      url = "git+https://seed.radicle.xyz/z3gqcJUoA1n9HaHKufZs5FCSGazv5.git?ref=refs/namespaces/z6MksFqXN3Yhqk8pTJdUGLwATkRfQvwZXPqR2qMEhbS9wzpT/refs/tags/v1.0.0-rc.8";
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
      pkgs = nixpkgs.legacyPackages.${system};
      inherit (pkgs) lib;
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
              (radicle-httpd.overrideAttrs devProfile)
            ];
          };
        in buildNpmPackage rec {
          pname = "radicle-explorer";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-T2r9qTpXENG+uXZVa0KQW6j0BY8vrk7rPAGYPYAFF1A=";
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
      };
    }));
}
