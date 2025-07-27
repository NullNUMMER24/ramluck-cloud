package provisioning

import (
	"fmt"
	"log"
)

func BuildRamluckImageBuilder() {
	fmt.Println("builing docker image")
	// Build an image
	err := BuildDockerImage("my-app", "./dockerfiles")
	if err != nil {
		log.Fatalf("Build failed: %v", err)
	}

	// Run a container
	containerID, err := RunContainer(
		"my-app:latest",
		[]string{"-f", "proxmox", "--flake", "configs#host1"},
		"my-container",
	)

	if err != nil {
		log.Fatalf("Run failed: %v", err)
	} else {
		fmt.Printf("Container running with ID: %s\n", containerID)
	}
}
