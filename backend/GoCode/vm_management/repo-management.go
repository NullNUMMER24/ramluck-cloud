package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// Repo configuration
const (
	// Default to SSH URL, but we'll switch to HTTPS with token if needed
	repoURL      = "git@github.com:NullNUMMER24/ramluck-cloud-hosts.git"
	localPath    = "./repo" // Local folder to clone into
	branchName   = "main"
	commitAuthor = "j.rohrbach@sensemail.ch"
)

// Pulls the latest changes or clones if not already present
func updateRepo() error {
	// Get the repo URL with token for HTTPS if available
	repoURLWithToken := getRepoURL()

	if _, err := os.Stat(localPath); os.IsNotExist(err) {
		fmt.Println("Cloning repo...")
		cmd := exec.Command("git", "clone", "-b", branchName, repoURLWithToken, localPath)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	} else {
		fmt.Println("Pulling latest changes...")
		cmd := exec.Command("git", "-C", localPath, "pull", "origin", branchName)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	}
}

// Creates a new folder in the repo
func createFolder(folderName string) error {
	if err := updateRepo(); err != nil {
		return err
	}

	fullPath := filepath.Join(localPath, folderName)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		fmt.Println("Creating folder:", folderName)
		return os.MkdirAll(fullPath, 0755)
	}
	fmt.Println("Folder already exists:", folderName)
	return nil
}

// Commits and pushes the new folder to GitHub
func commitAndPushChanges(message string) error {
	//repoURLWithToken := getRepoURL()

	cmds := [][]string{
		{"git", "-C", localPath, "add", "."},
		{"git", "-C", localPath, "commit", "-m", message, "--author", commitAuthor},
		{"git", "-C", localPath, "push", "origin", branchName},
	}

	for _, args := range cmds {
		cmd := exec.Command(args[0], args[1:]...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		err := cmd.Run()
		if err != nil {
			return err
		}
	}
	return nil
}

// Function to construct the repo URL with the token (if needed)
func getRepoURL() string {
	// Check if the GITHUB_TOKEN environment variable is set
	token := os.Getenv("GITHUB_TOKEN")
	if token != "" {
		// Construct HTTPS URL with token for authentication
		return fmt.Sprintf("https://%s@github.com/NullNUMMER24/ramluck-cloud-hosts.git", token) // Future note: make this more variable
	}
	// Fallback to SSH URL if no token is available
	return repoURL
}

// Example usage
func main() {
	folderName := "new-feature-folder"

	if err := createFolder(folderName); err != nil {
		fmt.Println("Error creating folder:", err)
		return
	}

	if err := commitAndPushChanges("Add folder: " + folderName); err != nil {
		fmt.Println("Error committing and pushing changes:", err)
		return
	}

	fmt.Println("Successfully pushed changes.")
}
