package tables

import "time"

type User struct {
	UserID    uint      `gorm:"primaryKey"`
	Username  string    `gorm:"type:varchar(255)"`
	Email     string    `gorm:"type:varchar(255);uniqueIndex"`
	Role      string    `gorm:"type:varchar(50);default:'user'"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	Password  string    `gorm:"type:varchar(255)" json:"-"`
	Groups    []Group   `gorm:"many2many:user_groups;"`
}

type Group struct {
	GroupID   uint   `gorm:"primaryKey"`
	GroupName string `gorm:"type:varchar(255)"`
	Role      string `gorm:"type:varchar(255)"`
	Users     []User `gorm:"many2many:user_groups;"`
}

type OperatingSystem struct {
	OSID            uint      `gorm:"primaryKey"`
	OSName          string    `gorm:"type:varchar(255)"`
	OSVersion       string    `gorm:"type:varchar(255)"`
	LinkToOSWebsite string    `gorm:"type:varchar(255)"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime"`
}

type Hardware struct {
	HardwareID       uint      `gorm:"primaryKey"`
	HardwareName     string    `gorm:"type:varchar(255)"`
	HardwareLocation string    `gorm:"type:varchar(255)"`
	HardwareStatus   string    `gorm:"type:varchar(255)"`
	CreatedAt        time.Time `gorm:"autoCreateTime"`
}

type Application struct {
	ApplicationID   uint      `gorm:"primaryKey"`
	ApplicationName string    `gorm:"type:varchar(255)"`
	ApplicationType string    `gorm:"type:varchar(255)"`
	CreatedAt       time.Time `gorm:"autoCreateTime"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime"`
	LinkToWebsite   string    `gorm:"type:varchar(255)"`
	VMs             []VM      `gorm:"many2many:vm_applications;"`
}

type VM struct {
	VMID         uint      `gorm:"primaryKey"`
	VMName       string    `gorm:"type:varchar(255)"`
	VMIP         string    `gorm:"type:varchar(255)"`
	VMStatus     string    `gorm:"type:varchar(255)"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	Description  string    `gorm:"type:varchar(255)"`

	// Foreign key for Owner relationship
	OwnerID      uint
	// Relationship field for Owner (GORM will populate this on Preload("Owner"))
	Owner        Group     `gorm:"foreignKey:OwnerID"`

	// Foreign key for OperatingSystem relationship
	OSID         uint
	// Relationship field for OS (GORM will populate this on Preload("OS"))
	OS           OperatingSystem `gorm:"foreignKey:OSID;references:OSID"` // Use OSID field of VM to link to OSID field of OperatingSystem

	// Many-to-many relationship with Application
	Applications []Application `gorm:"many2many:vm_applications;"`
}
