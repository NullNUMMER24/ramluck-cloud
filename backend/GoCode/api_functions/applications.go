package api_functions

import (
	"net/http"
	"ramluck-cloud/tables"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DTOs for Application operations

type CreateAppRequest struct {
	ApplicationName string `json:"application_name" binding:"required"`
	ApplicationType string `json:"application_type" binding:"required"`
	LinkToWebsite   string `json:"link_to_website" binding:"omitempty,url"`
}

type UpdateAppRequest struct {
	ApplicationName string `json:"application_name"`
	ApplicationType string `json:"application_type"`
	LinkToWebsite   string `json:"link_to_website" binding:"omitempty,url"`
}

type MoveAppRequest struct {
	TargetVMID uint `json:"target_vm_id" binding:"required"`
}

// CreateApplication creates a new application (Admin only)
// @Summary Create a new application
// @Description Create a new application (Admin only)
// @Tags Applications
// @Accept json
// @Produce json
// @Param body body CreateAppRequest true "Application details"
// @Success 201 {object} map[string]interface{} "Application created successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /applications [post]
func CreateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.MustGet("authUser").(AuthUser)
		if auth.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateAppRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		app := tables.Application{
			ApplicationName: req.ApplicationName,
			ApplicationType: req.ApplicationType,
			LinkToWebsite:   req.LinkToWebsite,
			CreatedAt:       time.Now(),
		}

		if err := db.Create(&app).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create application"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Application created", "application": app})
	}
}

// UpdateApplication updates application fields (Admin only)
// @Summary Update an application
// @Description Update application details by ID (Admin only)
// @Tags Applications
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param body body UpdateAppRequest true "Updated application details"
// @Success 200 {object} map[string]interface{} "Application updated successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Application not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /applications/{id} [put]
func UpdateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.MustGet("authUser").(AuthUser)
		if auth.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		id := c.Param("id")
		var req UpdateAppRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var app tables.Application
		if err := db.First(&app, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
			return
		}

		if req.ApplicationName != "" {
			app.ApplicationName = req.ApplicationName
		}
		if req.ApplicationType != "" {
			app.ApplicationType = req.ApplicationType
		}
		if req.LinkToWebsite != "" {
			app.LinkToWebsite = req.LinkToWebsite
		}
		app.UpdatedAt = time.Now()

		if err := db.Save(&app).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update application"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Application updated", "application": app})
	}
}

// DeleteApplication removes an application (Admin only)
// @Summary Delete an application
// @Description Delete an application by ID (Admin only)
// @Tags Applications
// @Param id path int true "Application ID"
// @Success 200 {object} map[string]string "Application deleted successfully"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Application not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /applications/{id} [delete]
func DeleteApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.MustGet("authUser").(AuthUser)
		if auth.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		id := c.Param("id")
		var app tables.Application
		if err := db.Preload("VMs").First(&app, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
			return
		}

		// Remove all associations
		db.Model(&app).Association("VMs").Clear()

		if err := db.Delete(&app).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete application"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Application deleted"})
	}
}

// GetAllApplications retrieves all applications
// @Summary Get all applications
// @Description Retrieve a list of all applications
// @Tags Applications
// @Produce json
// @Success 200 {array} tables.Application "List of applications"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /applications [get]
func GetAllApplications(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var apps []tables.Application
		if err := db.Preload("VMs").Find(&apps).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve applications"})
			return
		}
		c.JSON(http.StatusOK, apps)
	}
}

// MoveApplication assigns an application to a different VM (Admin only)
// @Summary Move an application to a different VM
// @Description Assign an application to a different VM (Admin only)
// @Tags Applications
// @Accept json
// @Produce json
// @Param id path int true "Application ID"
// @Param body body MoveAppRequest true "Target VM ID"
// @Success 200 {object} map[string]interface{} "Application moved successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Application or target VM not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /applications/{id}/move [post]
func MoveApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.MustGet("authUser").(AuthUser)
		if auth.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		appID := c.Param("id")
		var req MoveAppRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var app tables.Application
		if err := db.Preload("VMs").First(&app, appID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
			return
		}

		var vm tables.VM
		if err := db.First(&vm, req.TargetVMID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Target VM not found"})
			return
		}

		// Reset associations and assign to new VM
		db.Model(&app).Association("VMs").Replace(&vm)

		c.JSON(http.StatusOK, gin.H{"message": "Application moved", "target_vm_id": req.TargetVMID})
	}
}
