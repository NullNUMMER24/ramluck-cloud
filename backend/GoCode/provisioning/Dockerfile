FROM nixos/nix:2.23.0

# Enable flakes and nix-command
RUN echo "experimental-features = nix-command flakes" >> /etc/nix/nix.conf

# Copy your flake
COPY ./flake.nix /proxmox/
COPY ./flake.lock /proxmox/

WORKDIR /proxmox

# The container has no access to the /tmp dir
RUN export TMPDIR=/var/tmp

# Optionally pre-build the shell environment
# RUN nix develop --impure --command true

# Default command: drop into devShell interactively
CMD ["/bin/bash", "-c", "nix develop --impure"]
