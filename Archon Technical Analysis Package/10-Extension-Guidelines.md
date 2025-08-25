# Archon - Extension Guidelines

## 1. Philosophy

The Archon system is designed to be modular and extensible. The microservices architecture and the separation of concerns make it possible to add new functionality with minimal risk to the existing system, provided that the established patterns are followed.

The core principle for extension is: **extend by adding, not by modifying.** Whenever possible, new functionality should be added as new components, services, or tools, rather than changing the core logic of existing ones.

## 2. Safe Extension Patterns

The following patterns are the recommended ways to extend the Archon system.

### 2.1. Adding a New UI Component (Low Risk)
*   **Location:** `archon-ui-main/src/`
*   **Process:**
    1.  Create your new component in the appropriate subdirectory (e.g., `components`, `pages`).
    2.  If the component needs to fetch data, add a new function to the relevant service in `archon-ui-main/src/services/`. This function should call an existing or new backend API endpoint.
    3.  Add tests for your new component in `archon-ui-main/test/`.
*   **Example:** Adding a new settings panel or a new type of data visualization.

### 2.2. Adding a New API Endpoint (Low Risk)
*   **Location:** `python/src/server/`
*   **Process:**
    1.  Define the business logic for your new feature in a new function within an existing service in `python/src/server/services/`.
    2.  Create a new API route handler in the appropriate file in `python/src/server/api_routes/` that calls your service function.
    3.  Add this new route to the main FastAPI application in `python/src/server/main.py`.
    4.  Add integration tests for your new endpoint in `python/tests/`.
*   **Example:** Adding an endpoint to get statistics about the knowledge base.

### 2.3. Adding a New MCP Tool (Medium Risk)
*   **Location:** `python/src/mcp_server/`
*   **Process:**
    1.  Define the new tool's functionality. The logic should ideally be implemented as a new API endpoint in the `archon-server` (see above).
    2.  In the `archon-mcp` service, define a new tool that, when executed, makes a call to your new API endpoint.
    3.  Register the new tool with the MCP server so it is discoverable by AI clients.
*   **Risk:** Medium, because changes to MCP tools can affect the behavior of all connected AI clients. The tool interface should be kept stable.

### 2.4. Adding a New RAG Strategy (High Risk)
*   **Location:** `python/src/server/services/search/`
*   **Process:**
    1.  Implement a new search strategy class that inherits from `BaseSearchStrategy`.
    2.  Your new class must implement the `search` method.
    3.  Modify the `rag_service.py` to allow for the selection of your new strategy, likely controlled by a setting in the `archon_settings` table.
*   **Risk:** High, because this affects the core functionality of the entire application. Changes must be thoroughly tested for both relevance and performance.

## 3. Extending the Database

**All database changes must be managed via version-controlled migration scripts.** Do not make changes directly to the database schema.

*   **Process:**
    1.  Create a new SQL script that contains the `ALTER TABLE`, `CREATE TABLE`, etc. commands.
    2.  The script must be idempotent (i.e., it can be run multiple times without causing errors). Use `IF NOT EXISTS` and `IF EXISTS` clauses.
    3.  Add the new script to the `migration/` directory and update the `README.md` with instructions on the migration order.
    4.  It is strongly recommended to adopt a formal migration tool like **Alembic**.
