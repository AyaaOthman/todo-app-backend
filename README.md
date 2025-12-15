# Todo App Backend API

A RESTful API backend for a Todo application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ User authentication (Sign up & Login)
- ✅ Task Lists management (CRUD operations)
- ✅ Tasks management (CRUD operations)
- ✅ Advanced filtering for tasks
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ TypeScript for type safety

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

3. Start MongoDB (if running locally):
```bash
mongod
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Task Lists

All task list endpoints require authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Get All Task Lists
```http
GET /api/task-lists
Authorization: Bearer <token>
```

#### Get Task List by ID
```http
GET /api/task-lists/:id
Authorization: Bearer <token>
```

#### Create Task List
```http
POST /api/task-lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Work Tasks",
  "description": "Tasks related to work",
  "color": "#FF5733"
}
```

#### Update Task List
```http
PUT /api/task-lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Task List
```http
DELETE /api/task-lists/:id
Authorization: Bearer <token>
```

### Tasks

All task endpoints require authentication.

#### Get Tasks (with filters)
```http
GET /api/tasks?taskListId=xxx&completed=false&priority=high&tags=urgent,important&search=meeting
Authorization: Bearer <token>
```

**Query Parameters:**
- `taskListId` - Filter by specific task list
- `completed` - Filter by completion status (true/false)
- `priority` - Filter by priority (low/medium/high)
- `tags` - Filter by tags (comma-separated)
- `dueDate` - Filter by due date (YYYY-MM-DD format)
- `search` - Text search in title and description

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskListId": "task_list_id",
  "title": "Complete project",
  "description": "Finish the todo app project",
  "priority": "high",
  "dueDate": "2024-12-31",
  "tags": ["urgent", "important"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true,
  "priority": "low"
}
```

#### Toggle Task Completion
```http
PATCH /api/tasks/:id/toggle
Authorization: Bearer <token>
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── app.ts           # Express app setup
├── .env                 # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 24-hour expiration
- Protected routes with authentication middleware
- User ownership validation for all resources
- Input validation and sanitization

## License

ISC

