# Use the golang:alpine image as the base image
FROM nixos/nix

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Copy nix conf
COPY nix-conf/* /etc/nixos/

# Update nix-channel
RUN nix-channel --update
RUN export NIXPKGS_ALLOW_INSECURE=1
RUN nix-build /etc/nixos#nixosConfigurations.my-machine.config.system.build.toplevel
# Rebuild nixos
#RUN nixos-rebuild switch --flake /etc/nixos#sisyphus

# Build the Go application
RUN go build -o main .

# Expose the port that the application will listen on
EXPOSE 8080

# Run the Go application
CMD ["/app/main"]
