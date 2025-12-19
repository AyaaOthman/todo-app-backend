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

// Swagger JSON specification (publicly accessible)
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(swaggerSpec);
});

// Swagger Documentation landing page (with external viewer links)
app.get('/api-docs', (req: Request, res: Response) => {
  const baseUrl = 'https://todo-app-backend-dnyb.vercel.app';
  const swaggerJsonUrl = `${baseUrl}/swagger.json`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Todo App API Documentation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #2563eb;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }
        .section {
          margin: 2rem 0;
        }
        .section h2 {
          color: #333;
          margin-bottom: 1rem;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 0.5rem;
        }
        .viewer-option {
          background: #f8fafc;
          padding: 1.5rem;
          margin: 1rem 0;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        .viewer-option h3 {
          margin-top: 0;
          color: #2563eb;
        }
        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 0.5rem 0.5rem 0.5rem 0;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #1d4ed8;
        }
        .btn-secondary {
          background: #64748b;
        }
        .btn-secondary:hover {
          background: #475569;
        }
        code {
          background: #f1f5f9;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          color: #dc2626;
        }
        .code-block {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }
        .endpoint {
          background: #f8fafc;
          padding: 0.5rem 1rem;
          margin: 0.5rem 0;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        .method {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-weight: bold;
          margin-right: 0.5rem;
          color: white;
          font-size: 0.85rem;
        }
        .method.get { background: #10b981; }
        .method.post { background: #3b82f6; }
        .method.put { background: #f59e0b; }
        .method.delete { background: #ef4444; }
        .method.patch { background: #8b5cf6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Todo App API Documentation</h1>
        <p class="subtitle">Complete API documentation for the Todo App backend</p>

        <div class="section">
          <h2>🔗 View Interactive Documentation</h2>
          
          <div class="viewer-option">
            <h3>Option 1: Swagger UI (Recommended)</h3>
            <p>View the API documentation in Swagger's official UI viewer:</p>
            <a href="https://petstore.swagger.io/?url=${encodeURIComponent(swaggerJsonUrl)}" 
               target="_blank" 
               class="btn">
              📖 Open in Swagger UI
            </a>
          </div>

          <div class="viewer-option">
            <h3>Option 2: Redocly</h3>
            <p>Beautiful, responsive API documentation:</p>
            <a href="https://redocly.github.io/redoc/?url=${encodeURIComponent(swaggerJsonUrl)}" 
               target="_blank" 
               class="btn">
              📄 Open in Redocly
            </a>
          </div>

          <div class="viewer-option">
            <h3>Option 3: Raw Swagger JSON</h3>
            <p>Download or view the raw OpenAPI specification:</p>
            <a href="/swagger.json" target="_blank" class="btn btn-secondary">
              📥 View Swagger JSON
            </a>
            <a href="/api-docs/json" target="_blank" class="btn btn-secondary">
              📋 Simplified JSON Docs
            </a>
          </div>
        </div>

        <div class="section">
          <h2>🚀 Quick Start</h2>
          <p><strong>Base URL:</strong> <code>${baseUrl}</code></p>
          
          <h3 style="margin-top: 1.5rem;">Authentication</h3>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span>/api/auth/signup</span> - Create account
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span>/api/auth/login</span> - Login & get token
          </div>

          <h3 style="margin-top: 1.5rem;">Task Lists</h3>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span>/api/task-lists</span> - Get all lists
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span>/api/task-lists</span> - Create list
          </div>

          <h3 style="margin-top: 1.5rem;">Tasks</h3>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span>/api/tasks</span> - Get all tasks
          </div>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span>/api/tasks</span> - Create task
          </div>
          <div class="endpoint">
            <span class="method patch">PATCH</span>
            <span>/api/tasks/:id</span> - Toggle completion
          </div>
        </div>

        <div class="section">
          <h2>🔐 Authentication Example</h2>
          <p>All protected endpoints require a JWT token in the Authorization header:</p>
          <div class="code-block">
curl -X POST ${baseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'

# Use the token in subsequent requests:
curl ${baseUrl}/api/task-lists \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
          </div>
        </div>

        <div class="section">
          <h2>📦 Share This Documentation</h2>
          <p>Share these links with your team:</p>
          <ul>
            <li><strong>This page:</strong> <code>${baseUrl}/api-docs</code></li>
            <li><strong>Swagger UI:</strong> <a href="https://petstore.swagger.io/?url=${encodeURIComponent(swaggerJsonUrl)}" target="_blank">View Live</a></li>
            <li><strong>Swagger JSON:</strong> <code>${baseUrl}/swagger.json</code></li>
          </ul>
        </div>

        <div class="section">
          <h2>🔗 Additional Resources</h2>
          <ul>
            <li><a href="/" target="_blank">API Root</a> - API information</li>
            <li><a href="/health" target="_blank">Health Check</a> - Server status</li>
            <li><a href="https://github.com/AyaaOthman/todo-app-backend" target="_blank">GitHub Repository</a></li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

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

