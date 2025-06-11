{
  description = "My NixOS System";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";  # Use your desired channel
  };

  outputs = { self, nixpkgs, ... }@inputs: {
    nixosConfigurations = {
      # Replace "my-machine" with your hostname
      my-machine = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";  # Set your system architecture
        modules = [
          ./configuration.nix  # Your system configuration
        ];
      };
    };
  };
}