package api_functions

import (
	"net/http"
	"ramluck-cloud/tables"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Add to api_functions.go

// VM DTOs
type CreateVMRequest struct {
	VMName         string `json:"vm_name" binding:"required"`
	VMIP           string `json:"vm_ip" binding:"required,ipv4"`
	VMStatus       string `json:"vm_status" binding:"required,oneof=running stopped maintenance"`
	Description    string `json:"description"`
	OwnerID        uint   `json:"owner_id" binding:"required"`
	OSID           uint   `json:"os_id" binding:"required"`
	ApplicationIDs []uint `json:"application_ids"`
}

type UpdateVMRequest struct {
	VMName      string `json:"vm_name"`
	VMIP        string `json:"vm_ip" binding:"omitempty,ipv4"`
	VMStatus    string `json:"vm_status" binding:"omitempty,oneof=running stopped maintenance"`
	Description string `json:"description"`
}

// CreateVM creates a new virtual machine (Admin only)
func CreateVM(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateVMRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate relationships exist
		var os tables.OperatingSystem
		if err := db.First(&os, req.OSID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OS ID"})
			return
		}

		var group tables.Group
		if err := db.First(&group, req.OwnerID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Owner ID"})
			return
		}

		var applications []tables.Application
		if err := db.Find(&applications, req.ApplicationIDs).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Application IDs"})
			return
		}

		vm := tables.VM{
			VMName:       req.VMName,
			VMIP:         req.VMIP,
			VMStatus:     req.VMStatus,
			Description:  req.Description,
			OwnerID:      req.OwnerID,
			OSID:         req.OSID,
			Applications: applications,
		}

		if err := db.Create(&vm).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create VM"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "VM created", "vm": vm})
	}
}

// GetAllVMs retrieves all virtual machines
func GetAllVMs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var vms []tables.VM
		if err := db.Preload("Owner").
			Preload("OS").
			Preload("Applications").
			Find(&vms).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve VMs"})
			return
		}
		c.JSON(http.StatusOK, vms)
	}
}

// GetVMDetails retrieves specific VM information
func GetVMDetails(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		vmID := c.Param("id")
		var vm tables.VM

		if err := db.Preload("Owner").
			Preload("OS").
			Preload("Applications").
			First(&vm, vmID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "VM not found"})
			return
		}

		c.JSON(http.StatusOK, vm)
	}
}

// UpdateVM updates VM details (Admin only)
func UpdateVM(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		vmID := c.Param("id")
		var req UpdateVMRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var vm tables.VM
		if err := db.First(&vm, vmID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "VM not found"})
			return
		}

		if req.VMName != "" {
			vm.VMName = req.VMName
		}
		if req.VMIP != "" {
			vm.VMIP = req.VMIP
		}
		if req.VMStatus != "" {
			vm.VMStatus = req.VMStatus
		}
		if req.Description != "" {
			vm.Description = req.Description
		}

		if err := db.Save(&vm).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update VM"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "VM updated", "vm": vm})
	}
}

// DeleteVM removes a VM (Admin only)
func DeleteVM(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		vmID := c.Param("id")
		var vm tables.VM

		if err := db.First(&vm, vmID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "VM not found"})
			return
		}

		if err := db.Delete(&vm).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete VM"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "VM deleted"})
	}
}

// ManageVMApplications updates applications for a VM (Admin only)
func ManageVMApplications(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		vmID := c.Param("id")
		var req struct {
			Add    []uint `json:"add"`
			Remove []uint `json:"remove"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var vm tables.VM
		if err := db.First(&vm, vmID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "VM not found"})
			return
		}

		// Add applications
		if len(req.Add) > 0 {
			var appsToAdd []tables.Application
			if err := db.Find(&appsToAdd, req.Add).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application IDs to add"})
				return
			}
			db.Model(&vm).Association("Applications").Append(appsToAdd)
		}

		// Remove applications
		if len(req.Remove) > 0 {
			var appsToRemove []tables.Application
			if err := db.Find(&appsToRemove, req.Remove).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid application IDs to remove"})
				return
			}
			db.Model(&vm).Association("Applications").Delete(appsToRemove)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Applications updated"})
	}
}
