package api_functions

import (
	"net/http"
	"ramluck-cloud/tables"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Add to api_functions.go

// OS DTOs
type CreateOSRequest struct {
	OSName          string `json:"os_name" binding:"required"`
	OSVersion       string `json:"os_version" binding:"required"`
	LinkToOSWebsite string `json:"link_to_os_website" binding:"required,url"`
}

type UpdateOSRequest struct {
	OSName          string `json:"os_name"`
	OSVersion       string `json:"os_version"`
	LinkToOSWebsite string `json:"link_to_os_website" binding:"omitempty,url"`
}

// @Summary Create a new operating system
// @Description Create a new OS entry (Admin only)
// @Tags Operating Systems
// @Accept json
// @Produce json
// @Param body body CreateOSRequest true "OS details"
// @Success 201 {object} map[string]interface{} "OS created successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 409 {object} map[string]string "OS version already exists"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /os [post]
func CreateOS(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateOSRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check for existing OS version
		var existingOS tables.OperatingSystem
		if err := db.Where("os_name = ? AND os_version = ?", req.OSName, req.OSVersion).First(&existingOS).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "OS version already exists"})
			return
		}

		newOS := tables.OperatingSystem{
			OSName:          req.OSName,
			OSVersion:       req.OSVersion,
			LinkToOSWebsite: req.LinkToOSWebsite,
		}

		if err := db.Create(&newOS).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create OS entry"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "OS created", "os": newOS})
	}
}

// @Summary Update an operating system
// @Description Update OS details by ID (Admin only)
// @Tags Operating Systems
// @Accept json
// @Produce json
// @Param id path int true "OS ID"
// @Param body body UpdateOSRequest true "Updated OS details"
// @Success 200 {object} map[string]interface{} "OS updated successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "OS not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /os/{id} [put]
func UpdateOS(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		osID := c.Param("id")
		var req UpdateOSRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var os tables.OperatingSystem
		if err := db.First(&os, osID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "OS not found"})
			return
		}

		if req.OSName != "" {
			os.OSName = req.OSName
		}
		if req.OSVersion != "" {
			os.OSVersion = req.OSVersion
		}
		if req.LinkToOSWebsite != "" {
			os.LinkToOSWebsite = req.LinkToOSWebsite
		}

		if err := db.Save(&os).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update OS"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "OS updated", "os": os})
	}
}

// @Summary Get all operating systems
// @Description Retrieve a list of all OS entries
// @Tags Operating Systems
// @Produce json
// @Success 200 {array} tables.OperatingSystem "List of operating systems"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /os [get]
func GetAllOS(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var osList []tables.OperatingSystem
		if err := db.Order("os_name, os_version").Find(&osList).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve OS list"})
			return
		}
		c.JSON(http.StatusOK, osList)
	}
}

// @Summary Get operating system details
// @Description Retrieve details of an OS by ID
// @Tags Operating Systems
// @Produce json
// @Param id path int true "OS ID"
// @Success 200 {object} tables.OperatingSystem "OS details"
// @Failure 404 {object} map[string]string "OS not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /os/{id} [get]
func GetOSDetails(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		osID := c.Param("id")
		var os tables.OperatingSystem

		if err := db.First(&os, osID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "OS not found"})
			return
		}

		c.JSON(http.StatusOK, os)
	}
}

// @Summary Delete an operating system
// @Description Delete an OS entry by ID (Admin only)
// @Tags Operating Systems
// @Param id path int true "OS ID"
// @Success 200 {object} map[string]string "OS deleted successfully"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "OS not found"
// @Failure 409 {object} map[string]string "OS in use by VMs"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /os/{id} [delete]
func DeleteOS(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		osID := c.Param("id")
		var os tables.OperatingSystem

		if err := db.First(&os, osID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "OS not found"})
			return
		}

		// Check if any VMs are using this OS
		var vmCount int64
		db.Model(&tables.VM{}).Where("os_id = ?", osID).Count(&vmCount)
		if vmCount > 0 {
			c.JSON(http.StatusConflict, gin.H{
				"error":    "Cannot delete OS - in use by VMs",
				"vm_count": vmCount,
			})
			return
		}

		if err := db.Delete(&os).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete OS"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "OS deleted"})
	}
}
