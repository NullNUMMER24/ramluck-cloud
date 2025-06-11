onfiguration.nix
{ config, pkgs, ... }:

{
  imports =
  [ # Include the results of the hardware scan.
    #../../nix-config/jfetch.nix
  ];
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;

  users.users.jamie = {
    isNormalUser = true;
    extraGroups = [ "wheel" ]; # Enable ‘sudo’ for the user.
    initialPassword = "test";
  };

  networking.hostName = "Frankenstein"; # Define your hostname.
  networking.firewall.enable = false;

  boot.kernelParams = [
    "console=tty1"
    "console=ttyS0,115200"
  ];

  environment.systemPackages = with pkgs; [
    go
    git
    vim
  ];

  system.stateVersion = "25.05";
}