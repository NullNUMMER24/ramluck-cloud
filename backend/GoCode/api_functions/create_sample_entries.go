package api_functions

import (
	"log"
	"ramluck-cloud/config"
	"ramluck-cloud/tables"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateSampleEntries creates sample entries in the database
func CreateSampleEntries(db *gorm.DB) {
	CreateAdminUser(db)
}

// CreateAdminUser ensures the admin user exists in the database
func CreateAdminUser(db *gorm.DB) {
	var existingUser tables.User
	if err := db.Where("username = ?", "admin").First(&existingUser).Error; err == nil {
		log.Println("Admin user already exists, skipping creation")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.ADMIN_PASSWORD), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	user := tables.User{
		Username: "admin",
		Password: string(hashedPassword),
		Email:    "admin@example.com",
		Role:     "admin",
	}

	if err := db.Create(&user).Error; err != nil {
		log.Fatalf("failed to create admin user: %v", err)
	}

	log.Println("Admin user created successfully")
}
