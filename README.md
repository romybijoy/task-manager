# TaskFlow — Task Management Application

A full-stack task management app with JWT authentication, built with **React (Vite)**, **Spring Boot**, and **MySQL**.

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 18 + Vite, Axios, React Router v6, Material UI 5 |
| Backend   | Spring Boot 3.2, Spring Security, Spring Data JPA   |
| Database  | MySQL 8+ (schema auto-created by Hibernate)         |
| Auth      | JWT (jjwt 0.11.5)                                   |
| Build     | Maven (backend), Vite (frontend)                    |

---

## Project Structure

```
task-manager/
├── backend/                       # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/taskmanager/
│       ├── config/                # Security configuration (CORS, JWT filter chain)
│       ├── controller/            # REST controllers
│       ├── dto/                   # Request/response DTOs
│       ├── entity/                # JPA entities (User, Task)
│       ├── exception/             # Global error handling
│       ├── repository/            # Spring Data repositories
│       ├── security/              # JWT utils, UserDetails, auth filter
│       └── service/               # Business logic
└── frontend/                      # React + Vite application
    ├── index.html                 # Vite entry (project root)
    ├── vite.config.js             # Dev server + /api proxy
    ├── package.json
    └── src/
        ├── api/                   # Axios instance + API calls
        ├── components/            # Reusable UI components
        ├── context/               # AuthContext (React Context)
        └── pages/                 # Login, Register, Dashboard
```

---

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

## Setup Instructions

### 1. Database

No manual SQL is required. With `spring.jpa.hibernate.ddl-auto=update` and
`createDatabaseIfNotExist=true` in the JDBC URL, the `taskmanager` database and
its tables are created automatically the first time the backend starts.

Just make sure MySQL is running and you have valid credentials.

### 2. Backend

**Configure** `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskmanager?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

**Run:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API starts at: `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at: `http://localhost:3000`

> Built with **Vite** — use `npm run dev` (dev server), `npm run build`
> (production bundle), and `npm run preview` (serve the build locally).

### 4. First run

The database starts empty, so there is no default user. Open the app, click
**Create an account** on the login page, register, and sign in.

---

## API Endpoints

### Auth
| Method | Endpoint             | Description        | Auth |
|--------|----------------------|--------------------|------|
| POST   | `/api/auth/register` | Register user      | ❌   |
| POST   | `/api/auth/login`    | Login, get JWT     | ❌   |

### Tasks
| Method | Endpoint             | Description                  | Auth |
|--------|----------------------|------------------------------|------|
| GET    | `/api/tasks`         | Get tasks (combinable filters)| ✅   |
| GET    | `/api/tasks/{id}`    | Get task by ID               | ✅   |
| POST   | `/api/tasks`         | Create task                  | ✅   |
| PUT    | `/api/tasks/{id}`    | Update task                  | ✅   |
| DELETE | `/api/tasks/{id}`    | Delete task                  | ✅   |
| GET    | `/api/tasks/stats`   | Task statistics              | ✅   |

**Query parameters** (GET `/api/tasks`) — all optional and applied together:
- `?status=TODO|IN_PROGRESS|COMPLETED`
- `?priority=LOW|MEDIUM|HIGH|URGENT`
- `?search=text` — matches task title or description (the `keyword` name is also accepted)

### Auth Header
```
Authorization: Bearer <your_jwt_token>
```

---

## Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Task CRUD** — Create, read, update, delete tasks
- **Combinable filtering** — Filter by status, priority, and text search all at once
- **Quick status change** — Update a task's status from the card's menu
- **Stats Dashboard** — Live counts of tasks by status
- **Priority Levels** — LOW / MEDIUM / HIGH / URGENT with color coding
- **Due Dates** — Overdue tasks highlighted
- **Responsive UI** — Works on desktop and mobile

---

## Git Setup

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow full-stack app"
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

A root `.gitignore` excludes `target/`, `node_modules/`, `dist/`, env files,
and IDE folders.

> **Before pushing:** `application.properties` is committed as-is. If it contains
> a real database password, replace it with an environment variable
> (`spring.datasource.password=${DB_PASSWORD:}`) so no secret lands in your repo.