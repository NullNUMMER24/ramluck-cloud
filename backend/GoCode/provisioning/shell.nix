# Dependency file for Dockerfile
with import <nixpkgs> {};
mkShell {
  buildInputs = [
    nixos-generators
    git
    gawk
  ];
}