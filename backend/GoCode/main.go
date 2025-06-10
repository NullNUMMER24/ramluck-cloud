// @title           RamluckCloud API
// @version         0.1
// @description     RamluckCloud API
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8088
// @BasePath  /api/

// @securityDefinitions.basic  BasicAuth

// @externalDocs.description  OpenAPI
// @externalDocs.url          https://swagger.io/resources/open-api/

package main

import (
	"fmt"
	"log"
	"ramluck-cloud/docs"
	"ramluck-cloud/tables"
	"ramluck-cloud/vm_management"
	"time"

	"ramluck-cloud/api_functions"
	"ramluck-cloud/config"
	_ "ramluck-cloud/docs" // Correct import for your Swagger docs

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable", config.DB_SERVER, config.DB_USER, config.DB_PASSWORD, config.DB_NAME)
	var db *gorm.DB
	var err error
	// Retry connecting to the database for 30 seconds
	for i := 0; i < 30; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})

		if err == nil {
			break
		}
		log.Println("Failed to connect to database, retrying...")
		time.Sleep(time.Second)
	}

	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&tables.User{}, &tables.Group{}, &tables.Hardware{}, &tables.Application{}, &tables.OperatingSystem{}, &tables.VM{})
	// Create sample entries
	api_functions.CreateSampleEntries(db)

	router := gin.Default()

	// Use cors
	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true, // Allow all origins
		// Alternatively, you can specify allowed origins:
		// AllowOrigins: []string{"http://localhost:3000"}, // Replace with your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	docs.SwaggerInfo.BasePath = "/api"

	router.StaticFile("/swagger/doc.json", "./docs/swagger.json")

	api := router.Group("/api")
	{
		// User API
		api.POST("/login", api_functions.UserLogin(db))
		api.POST("/login/register", api_functions.RegisterUser(db))
		api.POST("/users", api_functions.AuthMiddleware(db), api_functions.CreateUser(db))
		api.DELETE("/users/:id", api_functions.AuthMiddleware(db), api_functions.DeleteUser(db))
		api.PUT("/users/:id", api_functions.AuthMiddleware(db), api_functions.UpdateUser(db))
		api.GET("/users", api_functions.AuthMiddleware(db), api_functions.GetAllUsers(db))
		api.GET("/users/:id", api_functions.AuthMiddleware(db), api_functions.GetUserByID(db))

		// Group API
		api.POST("/groups", api_functions.AuthMiddleware(db), api_functions.CreateGroup(db))
		api.PUT("/groups/:id", api_functions.AuthMiddleware(db), api_functions.UpdateGroup(db))
		api.GET("/groups/:id", api_functions.AuthMiddleware(db), api_functions.GetGroupDetails(db))
		api.POST("/groups/:id/users", api_functions.AuthMiddleware(db), api_functions.AddUsersToGroup(db))
		api.DELETE("/groups/:id/users", api_functions.AuthMiddleware(db), api_functions.RemoveUsersFromGroup(db))
		api.GET("/groups", api_functions.AuthMiddleware(db), api_functions.GetAllGroups(db))

		// Operating System API
		api.POST("/os", api_functions.AuthMiddleware(db), api_functions.CreateOS(db))
		api.PUT("/os/:id", api_functions.AuthMiddleware(db), api_functions.UpdateOS(db))
		api.GET("/os/:id", api_functions.AuthMiddleware(db), api_functions.GetOSDetails(db))
		api.GET("/os", api_functions.AuthMiddleware(db), api_functions.GetAllOS(db))
		api.DELETE("/os/:id", api_functions.AuthMiddleware(db), api_functions.DeleteOS(db))

		// VM API
		api.POST("/vms", api_functions.AuthMiddleware(db), api_functions.CreateVM(db))
		api.PUT("/vms/:id", api_functions.AuthMiddleware(db), api_functions.UpdateVM(db))
		api.GET("/vms/:id", api_functions.AuthMiddleware(db), api_functions.GetVMDetails(db))
		api.GET("/vms", api_functions.AuthMiddleware(db), api_functions.GetAllVMs(db))
		api.DELETE("/vms/:id", api_functions.AuthMiddleware(db), api_functions.DeleteVM(db))
		api.POST("/vms/:id/applications", api_functions.AuthMiddleware(db), api_functions.ManageVMApplications(db))

		// Applications API
		api.POST("/applications", api_functions.AuthMiddleware(db), api_functions.CreateApplication(db))
		api.PUT("/applications/:id", api_functions.AuthMiddleware(db), api_functions.UpdateApplication(db))
		api.DELETE("/applications/:id", api_functions.AuthMiddleware(db), api_functions.DeleteApplication(db))
		api.POST("/applications/:id/move", api_functions.AuthMiddleware(db), api_functions.MoveApplication(db))
	}

	// Server Swagger Doc
	api.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Sync jobs - start concurrent goroutine to sync VMs to Git
	go func() {
		for {
			vm_management.SyncVmsToGit(db)
			time.Sleep(time.Minute) // Wait 1 minute before the next sync
		}
	}()

	// Start the server on port 8080 (or any other port you prefer)
	if err := router.Run(fmt.Sprintf(":%s", config.APP_PORT)); err != nil {
		log.Fatal(err)
	}

}
