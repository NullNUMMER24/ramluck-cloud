# Use the golang:alpine image as the base image
FROM golang:1.23

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any necessary dependencies
RUN apt install -y git

# Build the Go application
RUN go build -o main .

# Expose the port that the application will listen on
EXPOSE 8080

# Run the Go application
CMD ["/app/main"]
