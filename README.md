# RAG Blog App

BlogGEN is an AI-powered blog generation application that takes a user's topic and automatically creates a complete, structured blog using a multi-step LangGraph workflow.

The application combines LLMs, research, dynamic token budgeting, AI-generated images, thread-based chat history, and a React frontend to provide a better blog generation experience.

---

## Features

- Generate complete blogs from a simple topic
- Multi-step AI workflow using LangGraph
- Automatic task planning before writing
- Dynamic token budgeting based on planned research
- Intelligent research routing
- External research for tasks that require it
- AI-generated images for relevant sections
- Automatic image planning and generation
- Markdown-based blog rendering
- Thread-based conversation history
- Create and switch between multiple chats
- Automatically generated thread names
- Fallback thread naming when LLM naming fails
- Token budget panel for viewing research task budgets
- Responsive UI for desktop and mobile
- Loading animations while generating content
- Separate frontend and backend architecture

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Markdown
- JavaScript / JSX

### Backend

- Python
- FastAPI
- LangGraph
- LangChain
- Pydantic
- Uvicorn

### AI Models

- OpenAI models for planning, routing, and thread naming
- Anthropic Claude for blog composition
- Gemini image generation for blog images

### Research

- Tavily for web search and external research

### Other

- In-memory LangGraph checkpointing
- Base64 image embedding
- REST API communication between frontend and backend

---

# Project Architecture

The application is divided into two main parts:

```text
blog-rag-app/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes_blog.py
│   │   │   └── routes_threads.py
│   │   │
│   │   ├── core/
│   │   │   └── thread_registry.py
│   │   │
│   │   ├── graph/
│   │   │   ├── graph_builder.py
│   │   │   ├── graph_instance.py
│   │   │   ├── state.py
│   │   │   │
│   │   │   └── nodes/
│   │   │       ├── planner.py
│   │   │       ├── token_budget.py
│   │   │       ├── research.py
│   │   │       ├── composer.py
│   │   │       ├── image_planner.py
│   │   │       ├── image_gen.py
│   │   │       ├── router.py
│   │   │       └── merge.py
│   │   │
│   │   ├── services/
│   │   │   ├── llm_client.py
│   │   │   ├── tavily_client.py
│   │   │   └── image_client.py
│   │   │
│   │   ├── __init__.py
│   │   └── main.py
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   └── runtime.txt
│
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── api/
│   │   │   ├── blogApi.jsx
│   │   │   └── threadsApi.jsx
│   │   │
│   │   ├── assets/
│   │   │   └── icons/
│   │   │       ├── new-chat.png
│   │   │       ├── send-button.png
│   │   │       └── token-budget.png
│   │   │
│   │   ├── components/
│   │   │   ├── AIMessageCard.jsx
│   │   │   ├── UserMessageCard.jsx
│   │   │   ├── ThreadSidebar.jsx
│   │   │   └── TokenBudgetPanel.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── ChatPage.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── App.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   │   └── ...
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── README.md
│   └── index.html
│
│
├── .gitignore
└── README.md

## Deployment

BlogGEN is deployed using **Vercel** and **Render**.

### Frontend

The React frontend is deployed on **Vercel**.

🔗 **Live Application:** https://blog-rag-app.vercel.app

### Backend

The FastAPI backend is deployed on **Render**.

The frontend communicates with the deployed FastAPI backend through REST API endpoints.

### Deployment Architecture

```text
User
  │
  ▼
Vercel
(React Frontend)
  │
  │ REST API
  ▼
Render
(FastAPI Backend)
  │
  ├── LangGraph
  ├── OpenAI
  ├── Anthropic Claude
  ├── Tavily
  └── Gemini

## Author

### Mayank Jeet

- GitHub: [@Mayank-jeet](https://github.com/Mayank-jeet)
- LinkedIn: [Mayank Jeet](https://www.linkedin.com/in/mayank-jeet-211583364/)
