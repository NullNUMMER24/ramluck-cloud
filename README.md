# ramluck-cloud

A comprehensive cloud management platform for deploying and managing NixOS VMs and Kubernetes applications through a modern web interface.

## Features

### Core Features
- **Modern Web UI**: Professional, responsive dashboard for managing cloud resources
- **Virtual Machine Management**: Create, monitor, and manage VMs with ease
- **NixOS Integration**: Build and deploy NixOS configurations using nixos-generators
- **Proxmox Support**: Automatically generate and deploy VMs to Proxmox VE
- **Kubernetes Deployment**: Deploy and manage Kubernetes applications
- **User & Group Management**: Fine-grained access control with role-based permissions
- **Application Tracking**: Monitor and manage deployed applications
- **Operating System Catalog**: Track and manage OS configurations

### Technical Features
- RESTful API backend built with Go and Gin framework
- PostgreSQL database for persistent storage
- JWT-based authentication
- Docker Compose for easy deployment
- Swagger/OpenAPI documentation

## Prerequisites

- Docker and Docker Compose
- Go 1.23.8+ (for development)
- PostgreSQL (handled by Docker)
- Optional: NixOS with nixos-generators for building VM images
- Optional: Proxmox VE for VM deployment
- Optional: kubectl for Kubernetes deployments

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/NullNUMMER24/ramluck-cloud.git
cd ramluck-cloud
```

### 2. Start the Services

```bash
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Web server on port 8081

### 3. Start the Backend

```bash
cd backend/GoCode
go run main.go
```

The API will be available at `http://localhost:8088`

### 4. Access the Web Interface

Open your browser and navigate to:
```
http://localhost:8081
```

Default admin credentials:
- Username: `admin`
- Password: `admin`

## Configuration

### NixOS Configuration Repository

The platform is designed to work with a separate repository for NixOS configurations (e.g., `ramluck-cloud-hosts`). Store your NixOS configurations there and reference them when creating VM deployments.

Example structure for `ramluck-cloud-hosts`:
```
ramluck-cloud-hosts/
├── machines/
│   ├── web-server/
│   │   └── configuration.nix
│   ├── database/
│   │   └── configuration.nix
│   └── k8s-node/
│       └── configuration.nix
└── common/
    └── base.nix
```

### Building NixOS Images for Proxmox

1. Install nixos-generators:
```bash
nix-env -iA nixpkgs.nixos-generators
```

2. Build a Proxmox-compatible image via the API:
```bash
curl -X POST http://localhost:8088/api/nixos/build \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_id": 1,
    "build_type": "proxmox-qcow",
    "hosts_repo": "https://github.com/your-org/ramluck-cloud-hosts"
  }'
```

### Deploying to Proxmox

Deploy a built NixOS image to Proxmox VE:
```bash
curl -X POST http://localhost:8088/api/nixos/deploy \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_id": 1,
    "proxmox_host": "proxmox.example.com",
    "proxmox_node": "pve",
    "vm_name": "nixos-web-01",
    "vm_id": 100,
    "memory": 2048,
    "cores": 2,
    "storage": "local-lvm"
  }'
```

## API Documentation

### Authentication

Get an admin token:
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8088/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' | jq -r '.token')
```

### Key Endpoints

#### Virtual Machines
- `GET /api/vms` - List all VMs
- `POST /api/vms` - Create a new VM
- `GET /api/vms/:id` - Get VM details
- `PUT /api/vms/:id` - Update VM
- `DELETE /api/vms/:id` - Delete VM

#### NixOS Configuration
- `GET /api/nixos/configs` - List all NixOS configurations
- `POST /api/nixos/configs` - Create a new configuration
- `GET /api/nixos/configs/:id` - Get configuration status
- `POST /api/nixos/build` - Build a NixOS image
- `POST /api/nixos/deploy` - Deploy to Proxmox

#### Kubernetes
- `POST /api/kubernetes/deploy` - Deploy a Kubernetes application
- `GET /api/kubernetes/deployments` - List all deployments

#### Applications
- `GET /api/applications` - List all applications
- `POST /api/applications` - Create a new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

#### Users & Groups
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create a new group

### Swagger Documentation

Access the interactive API documentation at:
```
http://localhost:8088/api/docs/index.html
```

## Architecture

### Database Schema
![Database Schema](diagram.png)

### Components

1. **Frontend (Website)**
   - Modern, responsive web interface
   - Built with vanilla JavaScript and CSS
   - Real-time updates and status monitoring

2. **Backend (Go)**
   - RESTful API with Gin framework
   - JWT authentication
   - Database ORM with GORM
   - Background job processing for builds

3. **Database (PostgreSQL)**
   - User and group management
   - VM and application tracking
   - NixOS configuration storage
   - Kubernetes deployment records

## Development

### Run Tests
```bash
cd backend/GoCode
go test ./...
```

### Build Backend
```bash
cd backend/GoCode
go build -o ramluck-cloud main.go
```

### Database Management

Connect to PostgreSQL:
```bash
docker exec -it ramluckcloud-database psql -U postgres -d RamluckCloud
```

Show all tables:
```sql
RamluckCloud=# \dt
```

## Usage Examples

### Create a NixOS Configuration

```bash
curl -X POST http://localhost:8088/api/nixos/configs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config_name": "Web Server",
    "config_path": "machines/web-server/configuration.nix",
    "description": "Nginx web server configuration",
    "proxmox_vm": true,
    "vm_id": 1
  }'
```

### Deploy a Kubernetes Application

```bash
curl -X POST http://localhost:8088/api/kubernetes/deploy \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "my-app",
    "namespace": "default",
    "manifest_path": "/path/to/deployment.yaml",
    "cluster_name": "production",
    "application_id": 1
  }'
```

### Create a VM

```bash
curl -X POST http://localhost:8088/api/vms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vm_name": "web-server-01",
    "vm_ip": "192.168.1.10",
    "vm_status": "running",
    "description": "Production web server",
    "owner_id": 1,
    "os_id": 1
  }'
```

## Roadmap

- [ ] Proxmox API integration for automated deployment
- [ ] Real-time build progress monitoring
- [ ] VM snapshot management
- [ ] Automated backup scheduling
- [ ] Multi-cluster Kubernetes support
- [ ] Resource usage monitoring and alerts
- [ ] Integration with ramluck-cloud-hosts Git repository
- [ ] CI/CD pipeline for NixOS configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please use the GitHub Issues page.
