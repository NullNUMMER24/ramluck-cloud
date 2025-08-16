{
  description = "Nix flake for building NixOS Proxmox images";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        # Dev shell with the needed tools
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nixos-generators
            pkgs.gawk
            pkgs.git
            pkgs.curl
          ];

          # shellHook = ''
          #   echo "🧪 Welcome to the NixOS image build shell!"
          # '';
        };

        # Optional: expose nixos-generators as a top-level package too
        packages.default = pkgs.nixos-generators;
      });
}

