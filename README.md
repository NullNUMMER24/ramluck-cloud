# ramluck-cloud
## DB Schema
![diagram](diagram.png)

## Mindmap


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

### API
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
#### Create new group
```bash
curl -X POST http://localhost:8088/api/groups \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"group_name": "Developers", "role": "developer"}'
{"group":{"GroupID":1,"GroupName":"Developers","Role":"developer","Users":null},"message":"Group created"
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
