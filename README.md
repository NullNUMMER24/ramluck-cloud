# ramluck-cloud
## DB Schema
![diagram](./images/db_diagram.png.png)

## Mindmap
![Mindmap](./images/ramluck-cloud-planning.png.png)

## Debug commands
### Databse
#### Connect to postgres in container
```bash
docker exec -it ramluckcloud-database psql -U postgres -d RamluckCloud
```
#### Show all tables
```sql
RamluckCloud=# \dt
```
#### Drop the Database
```sql
DROP TABLE IF EXISTS user_groups, users, groups, operating_systems, applications, vms, vm_applications CASCADE;
```

## API
### User
#### Create new user
```bash
curl -X POST http://localhost:8088/api/login/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepassword123",
    "email": "newuser@example.cofm"
  }'
```
#### Get admin token
Get the admn token and saves it as env var:
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8088/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' | jq -r '.token')
```
### Group
#### Create new group
```bash
curl -X POST http://localhost:8088/api/groups \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"group_name": "Developers", "role": "developer"}'
```
#### Update group (with gid)
```bash
curl -X PUT http://localhost:8088/api/groups/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"group_name": "Senior Developers", "role": "senior-developer"}'
```
#### Add users to group
```bash
curl -X POST http://localhost:8080/api/groups/1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_ids": [1, 2, 3]}'
```
#### Remove users from group
```bash
curl -X DELETE http://localhost:8080/api/groups/1/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_ids": [3]}'
```
#### Get group detail (users included)
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/api/groups/1
```
### OS
#### Create OS
```bash
curl -X POST http://localhost:8088/api/os \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"os_name": "Ubuntu", "os_version": "22.04", "link_to_os_website": "https://ubuntu.com"}'
```
#### Update OS
```bash
curl -X PUT http://localhost:8088/api/os/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"os_version": "22.04 LTS"}'
```
#### List all OS
```bash
curl -X GET http://localhost:8088/api/os \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
### VM
#### Create VM
```bash
curl -X POST http://localhost:8088/api/vms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vm_name": "Web Server",
    "vm_ip": "192.168.1.100",
    "vm_status": "running",
    "owner_id": 1,
    "os_id": 1,
    "application_ids": [1, 2]
  }'
```
#### Update VM
```bash
curl -X PUT http://localhost:8088/api/vms/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vm_status": "maintenance"}'
```
### Application
#### Create Application
```bash
curl -X POST http://localhost:8088/api/applications \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "application_name": "Nginx",
    "application_type": "web-server",
    "link_to_website": "https://nginx.org"
  }'
```
#### Move Application
```bash
curl -X POST http://localhost:8088/api/applications/1/move \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_vm_id": 2}'
```
#### Delete Application

# ToDo
- [X] Update DB schema
  - [X] Project table needed
  - [X] Invoice table needed
  - [] Option to disable billing for projects
  - [] Pricing table