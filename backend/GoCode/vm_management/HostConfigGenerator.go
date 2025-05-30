package vm_management

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/noirbizarre/gonja"
)

func RenderTemplate(hostname string) {
	UpdateRepo()
	// Path to the template and output
	templatePath := "vm_management/templates/configuration.nix"
	folderPath := "/tmp/repo/hosts/" + hostname
	outputPath := fmt.Sprintf("%s/configuration.nix", folderPath)

	// Define your context (variables used in the template)
	context := gonja.Context{
		"hostname": "example-host",
		"username": "janrohrbach",
	}

	// Load the template
	tpl, err := gonja.FromFile(templatePath)
	if err != nil {
		fmt.Println("Error loading template:", err)
		return
	}

	// Render the template with the context
	rendered, err := tpl.Execute(context)
	if err != nil {
		fmt.Println("Error rendering template:", err)
		return
	}

	// Ensure output directory exists
	err = os.MkdirAll(filepath.Dir(outputPath), 0755)
	if err != nil {
		fmt.Println("Error creating output directory:", err)
		return
	}

	// Write to the output file
	err = os.WriteFile(outputPath, []byte(rendered), 0644)
	if err != nil {
		fmt.Println("Error writing file:", err)
		return
	}

	fmt.Println("Template rendered successfully to:", outputPath)
	CommitAndPushChanges("Rendered configuration.nix for <insert hostname>")
}
