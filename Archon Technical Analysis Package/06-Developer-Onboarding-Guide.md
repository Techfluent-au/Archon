# Developer Onboarding Guide - Archon Project

## 🚀 Getting Started

Welcome to the Archon project! This guide will walk you through setting up your development environment and provide you with the information you need to start contributing.

### Prerequisites
*   **Docker Desktop:** For running the microservices in a containerized environment.
*   **Node.js:** Version 18+ is required for frontend development.
*   **Supabase Account:** You'll need a free Supabase project for the database.
*   **OpenAI API Key:** Required for embedding generation and other AI features. You can also use Google Gemini or a local Ollama instance.
*   **(Optional) Make:** Recommended for using the convenient Makefile commands.

### Environment Setup

The recommended way to work on Archon is using the **hybrid development mode**, where the backend services run in Docker and the frontend runs locally on your host machine for a better hot-reloading experience.

```bash
# 1. Clone the repository
git clone https://github.com/Techfluent-au/Archon.git
cd Archon

# 2. Create the environment file
# This command copies the example file to .env
cp .env.example .env

# 3. Configure your credentials
# Open the .env file in your editor and add your Supabase URL and SERVICE key.
# You can also add your OpenAI API key here, or you can set it later in the UI.
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-key-here

# 4. Set up the database schema
# Log in to your Supabase project, go to the SQL Editor, and run the
# entire contents of the migration/complete_setup.sql file.

# 5. Install dependencies
# This command will install both Python and Node.js dependencies.
make install

# 6. Start the development environment
# This starts the backend in Docker and the frontend locally.
make dev
```

Your services will be available at:
*   **Web Interface:** http://localhost:3737
*   **API Service:** http://localhost:8181
*   **MCP Server:** http://localhost:8051

## 🏗️ Architecture Overview

### System Components

Archon uses a microservices architecture. See the diagram and component breakdown below.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Server (API)   │    │   MCP Server    │    │ Agents Service  │
│  (archon-ui)    │    │ (archon-server) │    │  (archon-mcp)   │    │ (archon-agents) │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

*   **Frontend (`archon-ui-main`)**: The React/TypeScript user interface.
*   **Server (`python/src/server`)**: The core FastAPI backend handling business logic and data processing.
*   **MCP Server (`python/src/mcp_server`)**: A lightweight gateway for AI coding assistant clients.
*   **Agents Service (`python/src/agents`)**: A service for running PydanticAI agents.

For a more detailed breakdown, please refer to the `03-Architecture-Documentation.md`.

### Key Design Patterns
*   **Microservices:** Ensures separation of concerns.
*   **Asynchronous Operations:** Long-running tasks are handled in the background.
*   **Real-time Updates:** Socket.IO is used to push progress updates to the UI.
*   **Service Delegation:** The `MCP` and `Agents` services are lightweight and delegate heavy work to the `Server`, centralizing core logic.

## 🛠️ Development Guidelines

### Code Standards
*   **Python:** Code style is enforced by `ruff` and type safety by `mypy`. Configuration is in `python/pyproject.toml`. Please run `uv run ruff check` and `uv run mypy src/` before committing.
*   **TypeScript/React:** Code style is enforced by `eslint`. Configuration is in `archon-ui-main/.eslintrc.cjs`. Please run `npm run lint` before committing.

### Testing Practices
*   **Backend (`pytest`):**
    *   Tests are located in `python/tests/`.
    *   Run all backend tests with `make test-be` or `(cd python && uv run pytest)`.
    *   New features or bug fixes **must** be accompanied by tests.
    *   Tests should have specific assertions that validate status codes and response data. Avoid permissive assertions.
*   **Frontend (`vitest`):**
    *   Tests are located in `archon-ui-main/test/`.
    *   Run all frontend tests with `make test-fe` or `(cd archon-ui-main && npm test)`.
    *   The frontend test suite is currently disabled in CI but is expected to be maintained. All new components and logic should have test coverage.

### Git Workflow
We follow the **GitHub Flow** branching strategy.
1.  Create a new feature branch from `main`.
2.  Do your work on the feature branch.
3.  Open a pull request to merge your branch into `main`.
4.  Ensure your PR passes all CI checks and has been reviewed by a team member.
5.  Use the `pull_request_template.md` to structure your PR description.

## 🔧 Extension Points

The modular nature of the architecture provides several safe areas for extension.

### Safe Modification Areas
| Component | Description | Extension Pattern | Risk Level |
|-----------|-------------|-------------------|------------|
| Frontend Components | Add new UI components or pages in `archon-ui-main/src/`. | Create a new `.tsx` file in the appropriate directory (`components`, `pages`). | Low |
| Backend API Endpoints | Add new API endpoints to the `archon-server`. | Add a new router in `python/src/server/api_routes/` and corresponding logic in `services`. | Low |
| MCP Tools | Add a new tool for AI clients to use. | Define a new tool function in the `archon-mcp` service and expose it. | Medium |
| RAG Strategies | Add a new search or retrieval strategy. | Implement a new strategy class in `python/src/server/services/search/` and make it configurable via the `archon_settings` table. | High |

### Plugin Architecture
The MCP Server's tool system acts as a plugin architecture for AI capabilities. You can add new tools that AI clients can leverage without modifying the core AI client code.

## 🚨 Critical Areas (DO NOT MODIFY)

The following areas are critical to the system's stability and should not be modified without careful planning and discussion with the team.

### Core System Components
*   **Inter-service Communication Logic:** The way services discover and communicate with each other (via HTTP and environment variables) is fundamental. Changes here can bring down the entire system.
*   **WebSocket Broadcasting (`archon-server`):** The core logic for broadcasting real-time events is shared by many features.
*   **Authentication & Settings Service:** The logic in `archon_settings` for handling encrypted and unencrypted values is critical for security and configuration.

### Database Schema Core
*   **Do not modify the database schema directly.** All changes must be done through migration scripts. A formal migration tool should be adopted, but in its absence, any changes must be captured in a new SQL script.
*   **Primary Keys and Foreign Keys:** Changing relationships between core tables like `archon_sources` and `archon_crawled_pages` can lead to data corruption.
*   **The `vector` column:** The dimension of the embedding vector (1536) is tied to the embedding model being used. Changing this requires re-embedding all existing data.
