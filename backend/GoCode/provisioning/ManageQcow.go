package provisioning

func main() {
	BuildDockerImage("nix-builder")
	RunContainer("nix-builder", "/home/jamie/git/nixos-dotfiles/", "Frankenstein")
	// Define the command and its arguments
	// cmd := "nix"
	// args := []string{
	// 	"build",
	// 	"--out-link",
	// 	"image.qcow2",
	// 	"/home/jamie/git/nixos-dotfiles#nixosConfigurations.sisyphus",
	// }

	// // Create a new command
	// command := exec.Command(cmd, args...)

	// // Set the output buffer
	// var out bytes.Buffer
	// var stderr bytes.Buffer
	// command.Stdout = &out
	// command.Stderr = &stderr

	// // Run the command
	// err := command.Run()
	// if err != nil {
	// 	log.Printf("Error: %v\n", err)
	// 	log.Printf("Output: %s\n", out.String())
	// 	log.Printf("Error output: %s\n", stderr.String())
	// } else {
	// 	log.Printf("Output: %s\n", out.String())
	// }
}
