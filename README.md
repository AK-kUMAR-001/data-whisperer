# Data Whisperer

1. Proposed Solution

Dolphin AI Studio is an AI-powered SQL workspace that enables users to interact with databases using natural language instead of manually writing SQL queries. The platform combines AI-assisted query generation, database design, SQL learning, and visualization into a single integrated environment.

Users can ask questions in English (or supported regional languages), and the system intelligently interprets the request to generate accurate SQL queries along with detailed explanations. Beyond query generation, the platform can create complete database schemas from business requirements, generate ER diagrams, provide interactive SQL practice, and allow conversational modifications to database designs.

The workspace is inspired by the familiarity of database IDEs, reducing the learning curve while introducing AI-driven features that simplify database development and education.

2. System Architecture

                User
                  │
                  ▼
        React Frontend (UI)
                  │
                  ▼
         FastAPI Backend (Python)
                  │
      ┌───────────┼────────────┐
      ▼           ▼            ▼
 AI Processing   SQL Engine   Speech Module
      │
      ▼
 Schema Analyzer
      │
      ▼
 SQL Generator
      │
      ▼
 Validation Engine
      │
      ▼
 ER Diagram Generator
      │
      ▼
 MySQL / PostgreSQL

3. Frontend Modules

Developed using React.js + Tailwind CSS.

User Authentication

 Login

 Register

 User Profile

AI Prompt Workspace

 Natural language input

 Voice input

 Multilingual support

SQL Editor

 SQL syntax highlighting

 Copy SQL

 Download SQL

AI Explanation Panel

 Line-by-line SQL explanation

 SQL keyword descriptions

Practice Mode

 SQL exercises

 AI answer evaluation

 Instant feedback

Database Designer

 Requirement input

 AI-generated schema

 Schema modification through prompts

ER Diagram Viewer

 Auto-generated relationship diagrams

 Zoom and navigation

Export Center

 SQL file

 ER Diagram

 Documentation

4. Backend Modules

Developed using Python FastAPI.

Natural Language Processing Engine

 Understands user prompts

 Extracts database intent

AI SQL Generator

 Converts natural language into SQL

 Supports CRUD and advanced SQL operations

Schema Generator

 Creates complete database structures

 Generates tables, relationships and constraints

Conversation Manager

 Maintains context for follow-up prompts

 Supports iterative schema modification

SQL Explanation Engine

 Explains generated SQL

 Describes clauses and relationships

Validation Engine

 Checks schema consistency

 Verifies primary and foreign keys

 Detects missing relationships

ER Diagram Generator

 Creates ER diagrams from generated schemas

Export Service

 Generates SQL scripts

 Generates documentation

 Creates downloadable project files

5. Technologies Used

Frontend

 React.js

 Tailwind CSS

 Monaco Editor

 React Flow / Mermaid.js

Backend

 Python

 FastAPI

AI

 OpenAI GPT API (or local LLM such as Llama 3)

Database

 MySQL

 PostgreSQL

Voice Processing

 Web Speech API

 Whisper (Optional)

6. Key Features

 Natural Language to SQL conversion

 AI-powered SQL explanation

 Voice-based SQL generation

 Multilingual query support

 AI Database Designer

 Conversational schema modification

 Automatic ER Diagram generation

 SQL Practice Mode

 SQL export

 Database documentation generation

7. Advantages

 Eliminates the need for extensive SQL knowledge.

 Reduces database development time.

 Makes SQL accessible to beginners.

 Provides an interactive SQL learning environment.

 Automatically generates complete database schemas.

 Simplifies database visualization using ER diagrams.

 Reduces manual errors in schema creation.

 Supports conversational database updates.

 Improves productivity for developers and students.

 Combines learning, development, and design in a single platform.

8. Existing System

Current SQL generation platforms typically provide:

 Natural language to SQL conversion.

 Basic AI-assisted query generation.

 Limited SQL explanations.

 Minimal educational support.

 Separate tools for ER diagrams and schema design.

 Manual database creation after AI generation.

 Limited support for conversational schema modification.

Examples include:

 ChatGPT

 Microsoft Copilot

 Google Gemini

 Vanna AI

 ThoughtSpot

9. Proposed System (What's New)

Existing SystemsDolphin AI StudioGenerates SQL queries onlyGenerates SQL + explains every queryFocuses mainly on query generationComplete AI SQL workspaceLimited learning supportInteractive SQL Practice ModeManual database designAI generates complete database schemasSeparate ER diagram toolsAutomatic ER diagram generationOne-time generationConversational schema modificationMostly English inputVoice and multilingual supportRequires multiple toolsUnified platform for design, learning, and developmentLimited documentationAutomatic SQL and documentation exportLimited educational focusBuilt for both learning and professional database development

10. Novel Contributions

The proposed system introduces several integrated capabilities that are typically unavailable together in existing SQL tools:

AI Database Designer: Generates complete databases from business requirements, including tables, keys, constraints, relationships, and sample data.

Conversational Database Evolution: Users can modify existing schemas through follow-up prompts without regenerating the entire database.

AI SQL Tutor: Explains generated SQL line by line, helping users understand the logic rather than simply copying code.

Integrated Practice Mode: Students can solve SQL problems and receive AI-based evaluation and feedback.

Automatic ER Diagram Generation: Creates visual database models directly from generated schemas.

Unified SQL Workspace: Combines database design, query generation, learning, visualization, and export within a single application.

These features position Dolphin AI Studio as an intelligent SQL workspace rather than a standalone SQL generator, making it suitable for both educational and practical database development scenarios.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0726f9a-2d7a-40b7-8eb4-f46c7fac365b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
