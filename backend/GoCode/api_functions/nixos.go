package api_functions

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NixOS Configuration DTOs
type NixOSConfig struct {
	ConfigID     uint      `gorm:"primaryKey" json:"config_id"`
	ConfigName   string    `gorm:"type:varchar(255)" json:"config_name"`
	ConfigPath   string    `gorm:"type:varchar(500)" json:"config_path"` // Path in ramluck-cloud-hosts repo
	Description  string    `gorm:"type:text" json:"description"`
	ProxmoxVM    bool      `gorm:"default:false" json:"proxmox_vm"` // Whether to build for Proxmox
	GeneratedAt  time.Time `json:"generated_at"`
	BuildStatus  string    `gorm:"type:varchar(50)" json:"build_status"` // pending, building, success, failed
	BuildOutput  string    `gorm:"type:text" json:"build_output"`
	ImagePath    string    `gorm:"type:varchar(500)" json:"image_path"` // Path to generated image
	VMID         uint      `gorm:"index" json:"vm_id"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type CreateNixOSConfigRequest struct {
	ConfigName  string `json:"config_name" binding:"required"`
	ConfigPath  string `json:"config_path" binding:"required"`
	Description string `json:"description"`
	ProxmoxVM   bool   `json:"proxmox_vm"`
	VMID        uint   `json:"vm_id"`
}

type BuildNixOSRequest struct {
	ConfigID   uint   `json:"config_id" binding:"required"`
	BuildType  string `json:"build_type" binding:"required,oneof=qcow proxmox-qcow raw iso"`
	HostsRepo  string `json:"hosts_repo"` // Git repo URL for configurations
}

type DeploymentRequest struct {
	ConfigID      uint   `json:"config_id" binding:"required"`
	ProxmoxHost   string `json:"proxmox_host" binding:"required"`
	ProxmoxNode   string `json:"proxmox_node" binding:"required"`
	VMName        string `json:"vm_name" binding:"required"`
	VMID          int    `json:"vm_id"`
	Memory        int    `json:"memory" binding:"required"`
	Cores         int    `json:"cores" binding:"required"`
	Storage       string `json:"storage" binding:"required"`
}

// @Summary Create NixOS configuration
// @Description Create a new NixOS configuration entry
// @Tags NixOS
// @Accept json
// @Produce json
// @Param body body CreateNixOSConfigRequest true "NixOS configuration details"
// @Success 201 {object} map[string]interface{} "Configuration created"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /nixos/configs [post]
func CreateNixOSConfig(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateNixOSConfigRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		config := NixOSConfig{
			ConfigName:  req.ConfigName,
			ConfigPath:  req.ConfigPath,
			Description: req.Description,
			ProxmoxVM:   req.ProxmoxVM,
			VMID:        req.VMID,
			BuildStatus: "pending",
		}

		if err := db.Table("nixos_configs").Create(&config).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create configuration"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "NixOS configuration created", "config": config})
	}
}

// @Summary Get all NixOS configurations
// @Description Retrieve all NixOS configurations
// @Tags NixOS
// @Produce json
// @Success 200 {array} NixOSConfig "List of configurations"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /nixos/configs [get]
func GetAllNixOSConfigs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var configs []NixOSConfig
		if err := db.Table("nixos_configs").Find(&configs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve configurations"})
			return
		}
		c.JSON(http.StatusOK, configs)
	}
}

// @Summary Build NixOS image
// @Description Build a NixOS image using nixos-generators for Proxmox or other formats
// @Tags NixOS
// @Accept json
// @Produce json
// @Param body body BuildNixOSRequest true "Build request"
// @Success 200 {object} map[string]interface{} "Build started"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /nixos/build [post]
func BuildNixOSImage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req BuildNixOSRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var config NixOSConfig
		if err := db.Table("nixos_configs").First(&config, req.ConfigID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Configuration not found"})
			return
		}

		// Update status to building
		db.Table("nixos_configs").Model(&config).Updates(map[string]interface{}{
			"build_status": "building",
			"generated_at": time.Now(),
		})

		// Start build in background
		go buildNixOSImageAsync(db, config, req)

		c.JSON(http.StatusOK, gin.H{
			"message":   "Build started",
			"config_id": req.ConfigID,
			"status":    "building",
		})
	}
}

func buildNixOSImageAsync(db *gorm.DB, config NixOSConfig, req BuildNixOSRequest) {
	// This is a placeholder for the actual build process
	// In a real implementation, this would:
	// 1. Clone the ramluck-cloud-hosts repository
	// 2. Run nixos-generators with the specified configuration
	// 3. Store the resulting image

	outputDir := fmt.Sprintf("/tmp/nixos-builds/%d", config.ConfigID)
	
	// Example command structure (would need proper implementation)
	var cmd *exec.Cmd
	if req.BuildType == "proxmox-qcow" {
		cmd = exec.Command("nixos-generate",
			"-f", "proxmox",
			"-c", config.ConfigPath,
			"-o", outputDir,
		)
	} else {
		cmd = exec.Command("nixos-generate",
			"-f", req.BuildType,
			"-c", config.ConfigPath,
			"-o", outputDir,
		)
	}

	output, err := cmd.CombinedOutput()
	
	if err != nil {
		db.Table("nixos_configs").Model(&config).Updates(map[string]interface{}{
			"build_status": "failed",
			"build_output": string(output) + "\nError: " + err.Error(),
		})
		return
	}

	db.Table("nixos_configs").Model(&config).Updates(map[string]interface{}{
		"build_status": "success",
		"build_output": string(output),
		"image_path":   outputDir,
	})
}

// @Summary Deploy to Proxmox
// @Description Deploy a built NixOS image to Proxmox VE
// @Tags NixOS
// @Accept json
// @Produce json
// @Param body body DeploymentRequest true "Deployment details"
// @Success 200 {object} map[string]interface{} "Deployment started"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /nixos/deploy [post]
func DeployToProxmox(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req DeploymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var config NixOSConfig
		if err := db.Table("nixos_configs").First(&config, req.ConfigID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Configuration not found"})
			return
		}

		if config.BuildStatus != "success" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Configuration has not been built successfully"})
			return
		}

		// In a real implementation, this would use Proxmox API to:
		// 1. Upload the image to Proxmox storage
		// 2. Create a new VM with the specified parameters
		// 3. Attach the disk image
		// 4. Configure VM settings (memory, cores, network, etc.)

		deploymentInfo := map[string]interface{}{
			"config_id":    req.ConfigID,
			"proxmox_host": req.ProxmoxHost,
			"proxmox_node": req.ProxmoxNode,
			"vm_name":      req.VMName,
			"vm_id":        req.VMID,
			"memory":       req.Memory,
			"cores":        req.Cores,
			"storage":      req.Storage,
			"status":       "deploying",
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Deployment started",
			"deployment": deploymentInfo,
		})
	}
}

// @Summary Get NixOS build status
// @Description Get the build status of a NixOS configuration
// @Tags NixOS
// @Produce json
// @Param id path int true "Configuration ID"
// @Success 200 {object} NixOSConfig "Configuration details"
// @Failure 404 {object} map[string]string "Configuration not found"
// @Router /nixos/configs/{id} [get]
func GetNixOSConfigStatus(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		configID := c.Param("id")
		var config NixOSConfig
		
		if err := db.Table("nixos_configs").First(&config, configID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Configuration not found"})
			return
		}

		c.JSON(http.StatusOK, config)
	}
}

// Kubernetes deployment structures
type KubernetesApp struct {
	AppID         uint      `gorm:"primaryKey" json:"app_id"`
	AppName       string    `gorm:"type:varchar(255)" json:"app_name"`
	Namespace     string    `gorm:"type:varchar(255)" json:"namespace"`
	ManifestPath  string    `gorm:"type:varchar(500)" json:"manifest_path"`
	ClusterName   string    `gorm:"type:varchar(255)" json:"cluster_name"`
	DeployStatus  string    `gorm:"type:varchar(50)" json:"deploy_status"`
	ApplicationID uint      `gorm:"index" json:"application_id"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type DeployK8sAppRequest struct {
	AppName       string `json:"app_name" binding:"required"`
	Namespace     string `json:"namespace" binding:"required"`
	ManifestPath  string `json:"manifest_path" binding:"required"`
	ClusterName   string `json:"cluster_name" binding:"required"`
	ApplicationID uint   `json:"application_id"`
}

// @Summary Deploy Kubernetes application
// @Description Deploy an application to Kubernetes cluster
// @Tags Kubernetes
// @Accept json
// @Produce json
// @Param body body DeployK8sAppRequest true "Kubernetes deployment details"
// @Success 201 {object} map[string]interface{} "Deployment created"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /kubernetes/deploy [post]
func DeployKubernetesApp(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req DeployK8sAppRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		k8sApp := KubernetesApp{
			AppName:       req.AppName,
			Namespace:     req.Namespace,
			ManifestPath:  req.ManifestPath,
			ClusterName:   req.ClusterName,
			ApplicationID: req.ApplicationID,
			DeployStatus:  "pending",
		}

		if err := db.Table("kubernetes_apps").Create(&k8sApp).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create deployment"})
			return
		}

		// Start deployment in background
		go deployK8sAppAsync(db, k8sApp)

		c.JSON(http.StatusCreated, gin.H{
			"message": "Kubernetes deployment started",
			"app":     k8sApp,
		})
	}
}

