FROM nixos/nix:2.23.0

# Enable flakes and nix-command
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

# Copy Nix environment definition
COPY shell.nix .

# Install dependencies
RUN nix-env -if shell.nix

WORKDIR /build
ENTRYPOINT ["nixos-generate"]