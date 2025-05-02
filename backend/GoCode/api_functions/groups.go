package api_functions

import (
	"net/http"
	"ramluck-cloud/tables"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Add to api_functions.go

// Group DTOs
type CreateGroupRequest struct {
	GroupName string `json:"group_name" binding:"required"`
	Role      string `json:"role" binding:"required"`
}

type UpdateGroupRequest struct {
	GroupName string `json:"group_name"`
	Role      string `json:"role"`
}

type ModifyGroupUsersRequest struct {
	UserIDs []uint `json:"user_ids" binding:"required"`
}

// CreateGroup creates a new group (Admin only)
func CreateGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateGroupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		group := tables.Group{
			GroupName: req.GroupName,
			Role:      req.Role,
		}

		if err := db.Create(&group).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create group"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Group created", "group": group})
	}
}

// UpdateGroup updates group details (Admin only)
func UpdateGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		groupID := c.Param("id")
		var req UpdateGroupRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var group tables.Group
		if err := db.First(&group, groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
			return
		}

		if req.GroupName != "" {
			group.GroupName = req.GroupName
		}
		if req.Role != "" {
			group.Role = req.Role
		}

		if err := db.Save(&group).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update group"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Group updated", "group": group})
	}
}

// AddUsersToGroup adds users to a group (Admin only)
func AddUsersToGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		groupID := c.Param("id")
		var req ModifyGroupUsersRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var group tables.Group
		if err := db.First(&group, groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
			return
		}

		var users []tables.User
		if err := db.Find(&users, req.UserIDs).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user IDs"})
			return
		}

		if err := db.Model(&group).Association("Users").Append(users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add users to group"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Users added to group"})
	}
}

// RemoveUsersFromGroup removes users from a group (Admin only)
func RemoveUsersFromGroup(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		groupID := c.Param("id")
		var req ModifyGroupUsersRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var group tables.Group
		if err := db.First(&group, groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
			return
		}

		var users []tables.User
		if err := db.Find(&users, req.UserIDs).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user IDs"})
			return
		}

		if err := db.Model(&group).Association("Users").Delete(users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not remove users from group"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Users removed from group"})
	}
}

// GetGroupDetails retrieves group information
func GetGroupDetails(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		groupID := c.Param("id")
		var group tables.Group

		if err := db.Preload("Users").First(&group, groupID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
			return
		}

		c.JSON(http.StatusOK, group)
	}
}

// GetAllGroups retrieves all groups (Admin only)
func GetAllGroups(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var groups []tables.Group
		if err := db.Preload("Users").Find(&groups).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve groups"})
			return
		}

		c.JSON(http.StatusOK, groups)
	}
}
