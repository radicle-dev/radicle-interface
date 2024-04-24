{
  description = "Radicle web frontend";
  inputs = {
    nixpkgs.follows = "heartwood/nixpkgs";
    flake-utils.follows = "heartwood/flake-utils";
    heartwood = {
      url = "git+https://seed.radicle.xyz/z3gqcJUoA1n9HaHKufZs5FCSGazv5.git?ref=master&rev=c607619683e859fd715a23377c03fb08dc8090f4";
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
      nixosModules.radicle-interface = { config, lib, pkgs, ... }: {
        options.services.radicle-interface.enable = lib.mkEnableOption "Local radicle web interface";
        config = lib.mkIf config.services.radicle-interface.enable {
          services.nginx = {
            enable = true;
            virtualHosts.localhost = {
              listen = [ { addr = "127.0.0.1"; port = 4433; ssl = false; } ];
              rejectSSL = true;
              locations = {
                "/" = {
                  index = "index.html";
                  root = self.packages.${pkgs.system}.radicle-interface;
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
        radicle-interface =  self.packages.${system}.radicle-interface.override { doCheck = true; };
      };

      packages = {
        default = self.packages.${system}.radicle-interface;
        twemoji-assets = pkgs.fetchFromGitHub {
          owner = "twitter";
          repo = "twemoji";
          rev = "v14.0.2";
          hash = "sha256-YoOnZ5uVukzi/6bLi22Y8U5TpplPzB7ji42l+/ys5xI=";
        };

        radicle-interface = pkgs.callPackage ({
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
          pname = "radicle-interface";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-E2M1aHKxustlneEx/H+UYR45eYkYpQgUgvbAHaXzuC4=";
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
            heartwoodRev="${heartwood.rev or "unknown"}"
            expRev=$(cat tests/support/heartwood-version)
            if [ "''${heartwoodRev#$expRev}" = "$heartwoodRev" ]; then
              printf "Error: Expecting heartwood binaries revision '%s', got '%s'" "$expRev" "$heartwoodRev" >&2
              exit 1
            fi
            echo unknown > tests/support/heartwood-version
            scripts/install-binaries -l ${checkBins}/bin
            scripts/check
            {
              npm run test:unit
              npm run test:httpd-api:unit
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
