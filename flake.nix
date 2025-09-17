{
  description = "Bevy WASM development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };

        rust = pkgs.rust-bin.stable.latest.default;
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # rust
            # pkgs.trunk          # Build/serve wasm projects
            # pkgs.wasm-bindgen-cli
            # pkgs.binaryen       # For wasm-opt
            # pkgs.pkg-config
            # pkgs.cmake
            pkgs.busybox
          ];

          shellHook = ''
            echo "Bevy WASM dev shell ready!"
            rustup target add wasm32-unknown-unknown
          '';
        };
      });
}
