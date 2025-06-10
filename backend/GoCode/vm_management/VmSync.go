package vm_management

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"ramluck-cloud/config"
	"ramluck-cloud/tables"

	"gorm.io/gorm"
)

func SyncVmsToGit(db *gorm.DB) {
	var vms []tables.VM

	if err := db.Find(&vms).Error; err != nil {
		log.Printf("Error fetching VMs: %v", err)
		return
	}

	for _, vm := range vms {
		checkPath := filepath.Join(config.REPO_LOCATION, "/hosts/", vm.VMName, "/configuration.nix")
		if _, err := os.Stat(checkPath); err == nil {
			fmt.Printf("[✔] File exists for VM %s at %s\n", vm.VMName, checkPath) // mby smart to implement log?
		} else if os.IsNotExist(err) {
			fmt.Printf("[✖] File missing for VM %s\n", vm.VMName)
			fmt.Printf("    Trying to update repository... %s\n", vm.VMName)
			if err := RenderTemplate(vm.VMName); err != nil { // Render new template into the repo
				fmt.Printf("[!] Error rendering template for VM %s: %v\n", vm.VMName, err)
			}
		} else {
			fmt.Printf("[!] Error checking file for VM %s: %v\n", vm.VMName, err)
		}
	}
}
