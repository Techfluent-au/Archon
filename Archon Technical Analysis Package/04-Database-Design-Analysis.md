# Archon - Database Design Analysis

## 1. Overview

The Archon database is built on PostgreSQL and is designed to be hosted on Supabase. It makes effective use of modern PostgreSQL features, including the `vector` extension for similarity search and Row Level Security (RLS) for a secure data access layer. The schema is well-structured and divided into logical modules: Settings, Knowledge Base, Projects/Tasks, and Prompts.

The design is robust, with clear data separation, appropriate indexing for performance, and a sophisticated configuration system.

## 2. Schema Diagram (Conceptual)

```
+------------------------+      +--------------------------+      +--------------------------+
|    archon_settings     |      |      archon_prompts      |      |     archon_projects      |
|------------------------|      |--------------------------|      |--------------------------|
| - id (PK)              |      | - id (PK)                |      | - id (PK)                |
| - key (UNIQUE)         |      | - prompt_name (UNIQUE)   |      | - title                  |
| - value                |      | - prompt                 |      | - description            |
| - encrypted_value      |      | - description            |      | - docs (JSONB)           |
+------------------------+      +--------------------------+      | - features (JSONB)       |
                                                                  | - data (JSONB)           |
                                                                  +-----------+--------------+
                                                                              |
                                                                              | 1..*
                                                                  +-----------+--------------+
                                                                  |       archon_tasks       |
                                                                  |--------------------------|
                                                                  | - id (PK)                |
+------------------------+      +--------------------------+      | - project_id (FK)        |
|     archon_sources     |----->| archon_project_sources   |<-----| - title                  |
|------------------------| 1..* |--------------------------| 1..* | - status (ENUM)          |
| - source_id (PK)       |      | - project_id (FK)        |      | - assignee               |
| - title                |      | - source_id (FK)         |      | - parent_task_id (FK)    |
| - summary              |      +--------------------------+      +--------------------------+
| - metadata (JSONB)     |
+-----------+------------+
            |
            | 1..*
+-----------+------------+      +--------------------------+
| archon_crawled_pages   |      | archon_code_examples     |
|------------------------|      |--------------------------|
| - id (PK)              |      | - id (PK)                |
| - source_id (FK)       |      | - source_id (FK)         |
| - url                  |      | - url                    |
| - content              |      | - content (code)         |
| - embedding (VECTOR)   |      | - summary                |
+------------------------+      | - embedding (VECTOR)     |
                                +--------------------------+
```

## 3. Key Tables and Design Patterns

### 3.1. `archon_settings`
*   **Purpose:** A flexible key-value store for all application configuration.
*   **Design Pattern:** This table uses a powerful pattern that allows it to store both public configuration (in the `value` column) and sensitive secrets (in the `encrypted_value` column), distinguished by the `is_encrypted` flag. This provides a single source of truth for all settings.
*   **Analysis:** This is an excellent design. It's far more flexible than using environment variables for everything, as it allows settings to be updated dynamically via the UI without requiring a service restart. The use of categories helps keep the settings organized.

### 3.2. Knowledge Base (`archon_sources`, `archon_crawled_pages`, `archon_code_examples`)
*   **Purpose:** To store the processed and vectorized data that powers the RAG (Retrieval-Augmented Generation) functionality.
*   **Design Pattern:** The schema separates source metadata (`archon_sources`) from the actual content chunks (`archon_crawled_pages` and `archon_code_examples`). This is efficient, as it avoids duplicating source information for every chunk. The separation of text chunks and code chunks into different tables is a smart choice that allows for specialized searching and processing.
*   **Analysis:** The use of the `vector` data type and an IVFFlat index is the correct, high-performance approach for similarity search in PostgreSQL. The database functions (`match_...`) that encapsulate the search logic are also a best practice, as they keep the complex query logic within the database layer.

### 3.3. Projects and Tasks (`archon_projects`, `archon_tasks`)
*   **Purpose:** To provide integrated project and task management capabilities.
*   **Design Pattern:** This module implements a standard hierarchical task model, with `archon_tasks` having a self-referencing foreign key (`parent_task_id`) to support sub-tasks. It also includes a junction table (`archon_project_sources`) for a many-to-many relationship between projects and knowledge sources.
*   **Analysis:** The design is comprehensive. The inclusion of a dedicated `archon_document_versions` table for tracking changes to JSONB fields within projects is a particularly sophisticated feature, providing an audit trail and version control capabilities directly within the database. The use of a soft-delete pattern (`archived` flag) in the `archon_tasks` table is a good practice for preserving data history.

### 3.4. `archon_prompts`
*   **Purpose:** To store and manage the system prompts used by the AI agents.
*   **Design Pattern:** A simple lookup table.
*   **Analysis:** This is a very strong design choice. By externalizing prompts from the application code into the database, the behavior of the AI agents can be tweaked and updated dynamically without requiring a code change and redeployment. This greatly increases the flexibility and maintainability of the AI components.

## 4. Security (Row Level Security)

*   **Implementation:** RLS is enabled on all tables, with policies that grant full access to the `service_role` (which the backend uses) and more limited, appropriate access to `authenticated` users.
*   **Analysis:** This is an excellent security foundation. It ensures that data access rules are enforced at the database level, providing a critical layer of defense. The policies are currently simple, but they establish a pattern that can be easily extended with more granular, multi-tenant rules if the application evolves to support multiple organizations.

## 5. Recommendations for Improvement

The database design is very strong, but there are a few areas for potential improvement as the system matures:

*   **Migration Management:** While the `complete_setup.sql` script is great for initial setup, a formal migration tool (like Alembic for Python or Flyway/Liquibase) should be adopted to manage incremental schema changes in a more robust and version-controlled manner. This will be critical as the application evolves.
*   **JSONB Field Validation:** The `docs`, `features`, and `data` fields in `archon_projects` are simple `JSONB` fields. Consider using JSON Schema validation constraints within the database to ensure that the data stored in these fields always conforms to the expected structure.
*   **Performance Tuning:** The current indexing is good for a start. As the volume of data grows, more advanced performance tuning will be necessary. This includes analyzing query plans, tuning PostgreSQL configuration, and potentially using more advanced indexing strategies for `pgvector` (like HNSW).
