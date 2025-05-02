package api_functions

import (
	"fmt"
	"net/http"
	"ramluck-cloud/config"
	"ramluck-cloud/tables"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Add these custom types
type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
)

// Use DTOs for input validation
type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
	Email    string `json:"email" binding:"required,email"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

// Auth middleware now sets user context
type AuthUser struct {
	UserID   uint
	Username string
	Role     Role
}

// Updated CreateUser with admin check
func CreateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get auth user from context
		authUser, ok := c.Get("authUser")
		if !ok || authUser.(AuthUser).Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var req CreateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check email uniqueness
		var existingUser tables.User
		if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}

		hashedPassword, err := HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
			return
		}

		newUser := tables.User{
			Username: req.Username,
			Email:    req.Email,
			Password: hashedPassword,
			Role:     string(RoleUser), // Default role
		}

		if err := db.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": newUser})
	}
}

// New DeleteUser handler
func DeleteUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		userID := c.Param("id")

		var targetUser tables.User
		if err := db.First(&targetUser, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check if admin or same user
		if authUser.Role != RoleAdmin && authUser.UserID != targetUser.UserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			return
		}

		if err := db.Delete(&targetUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	}
}

// Updated AuthMiddleware
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var authUser AuthUser

		// Try JWT first
		tokenString := c.GetHeader("Authorization")
		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(config.JWT_SECRET), nil
			})

			if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
				authUser = AuthUser{
					UserID:   uint(claims["user_id"].(float64)),
					Username: claims["username"].(string),
					Role:     Role(claims["role"].(string)),
				}
			} else if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
				return
			}
		}

		// Fallback to Basic Auth if no valid JWT
		if authUser.UserID == 0 {
			username, password, ok := c.Request.BasicAuth()
			if !ok || !isValidCredentials(db, username, password) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}

			var user tables.User
			db.Where("username = ?", username).First(&user)
			authUser = AuthUser{
				UserID:   user.UserID,
				Username: user.Username,
				Role:     Role(user.Role),
			}
		}

		c.Set("authUser", authUser)
		c.Next()
	}
}

// Updated token generation with roles
func GenerateToken(user tables.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.UserID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.JWT_SECRET))
}

// Updated GetAllUsers with admin check
func GetAllUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		if authUser.Role != RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin privileges required"})
			return
		}

		var users []tables.User
		if err := db.Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve users"})
			return
		}
		c.JSON(http.StatusOK, users)
	}
}

// HashPassword hashes the password using bcrypt
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// isValidCredentials checks if the provided username and password are correct
func isValidCredentials(db *gorm.DB, username, password string) bool {
	var user tables.User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return false // User not found
	}

	// Compare the hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return false // Invalid password
	}

	return true // Valid credentials
}

// UserLogin handles user authentication
func UserLogin(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Find user by username
		var user tables.User
		if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Verify password
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Generate JWT token
		token, err := GenerateToken(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, LoginResponse{
			Token: token,
		})
	}
}

// RegisterUser handler
func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check email uniqueness
		var existingUser tables.User
		if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}

		hashedPassword, err := HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
			return
		}

		newUser := tables.User{
			Username: req.Username,
			Email:    req.Email,
			Password: hashedPassword,
			Role:     string(RoleUser), // Default role
		}

		if err := db.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user": newUser})
	}
}

// UpdateUser handler
func UpdateUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authUser := c.MustGet("authUser").(AuthUser)
		userID := c.Param("id")

		var targetUser tables.User
		if err := db.First(&targetUser, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Check if admin or same user
		if authUser.Role != RoleAdmin && authUser.UserID != targetUser.UserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized"})
			return
		}

		var req CreateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Update user attributes
		targetUser.Username = req.Username
		targetUser.Email = req.Email

		if req.Password != "" { // Only update password if provided
			hashedPassword, err := HashPassword(req.Password)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
				return
			}
			targetUser.Password = hashedPassword
		}

		if err := db.Save(&targetUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": targetUser})
	}
}
