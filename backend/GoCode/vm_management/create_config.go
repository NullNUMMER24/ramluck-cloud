package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// Config holds the configuration for the script
type Config struct {
	RepoURL      string
	LocalPath    string
	SubDirectory string
	Modules      []string
	Templates    map[string]string
	GitUserName  string
	GitUserEmail string
	BranchName   string
}

func main() {
	// Configuration
	config := Config{
		RepoURL:      "https://github.com/example/repo.git",
		LocalPath:    "./my-repo",
		SubDirectory: "modules",
		Modules:      []string{"auth", "dashboard", "api"},
		Templates: map[string]string{
			"auth":     "templates/auth.tmpl",
			"dashboard": "templates/dashboard.tmpl",
			"api":      "templates/api.tmpl",
		},
		GitUserName:  "Your Name",
		GitUserEmail: "your.email@example.com",
		BranchName:   "feature/auto-generated-modules",
	}

	// Update the repository
	err := updateRepository(config.RepoURL, config.LocalPath)
	if err != nil {
		fmt.Printf("Error updating repository: %v\n", err)
		return
	}

	// Switch to or create the branch
	err = switchOrCreateBranch(config.LocalPath, config.BranchName)
	if err != nil {
		fmt.Printf("Error switching/creating branch: %v\n", err)
		return
	}

	// Create module directories and render templates
	changesMade := false
	for _, module := range config.Modules {
		modulePath := filepath.Join(config.LocalPath, config.SubDirectory, module)
		
		// Create module directory
		err := createModuleDirectory(modulePath)
		if err != nil {
			fmt.Printf("Error creating module directory %s: %v\n", module, err)
			continue
		}

		// Render template if it exists for this module
		if templatePath, ok := config.Templates[module]; ok {
			data := struct {
				ModuleName string
				Timestamp  string
			}{
				ModuleName: module,
				Timestamp:  time.Now().Format(time.RFC3339),
			}

			outputFile := filepath.Join(modulePath, fmt.Sprintf("%s_config.json", module))
			err := renderTemplate(templatePath, outputFile, data)
			if err != nil {
				fmt.Printf("Error rendering template for %s: %v\n", module, err)
			} else {
				fmt.Printf("Successfully rendered template for %s\n", module)
				changesMade = true
			}
		}
	}

	// Only commit and push if changes were made
	if changesMade {
		// Set git user info
		err = setGitUserInfo(config.LocalPath, config.GitUserName, config.GitUserEmail)
		if err != nil {
			fmt.Printf("Error setting git user info: %v\n", err)
			return
		}

		// Commit changes
		commitMessage := "Auto-generated module configurations"
		err = commitChanges(config.LocalPath, commitMessage)
		if err != nil {
			fmt.Printf("Error committing changes: %v\n", err)
			return
		}

		// Push changes
		err = pushChanges(config.LocalPath, config.BranchName)
		if err != nil {
			fmt.Printf("Error pushing changes: %v\n", err)
			return
		}

		fmt.Println("Successfully pushed changes to repository")
	} else {
		fmt.Println("No changes were made, skipping git push")
	}
}

// updateRepository clones or pulls the latest changes from a git repository
func updateRepository(repoURL, localPath string) error {
	// Check if repository already exists
	if _, err := os.Stat(filepath.Join(localPath, ".git")); os.IsNotExist(err) {
		// Clone the repository if it doesn't exist
		fmt.Printf("Cloning repository %s to %s\n", repoURL, localPath)
		cmd := exec.Command("git", "clone", repoURL, localPath)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	}

	// Pull latest changes if repository exists
	fmt.Printf("Pulling latest changes in %s\n", localPath)
	cmd := exec.Command("git", "-C", localPath, "pull")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// switchOrCreateBranch switches to an existing branch or creates a new one
func switchOrCreateBranch(repoPath, branchName string) error {
	// Check if branch exists
	cmd := exec.Command("git", "-C", repoPath, "show-ref", "--verify", "--quiet", 
		fmt.Sprintf("refs/heads/%s", branchName))
	err := cmd.Run()
	
	if err != nil {
		// Branch doesn't exist, create it
		fmt.Printf("Creating new branch: %s\n", branchName)
		cmd = exec.Command("git", "-C", repoPath, "checkout", "-b", branchName)
	} else {
		// Branch exists, switch to it
		fmt.Printf("Switching to existing branch: %s\n", branchName)
		cmd = exec.Command("git", "-C", repoPath, "checkout", branchName)
	}
	
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// createModuleDirectory creates a directory for a module
func createModuleDirectory(path string) error {
	// Check if directory already exists
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		fmt.Printf("Module directory already exists: %s\n", path)
		return nil
	}

	fmt.Printf("Creating module directory: %s\n", path)
	return os.MkdirAll(path, 0755)
}

// renderTemplate renders a template file to an output file with the given data
func renderTemplate(templatePath, outputFile string, data interface{}) error {
	// Read template file
	tmplContent, err := ioutil.ReadFile(templatePath)
	if err != nil {
		return fmt.Errorf("error reading template file: %v", err)
	}

	// Create template
	tmpl, err := template.New("module").Parse(string(tmplContent))
	if err != nil {
		return fmt.Errorf("error parsing template: %v", err)
	}

	// Create output file
	file, err := os.Create(outputFile)
	if err != nil {
		return fmt.Errorf("error creating output file: %v", err)
	}
	defer file.Close()

	// Execute template
	err = tmpl.Execute(file, data)
	if err != nil {
		return fmt.Errorf("error executing template: %v", err)
	}

	return nil
}

// setGitUserInfo configures the git user name and email
func setGitUserInfo(repoPath, name, email string) error {
	fmt.Println("Setting git user info")
	
	// Set user name
	cmd := exec.Command("git", "-C", repoPath, "config", "user.name", name)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error setting git user name: %v", err)
	}
	
	// Set user email
	cmd = exec.Command("git", "-C", repoPath, "config", "user.email", email)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error setting git user email: %v", err)
	}
	
	return nil
}

// commitChanges commits all changes in the repository
func commitChanges(repoPath, message string) error {
	fmt.Println("Committing changes")
	
	// Add all files
	cmd := exec.Command("git", "-C", repoPath, "add", ".")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error adding files: %v", err)
	}
	
	// Commit changes
	cmd = exec.Command("git", "-C", repoPath, "commit", "-m", message)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// pushChanges pushes changes to the remote repository
func pushChanges(repoPath, branchName string) error {
	fmt.Printf("Pushing changes to branch %s\n", branchName)
	cmd := exec.Command("git", "-C", repoPath, "push", "origin", branchName)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}/