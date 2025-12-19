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

// API Documentation endpoint (Swagger UI disabled for serverless)
app.get('/api-docs', (req: Request, res: Response) => {
  res.json({
    message: 'Todo App API Documentation',
    version: '1.0.0',
    note: 'Swagger UI is not available in serverless deployments',
    baseUrl: 'https://todo-app-backend-dnyb.vercel.app',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      auth: {
        signup: {
          method: 'POST',
          path: '/api/auth/signup',
          body: { email: 'string', password: 'string', name: 'string' }
        },
        login: {
          method: 'POST',
          path: '/api/auth/login',
          body: { email: 'string', password: 'string' }
        }
      },
      taskLists: {
        getAll: { method: 'GET', path: '/api/task-lists', requiresAuth: true },
        create: { method: 'POST', path: '/api/task-lists', requiresAuth: true },
        update: { method: 'PUT', path: '/api/task-lists/:id', requiresAuth: true },
        delete: { method: 'DELETE', path: '/api/task-lists/:id', requiresAuth: true }
      },
      tasks: {
        getAll: { method: 'GET', path: '/api/tasks', requiresAuth: true },
        create: { method: 'POST', path: '/api/tasks', requiresAuth: true },
        update: { method: 'PUT', path: '/api/tasks/:id', requiresAuth: true },
        toggle: { method: 'PATCH', path: '/api/tasks/:id', requiresAuth: true },
        delete: { method: 'DELETE', path: '/api/tasks/:id', requiresAuth: true }
      }
    },
    authentication: 'Include "Authorization: Bearer <token>" header for protected routes'
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
      docs: '/api-docs',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
      },
      taskLists: 'GET/POST/PUT/DELETE /api/task-lists',
      tasks: 'GET/POST/PUT/PATCH/DELETE /api/tasks',
    },
    documentation: '/api-docs',
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

