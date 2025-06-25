FROM nixos/nix:2.23.0

# Enable flakes and nix-command
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

# Install nixos generators
RUN nix-env -iA nixpkgs.nixos-generators

WORKDIR /build