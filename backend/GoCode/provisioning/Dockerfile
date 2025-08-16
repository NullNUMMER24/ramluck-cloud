FROM nixos/nix:2.23.0

RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

# Install nixos-generators via flakes, not nix-env
RUN nix profile install --impure nixpkgs#nixos-generators nixpkgs#gawk

# Set proper PATH (important!)
ENV PATH="/root/.nix-profile/bin:/nix/var/nix/profiles/default/bin:${PATH}"

WORKDIR /build
