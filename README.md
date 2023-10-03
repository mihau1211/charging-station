# charging-station

## Docker Compose Configuration

### Services:
- **web**: Node.js
- **db**: PostgreSQL

### Configuration Steps:
1. **Fill in docker-compose**: Insert proper values to predefined docker-composer.yml file in those places
```yaml
POSTGRES_USER: [username]
POSTGRES_PASSWORD: [password]
POSTGRES_DB: [db_name]
```
2. **Fill in environment variables**: Fill in predefined prod.env file, make sure that db variables (as password, username and so on) are exact the same like those that you provide to PostgreSQL config.
3. **Build and Run the Docker Containers**: Execute the `docker-compose up` command in your terminal to build and run the project. Ensure Docker is installed on your device before running the command.

## Accessing the Application
1. **Generate First Token**: Use /api/v1/generatetoken endpoint to generate token, it requires API Key to work.
2. **Use Endpoints**: Now, when you have token, you can access to every API endpoint you want, just provide it as Bearer token. The list of endpoint: 
    - /api/v1/connector - for Connectors table
    - /api/v1/cs - for ChargingStations table
    - /api/v1/cstype - for ChargingStationTypes table
3. **Refresh Token**: Every token expires after 120s so if it will happen, you need to use that token on /api/v1/refreshtoken endpoint to regenerate a new one. After that, old token cannot be use anymore to authenticate (if it was still nonexpired) or to regenerate new one 


## Documentantion
Visit /api-docs for the Swagger documentation.