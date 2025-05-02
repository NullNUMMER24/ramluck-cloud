// @title           RamluckCloud API
// @version         0.1
// @description     My example API
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
	"ramluck-cloud/tables"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/swaggo/swag/example/basic/docs"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"ramluck-cloud/api_functions"
)

var (
	// Get the variables from compose
	// DB_PASSWORD = os.Getenv("DB_PASSWORD")
	// DB_SERVER   = os.Getenv("DB_SERVER")
	// DB_NAME     = os.Getenv("DB_NAME")
	// DB_USER     = os.Getenv("DB_USER")
	// APP_PORT    = os.Getenv("APP_PORT")
	DB_PASSWORD = "123"
	DB_SERVER   = "localhost"
	DB_NAME     = "RamluckCloud"
	DB_USER     = "postgres"
	APP_PORT    = "8088"
)

func main() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable", DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME)
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

	db.AutoMigrate(&tables.User{}, &tables.Group{}, &tables.OperatingSystem{}, &tables.Hardware{}, &tables.Application{}, &tables.VM{})

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
		router.POST("/login", api_functions.UserLogin(db))
		router.POST("/users", api_functions.AuthMiddleware(db), api_functions.CreateUser(db))
		router.DELETE("/users/:id", api_functions.AuthMiddleware(db), api_functions.DeleteUser(db))
		router.GET("/users", api_functions.AuthMiddleware(db), api_functions.GetAllUsers(db))

		// Quotes API
		// api.GET("/quotes/list_all", api_functions.GetAllQuotes(db))
		// api.GET("/quotes/list_all", api_functions.GetAllQuotes(db))
		// api.GET("/quotes/daily_quote", api_functions.GetDailyQuote(db))
		// api.POST("/quotes", api_functions.AddNewQuote(db))

		// // Users API
		// api.POST("/user", api_functions.CreateUser(db))
		// api.GET("/user", api_functions.GetAllUsers(db))

		// // login
		// api.POST("/login", api_functions.UserLogin(db))

		// // Trainings
		// api.GET("/exercise", api_functions.AuthMiddleware(db), api_functions.GetAllExercises(db))

		// api.POST("/exercise/cardio", api_functions.AuthMiddleware(db), api_functions.CreateCardioExercise(db))
		// api.GET("/exercise/cardio", api_functions.AuthMiddleware(db), api_functions.GetCardioEntries(db))

		// api.POST("/exercise/weight", api_functions.AuthMiddleware(db), api_functions.CreateWeightExercise(db))
		// api.GET("/exercise/weight", api_functions.AuthMiddleware(db), api_functions.GetWeightEntries(db))

		// // ToDo
		// api.POST("/todo", api_functions.AuthMiddleware(db), api_functions.CreateTask(db))
		// api.DELETE("/todo/:id", api_functions.AuthMiddleware(db), api_functions.DeleteTask(db))
		// api.PUT("/todo/:id", api_functions.AuthMiddleware(db), api_functions.EditTask(db))
		// api.PATCH("/todo/:id", api_functions.AuthMiddleware(db), api_functions.UpdateTaskStatus(db)) // Include the id in the url
		// api.GET("/todo/grouped", api_functions.AuthMiddleware(db), api_functions.GetTasksGroupedByStatus(db))
		// // api.POST("/todo", api_functions.CreateTask(db))
		// // api.DELETE("/todo/:id", api_functions.DeleteTask(db))
		// // api.PUT("/todo/:id", api_functions.EditTask(db))
		// // api.PATCH("/todo/:id", api_functions.UpdateTaskStatus(db)) // Include the id in the url
		// // api.GET("/todo/grouped", api_functions.GetTasksGroupedByStatus(db))

		// // Meals
		// api.POST("/meal", api_functions.AuthMiddleware(db), api_functions.AddMeal(db))
		// api.GET("/meal", api_functions.AuthMiddleware(db), api_functions.GetMeals(db))

		// // Recipe
		// api.POST("/recipe", api_functions.CreateNewRecipe(db))
		// api.GET("/recipe", api_functions.GetAllRecipes(db))
		// // router.GET("/recipe-ideas", api_functions.GetRecipeIdea(db))

		// Example
		// api.GET("/tirebrands/list", api_functions.GetTireBrands(db))
		// api.POST("/tirebrands", api_functions.CreateTireBrand(db))
		// api.GET("/tirebrands/:id", api_functions.GetTireBrandByID(db))
		// api.PUT("/tirebrands/:id", api_functions.UpdateTireBrand(db))
		// api.DELETE("/tirebrands/:id", api_functions.DeleteTireBrand(db))

		// App API
		// api.GET("/app/list", GetVehiclesWithDetails(db))

	}

	// Server Swagger Doc
	api.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start the server on port 8080 (or any other port you prefer)
	if err := router.Run(fmt.Sprintf(":%s", APP_PORT)); err != nil {
		log.Fatal(err)
	}

}
