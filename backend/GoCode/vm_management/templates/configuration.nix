# configuration.nix
{ config, pkgs, ... }:

{
  networking.hostName = "{{ hostname }}";
  users.users.{{ username }} = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
  };
}
