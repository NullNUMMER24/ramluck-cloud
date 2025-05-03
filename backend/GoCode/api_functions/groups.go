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

// @Summary Create a new group
// @Description Create a new group (Admin only)
// @Tags Groups
// @Accept json
// @Produce json
// @Param body body CreateGroupRequest true "Group details"
// @Success 201 {object} map[string]interface{} "Group created successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups [post]
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

// @Summary Update group details
// @Description Update group details by ID (Admin only)
// @Tags Groups
// @Accept json
// @Produce json
// @Param id path int true "Group ID"
// @Param body body UpdateGroupRequest true "Updated group details"
// @Success 200 {object} map[string]interface{} "Group updated successfully"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Group not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups/{id} [put]
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

// @Summary Add users to a group
// @Description Add users to a group by ID (Admin only)
// @Tags Groups
// @Accept json
// @Produce json
// @Param id path int true "Group ID"
// @Param body body ModifyGroupUsersRequest true "User IDs to add"
// @Success 200 {object} map[string]string "Users added to group"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Group not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups/{id}/users [post]
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

// @Summary Remove users from a group
// @Description Remove users from a group by ID (Admin only)
// @Tags Groups
// @Accept json
// @Produce json
// @Param id path int true "Group ID"
// @Param body body ModifyGroupUsersRequest true "User IDs to remove"
// @Success 200 {object} map[string]string "Users removed from group"
// @Failure 400 {object} map[string]string "Invalid input"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 404 {object} map[string]string "Group not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups/{id}/users [delete]
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

// @Summary Get group details
// @Description Retrieve details of a group by ID
// @Tags Groups
// @Produce json
// @Param id path int true "Group ID"
// @Success 200 {object} tables.Group "Group details"
// @Failure 404 {object} map[string]string "Group not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups/{id} [get]
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

// @Summary Get all groups
// @Description Retrieve a list of all groups (Admin only)
// @Tags Groups
// @Produce json
// @Success 200 {array} tables.Group "List of groups"
// @Failure 403 {object} map[string]string "Admin privileges required"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /groups [get]
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
