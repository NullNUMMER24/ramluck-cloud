package provisioning

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
)

// This runs a image in the background. Set imageName to the name of Image to use (e.g. "bfirsh/reticulate-splines")
func RunContainer(imageName string, configPath string, hostName string) {
	hostConfig := fmt.Sprintf("%s#%s", configPath, hostName) // Make the hostname variable
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		panic(err)
	}
	defer cli.Close()

	out, err := cli.ImagePull(ctx, imageName, image.PullOptions{})
	if err != nil {
		panic(err)
	}
	defer out.Close()
	io.Copy(os.Stdout, out)

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: imageName,
		Cmd:   []string{"-f", "proxmox", "--flake", hostConfig},
	}, nil, nil, nil, "")
	if err != nil {
		panic(err)
	}

	if err := cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		panic(err)
	}

	fmt.Println(resp.ID)
}

func BuildDockerImage(imageName string) {
	tag := "latest"
	dockerfilePath := "." // Path where your Dockerfile is

	cmd := exec.Command("docker", "build", "-t", fmt.Sprintf("%s:%s", imageName, tag), dockerfilePath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		fmt.Printf("Error building Docker image: %v\n", err)
	} else {
		fmt.Printf("Docker image %s:%s built successfully\n", imageName, tag)
	}
}
