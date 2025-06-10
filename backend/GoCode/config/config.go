package config

var (
	// Get the variables from compose
	// DB_PASSWORD = os.Getenv("DB_PASSWORD")
	// DB_SERVER   = os.Getenv("DB_SERVER")
	// DB_NAME     = os.Getenv("DB_NAME")
	// DB_USER     = os.Getenv("DB_USER")
	// APP_PORT    = os.Getenv("APP_PORT")
	// ADMIN_PASSWORD = os.Getenv("ADMIN_PASSWORD")
	// JWT_SECRET_KEY = os.Getenv("JWT_SECRET")
	DB_PASSWORD    = "123"
	DB_SERVER      = "localhost"
	DB_NAME        = "RamluckCloud"
	DB_USER        = "postgres"
	APP_PORT       = "8088"
	ADMIN_PASSWORD = "admin"
	JWT_SECRET     = "your-secure-secret-key"
	REPO_LOCATION  = "/tmp/test-repo" // Location of the repository for VM management
)
