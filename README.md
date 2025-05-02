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