func deployK8sAppAsync(db *gorm.DB, app KubernetesApp) {
	// Update status to deploying
	db.Table("kubernetes_apps").Model(&app).Update("deploy_status", "deploying")

	// In a real implementation, this would:
	// 1. Connect to the Kubernetes cluster
	// 2. Apply the manifest file
	// 3. Monitor the deployment status

	cmd := exec.Command("kubectl", "apply", "-f", app.ManifestPath, "-n", app.Namespace, "--context", app.ClusterName)
	output, err := cmd.CombinedOutput()

	if err != nil {
		db.Table("kubernetes_apps").Model(&app).Update("deploy_status", "failed")
		return
	}

	// Parse output for deployment confirmation
	var result map[string]interface{}
	json.Unmarshal(output, &result)

	db.Table("kubernetes_apps").Model(&app).Update("deploy_status", "success")
}

// @Summary Get Kubernetes deployments
// @Description Get all Kubernetes application deployments
// @Tags Kubernetes
// @Produce json
// @Success 200 {array} KubernetesApp "List of deployments"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /kubernetes/deployments [get]
func GetKubernetesDeployments(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var apps []KubernetesApp
		if err := db.Table("kubernetes_apps").Find(&apps).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve deployments"})
			return
		}
		c.JSON(http.StatusOK, apps)
	}
}
