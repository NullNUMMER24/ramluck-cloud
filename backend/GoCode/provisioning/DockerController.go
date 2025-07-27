package provisioning

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/moby/moby/api/types"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
)

// BuildDockerImage builds a Docker image using the Moby client
func BuildDockerImage(imageName, dockerfilePath string) error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return fmt.Errorf("failed to create Docker client: %w", err)
	}
	defer cli.Close()

	buildContext, err := createBuildContext(dockerfilePath)
	if err != nil {
		return fmt.Errorf("failed to create build context: %w", err)
	}
	defer os.RemoveAll(buildContext.Name())

	buildOptions := types.ImageBuildOptions{
		Tags:       []string{imageName},
		Dockerfile: "Dockerfile",
		Remove:     true,
	}

	buildResponse, err := cli.ImageBuild(ctx, buildContext, buildOptions)
	if err != nil {
		return fmt.Errorf("failed to build image: %w", err)
	}
	defer buildResponse.Body.Close()

	// Stream build output to stdout
	_, err = io.Copy(os.Stdout, buildResponse.Body)
	if err != nil {
		return fmt.Errorf("error reading build output: %w", err)
	}

	fmt.Printf("\nSuccessfully built image: %s\n", imageName)
	return nil
}

// RunContainer creates and starts a container using the Moby client
func RunContainer(imageName string, commandArgs []string, containerName string) (string, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return "", fmt.Errorf("failed to create Docker client: %w", err)
	}
	defer cli.Close()

	// Check if image exists locally
	_, _, err = cli.ImageInspectWithRaw(ctx, imageName)
	if err != nil {
		if client.IsErrNotFound(err) {
			// Pull image if not found
			fmt.Printf("Pulling image: %s\n", imageName)
			out, err := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
			if err != nil {
				return "", fmt.Errorf("failed to pull image: %w", err)
			}
			defer out.Close()
			io.Copy(os.Stdout, out)
		} else {
			return "", fmt.Errorf("failed to inspect image: %w", err)
		}
	}

	// Create container configuration
	containerConfig := &container.Config{
		Image: imageName,
		Cmd:   commandArgs,
		Tty:   true,
	}

	// Create container
	resp, err := cli.ContainerCreate(
		ctx,
		containerConfig,
		&container.HostConfig{},
		nil,
		nil,
		containerName,
	)
	if err != nil {
		return "", fmt.Errorf("failed to create container: %w", err)
	}
	containerID := resp.ID

	// Start container
	if err := cli.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return containerID, fmt.Errorf("failed to start container: %w", err)
	}

	// Get container information
	containerInfo, err := cli.ContainerInspect(ctx, containerID)
	if err != nil {
		return containerID, fmt.Errorf("container started but inspection failed: %w", err)
	}

	fmt.Printf("Container started successfully!\nID: %s\nName: %s\nStatus: %s\n",
		containerID,
		containerInfo.Name,
		containerInfo.State.Status,
	)

	return containerID, nil
}

// Helper function to create build context
func createBuildContext(dockerfilePath string) (*os.File, error) {
	// Create a tarball of the build context
	tmpFile, err := os.CreateTemp("", "docker-build-context-*.tar")
	if err != nil {
		return nil, err
	}

	cmd := exec.Command("tar", "-cf", tmpFile.Name(), "-C", dockerfilePath, ".")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		tmpFile.Close()
		os.Remove(tmpFile.Name())
		return nil, fmt.Errorf("failed to create build context tarball: %w", err)
	}

	// Reset file pointer to beginning
	if _, err := tmpFile.Seek(0, 0); err != nil {
		tmpFile.Close()
		os.Remove(tmpFile.Name())
		return nil, err
	}

	return tmpFile, nil
}
