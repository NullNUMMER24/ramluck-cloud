package vm_management

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"ramluck-cloud/config"
)

// Repo configuration
const (
	// Default to SSH URL, but we'll switch to HTTPS with token if needed
	repoURL = "@github.com/NullNUMMER24/ramluck-cloud-hosts.git"
	//localPath    = "/tmp/repo" // Local folder to clone into
	branchName   = "main"
	commitAuthor = "j.rohrbach@sensemail.ch"
)

// Pulls the latest changes or clones if not already present
func UpdateRepo() error {
	// Get the repo URL with token for HTTPS if available
	repoURLWithToken := getRepoURL()

	if _, err := os.Stat(config.REPO_LOCATION); os.IsNotExist(err) {
		fmt.Println("Cloning repo...")
		cmd := exec.Command("git", "clone", "-b", branchName, repoURLWithToken, config.REPO_LOCATION)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	} else {
		fmt.Println("Pulling latest changes...")
		cmd := exec.Command("git", "-C", config.REPO_LOCATION, "pull", "origin", branchName)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	}
}

// Creates a new folder in the repo
func CreateFolder(folderName string) error {
	if err := UpdateRepo(); err != nil {
		return err
	}

	fullPath := filepath.Join(config.REPO_LOCATION, folderName)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		fmt.Println("Creating folder:", folderName)
		return os.MkdirAll(fullPath, 0755)
	}
	fmt.Println("Folder already exists:", folderName)
	return nil
}

// Commits and pushes the new folder to GitHub
func CommitAndPushChanges(message string) error {
	//repoURLWithToken := getRepoURL()

	cmds := [][]string{
		{"git", "-C", config.REPO_LOCATION, "add", "."},
		{"git", "-C", config.REPO_LOCATION, "commit", "-m", message, "--author", commitAuthor},
		{"git", "-C", config.REPO_LOCATION, "push", "origin", branchName},
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
		return fmt.Sprintf("https://%s%s", token, repoURL) // Future note: make this more
	}
	// Fallback to SSH URL if no token is available
	return repoURL
}

// Example usage
// func main() {
// 	folderName := "new-feature-folder"

// 	if err := createFolder(folderName); err != nil {
// 		fmt.Println("Error creating folder:", err)
// 		return
// 	}

// 	if err := commitAndPushChanges("Add folder: " + folderName); err != nil {
// 		fmt.Println("Error committing and pushing changes:", err)
// 		return
// 	}

// 	fmt.Println("Successfully pushed changes.")
// }
