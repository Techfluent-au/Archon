# Archon - API Documentation (Overview)

**Note:** This document provides a high-level overview of the key API endpoints. For detailed, auto-generated API documentation, please refer to the OpenAPI specifications provided by the FastAPI services at `/docs` (e.g., `http://localhost:8181/docs`).

## Core API (`archon-server`)

This service handles the primary business logic and data management.

### Knowledge Base
*   `POST /api/knowledge/crawl`: Initiates a web crawl for a given URL to ingest knowledge.
*   `POST /api/knowledge/documents`: Uploads a document (PDF, DOCX, etc.) for processing.
*   `GET /api/knowledge/items`: Lists all processed knowledge items.
*   `POST /api/knowledge/search`: Performs a RAG search over the knowledge base.
*   `GET /api/knowledge/items/{item_id}`: Retrieves a specific knowledge item.
*   `POST /api/knowledge/extract-code`: Triggers code extraction for a given document.

### Projects & Tasks
*   `GET /api/projects`: Lists all projects.
*   `POST /api/projects`: Creates a new project.
*   `GET /api/projects/{id}`: Retrieves a single project.
*   `GET /api/projects/{id}/tasks`: Retrieves all tasks for a specific project.
*   `POST /api/projects/{id}/tasks`: Creates a new task within a project.

### Settings
*   `GET /api/settings`: Retrieves all application settings.
*   `PUT /api/settings`: Updates one or more settings.

### Real-time (Socket.IO)
The server broadcasts real-time events on the following channels:
*   `crawl_progress`: Updates on web crawling progress.
*   `project_creation_progress`: Updates on project setup.
*   `task_update`: Notifications of changes to tasks.
*   `knowledge_update`: Notifications of changes to the knowledge base.

## MCP API (`archon-mcp`)

This service provides a standardized interface for AI clients.

*   `GET /health`: Health check for the MCP server.
*   `POST /api/mcp/tools/execute`: Executes a specified MCP tool with given parameters.
*   `GET /api/mcp/tools`: Lists all available MCP tools.

### Key MCP Tools
*   `archon:perform_rag_query`: Searches the knowledge base.
*   `archon:search_code_examples`: Searches specifically for code examples.
*   `archon:manage_project`: Performs operations on projects.
*   `archon:manage_task`: Performs operations on tasks.
*   `archon:get_available_sources`: Lists all available knowledge sources.

## Agents API (`archon-agents`)

This service hosts the PydanticAI agents.

*   `GET /health`: Health check for the agents service.
*   *(Other agent-specific endpoints may be available for triggering specific agent runs).*
