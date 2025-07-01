FROM nixos/nix:2.26.4

# Enable flakes and nix-command
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

ENV NIX_CONFIG="extra-experimental-features = flakes nix-command"

# Copy your shell.nix into the image
COPY shell.nix /shell.nix

# Optional: Pre-cache dependencies (speeds up first run)
RUN nix-shell /shell.nix --run "echo 'Dependencies cached'"

# Set working directory
WORKDIR /build

# Entrypoint using nix-shell
ENTRYPOINT ["nix-shell", "/shell.nix", "--run"]