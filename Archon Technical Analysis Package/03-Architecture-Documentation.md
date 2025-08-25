# Archon - Architecture Documentation

## 1. Architectural Vision & Principles

The Archon system is designed based on a set of core principles that guide its development and evolution:

*   **Modularity and Separation of Concerns:** Each component of the system has a single, well-defined responsibility. This is achieved through a microservices architecture, where services are developed, deployed, and scaled independently.
*   **Technology-Fit-for-Purpose:** Each microservice uses the technology stack best suited for its specific task. For example, Python with its rich AI/ML ecosystem is used for the backend, while React and TypeScript provide a modern, robust foundation for the user interface.
*   **Asynchronous & Real-time Communication:** The system is designed to be highly responsive. Long-running tasks (like web crawling and document processing) are handled asynchronously in the background, with real-time progress updates pushed to the frontend via WebSockets (Socket.IO).
*   **Developer Experience:** The architecture is designed to be developer-friendly, with hot-reloading for both frontend and backend, containerized environments for consistency, and a clear separation that allows teams to work in parallel.

## 2. System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Server (API)   │    │   MCP Server    │    │ Agents Service  │
│  (archon-ui)    │    │ (archon-server) │    │  (archon-mcp)   │    │ (archon-agents) │
│  React + Vite   │◄──►│    FastAPI +    │◄──►│    Lightweight  │◄──►│   PydanticAI    │
│  Port 3737      │    │    Socket.IO    │    │    HTTP Wrapper │    │   Port 8052     │
│                 │    │    Port 8181    │    │    Port 8051    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │                        │
         └────────────────────────┼────────────────────────┼────────────────────────┘
                                  │                        │
                         ┌─────────────────┐               │
                         │    Database     │               │
                         │                 │               │
                         │    Supabase     │◄──────────────┘
                         │    PostgreSQL   │
                         │    PGVector     │
                         └─────────────────┘
```

## 3. Service-by-Service Breakdown

### 3.1. Frontend (archon-ui)
*   **Purpose:** Provides the main graphical user interface for users to interact with the Archon system.
*   **Key Responsibilities:**
    *   User authentication and settings management.
    *   Dashboard for managing knowledge sources (crawling, uploads).
    *   Interface for creating and managing projects and tasks.
    *   Real-time display of progress for background tasks.
    *   MCP dashboard for viewing connected clients and testing tools.
*   **Core Technologies:** React, TypeScript, Vite, TailwindCSS, Socket.IO Client, Zod.
*   **Communication:**
    *   Makes RESTful API calls to the `archon-server` for most operations.
    *   Establishes a persistent WebSocket connection to the `archon-server` to receive real-time updates.

### 3.2. Server (archon-server)
*   **Purpose:** The central nervous system of the backend, handling all core business logic and data processing.
*   **Key Responsibilities:**
    *   Provides the main REST API for the frontend.
    *   Manages the entire lifecycle of knowledge ingestion (crawling, document parsing, chunking, embedding).
    *   Orchestrates long-running background tasks.
    *   Interacts with the Supabase database for all CRUD operations.
    *   Communicates with external LLM providers (e.g., OpenAI) for embedding generation and other AI tasks.
    *   Broadcasts real-time progress updates to connected frontend clients via Socket.IO.
*   **Core Technologies:** Python, FastAPI, Uvicorn, Socket.IO, Pydantic, Supabase client, Crawl4ai, Sentence-Transformers.
*   **Communication:**
    *   Receives HTTP requests from the frontend and `archon-mcp` service.
    *   Pushes WebSocket events to the frontend.
    *   Makes outbound connections to the database and third-party AI service APIs.

### 3.3. MCP Server (archon-mcp)
*   **Purpose:** Implements the Model Context Protocol (MCP) to provide a standardized interface for AI coding assistants.
*   **Key Responsibilities:**
    *   Acts as a lightweight gateway for MCP clients (e.g., Cursor).
    *   Exposes a set of "tools" that AI clients can execute (e.g., `perform_rag_query`, `manage_task`).
    *   Translates MCP tool calls into standard HTTP API requests to the `archon-server` or `archon-agents` services.
    *   Manages sessions for connected AI clients.
*   **Core Technologies:** Python, FastAPI, Pydantic, MCP library.
*   **Communication:**
    *   Receives HTTP requests from MCP clients.
    *   Makes outbound HTTP requests to the `archon-server` and `archon-agents` to fulfill tool requests.

### 3.4. Agents Service (archon-agents)
*   **Purpose:** A dedicated, lightweight service for hosting and executing PydanticAI agents.
*   **Key Responsibilities:**
    *   Runs AI agents that can perform complex, multi-step tasks.
    *   Agents are designed to be stateless orchestrators, using the tools provided by the MCP server to interact with the rest of the system.
    *   Streams responses back to the client.
*   **Core Technologies:** Python, FastAPI, PydanticAI.
*   **Communication:**
    *   Receives HTTP requests from the `archon-mcp` service to trigger agent runs.
    *   Makes outbound HTTP requests back to the `archon-mcp` service to execute tools.

## 4. Data and Communication Flow Examples

### Example 1: Web Crawl
1.  **User** initiates a crawl from the **Frontend UI**.
2.  **Frontend** sends a `POST /api/knowledge/crawl` request to the **Server**.
3.  **Server** validates the request and starts the crawling process in a background task.
4.  As the **Server** crawls pages, it sends `crawl_progress` events via **Socket.IO** to the **Frontend**.
5.  **Frontend** receives the events and updates the UI in real-time to show the progress.
6.  Upon completion, the **Server** stores the processed data in the **Supabase Database**.

### Example 2: RAG Query from an AI Client
1.  **AI Client** (e.g., Cursor) executes the `perform_rag_query` tool.
2.  The request is sent to the **MCP Server**.
3.  **MCP Server** validates the tool call and forwards it as an HTTP request to the **Server**'s search endpoint (`/api/knowledge/search`).
4.  **Server** receives the request, generates embeddings for the query, and performs a similarity search against the **Supabase Database** using `pgvector`.
5.  **Server** may perform additional steps like reranking the results.
6.  **Server** returns the search results to the **MCP Server**.
7.  **MCP Server** formats the response according to the MCP standard and returns it to the **AI Client**.

## 5. Key Design Decisions

*   **Microservices over Monolith:** This choice was made to ensure a clear separation of concerns, allow for independent technology choices (e.g., PydanticAI in its own service), and prepare for future scalability. It prevents the core application from becoming a tightly-coupled "big ball of mud".
*   **HTTP APIs for Inter-Service Communication:** Standard RESTful HTTP was chosen for its simplicity, ubiquity, and ease of debugging. While gRPC could offer higher performance, HTTP is sufficient for the current needs and reduces complexity.
*   **Socket.IO for Real-time Updates:** WebSockets were chosen over alternatives like polling or Server-Sent Events (SSE) because they provide a persistent, bidirectional communication channel, which is ideal for sending real-time progress updates from the server to the client. Socket.IO provides a robust library with fallbacks.
*   **Delegation to Core Services:** The `Agents` and `MCP` services are intentionally kept lightweight. They delegate all heavy lifting (database access, AI model calls, etc.) to the `Server`. This centralizes the core business logic, making the system easier to maintain and reason about.
