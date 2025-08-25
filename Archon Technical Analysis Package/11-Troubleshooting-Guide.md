# Archon - Troubleshooting Guide

This guide provides solutions to common issues encountered during setup and development.

## Common Issues and Solutions

### Port Conflicts
If you see "Port already in use" errors:
```bash
# Check what's using a port (e.g., 3737) on macOS/Linux
lsof -i :3737

# Stop all containers and local services
make stop

# Change the port in your .env file and restart
```

### Docker Permission Issues (Linux)
If you encounter permission errors with Docker:
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in, or run
newgrp docker
```

### Windows-Specific Issues
*   **`make` not found:** Install Make via Chocolatey, Scoop, or WSL2. See the main `README.md` for instructions.
*   **Line ending issues:** Configure Git to use LF endings to avoid issues with shell scripts in Docker:
    ```bash
    git config --global core.autocrlf false
    ```

### Frontend Can't Connect to Backend
1.  **Check if the backend is running:** `curl http://localhost:8181/health`
2.  **Check Docker logs:** `docker compose logs -f archon-server`
3.  **Verify port configuration:** Ensure the ports in your `.env` file match what the services are expecting.

### Docker Compose Hangs or Fails
If `docker compose` commands are not working as expected:
```bash
# Perform a full reset of the Docker environment
docker compose down --remove-orphans
docker system prune -f

# On Docker Desktop, it can sometimes help to restart the application.
```

### Hot Reload Not Working
*   **Frontend:** Ensure you are running in hybrid mode (`make dev`) for the best hot module replacement experience.
*   **Backend:** Check that the volumes are mounted correctly in `docker-compose.yml`. The `python/src` directory should be mounted into the `archon-server` container.
