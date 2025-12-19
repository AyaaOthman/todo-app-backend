// Vercel Serverless Function Entry Point
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from '../src/config/database';
import { errorHandler, notFoundHandler } from '../src/utils/errorHandler';
import { swaggerSpec } from '../src/config/swagger';

// Routes
import authRoutes from '../src/routes/auth.routes';
import taskListRoutes from '../src/routes/taskLists.routes';
import taskRoutes from '../src/routes/tasks.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection (lazy initialization for serverless)
let dbInitialized = false;
const initDatabase = async () => {
  if (!dbInitialized) {
    await connectDatabase();
    dbInitialized = true;
  }
};

// Middleware to ensure database is connected
app.use(async (req: Request, res: Response, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed' 
    });
  }
});

// Swagger Documentation (keep original)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo App API Documentation',
}));

// JSON API Documentation endpoint (alternative to Swagger UI)
app.get('/api-docs/json', (req: Request, res: Response) => {
  res.json({
    message: 'Todo App API Documentation',
    version: '1.0.0',
    baseUrl: 'https://todo-app-backend-dnyb.vercel.app',
    swaggerUI: '/api-docs',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
        requiresAuth: false
      },
      auth: {
        signup: {
          method: 'POST',
          path: '/api/auth/signup',
          description: 'Create a new user account',
          requiresAuth: false,
          body: {
            email: 'string (required)',
            password: 'string (required, min 6 chars)',
            name: 'string (required)'
          },
          response: {
            token: 'JWT token',
            user: { id: 'string', email: 'string', name: 'string' }
          }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login with email and password',
          requiresAuth: false,
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          response: {
            token: 'JWT token',
            user: { id: 'string', email: 'string', name: 'string' }
          }
        }
      },
      taskLists: {
        getAll: {
          method: 'GET',
          path: '/api/task-lists',
          description: 'Get all task lists for authenticated user',
          requiresAuth: true
        },
        getById: {
          method: 'GET',
          path: '/api/task-lists/:id',
          description: 'Get a specific task list',
          requiresAuth: true
        },
        create: {
          method: 'POST',
          path: '/api/task-lists',
          description: 'Create a new task list',
          requiresAuth: true,
          body: {
            name: 'string (required)',
            description: 'string (optional)',
            color: 'string (optional, hex color)'
          }
        },
        update: {
          method: 'PUT',
          path: '/api/task-lists/:id',
          description: 'Update a task list',
          requiresAuth: true,
          body: {
            name: 'string (optional)',
            description: 'string (optional)',
            color: 'string (optional)'
          }
        },
        delete: {
          method: 'DELETE',
          path: '/api/task-lists/:id',
          description: 'Delete a task list',
          requiresAuth: true
        }
      },
      tasks: {
        getAll: {
          method: 'GET',
          path: '/api/tasks',
          description: 'Get all tasks with optional filters',
          requiresAuth: true,
          queryParams: {
            taskListId: 'string (filter by list)',
            completed: 'boolean (filter by status)',
            priority: 'string (low/medium/high)',
            tags: 'string (comma-separated)',
            search: 'string (search in title/description)'
          }
        },
        getById: {
          method: 'GET',
          path: '/api/tasks/:id',
          description: 'Get a specific task',
          requiresAuth: true
        },
        create: {
          method: 'POST',
          path: '/api/tasks',
          description: 'Create a new task',
          requiresAuth: true,
          body: {
            taskListId: 'string (required)',
            title: 'string (required)',
            description: 'string (optional)',
            priority: 'string (optional: low/medium/high)',
            dueDate: 'string (optional, ISO date)',
            tags: 'array of strings (optional)'
          }
        },
        update: {
          method: 'PUT',
          path: '/api/tasks/:id',
          description: 'Update a task',
          requiresAuth: true,
          body: {
            title: 'string (optional)',
            description: 'string (optional)',
            completed: 'boolean (optional)',
            priority: 'string (optional)',
            dueDate: 'string (optional)',
            tags: 'array of strings (optional)'
          }
        },
        toggle: {
          method: 'PATCH',
          path: '/api/tasks/:id',
          description: 'Toggle task completion status',
          requiresAuth: true
        },
        delete: {
          method: 'DELETE',
          path: '/api/tasks/:id',
          description: 'Delete a task',
          requiresAuth: true
        }
      }
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <your-token>',
      howToGetToken: 'Login or signup to receive a JWT token',
      tokenExpiration: '24 hours'
    },
    notes: [
      'All endpoints return JSON responses',
      'Protected endpoints require Authorization header',
      'Timestamps are in ISO 8601 format',
      'Error responses follow format: { success: false, error: "message" }'
    ]
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless',
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Todo App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      documentation: {
        swagger: '/api-docs (Interactive UI - may have issues in serverless)',
        json: '/api-docs/json (Clean JSON documentation)'
      },
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
      },
      taskLists: 'GET/POST/PUT/DELETE /api/task-lists',
      tasks: 'GET/POST/PUT/PATCH/DELETE /api/tasks',
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/task-lists', taskListRoutes);
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export the Express app as a serverless function handler
export default app;

