import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo App API',
      version: '1.0.0',
      description: 'RESTful API documentation for Todo App with authentication, task lists, tasks, and filters',
      contact: {
        name: 'API Support',
        email: 'support@todoapp.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'https://todo-app-backend-dnyb.vercel.app',
        description: 'Production server (Vercel)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login or signup',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
          },
        },
        TaskList: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task list ID',
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this list',
            },
            name: {
              type: 'string',
              description: 'Task list name',
            },
            description: {
              type: 'string',
              description: 'Task list description',
            },
            color: {
              type: 'string',
              format: 'hex',
              description: 'Hex color code for the list',
              example: '#FF5733',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID',
            },
            taskListId: {
              type: 'string',
              description: 'Task list ID this task belongs to',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Task description',
            },
            completed: {
              type: 'boolean',
              description: 'Task completion status',
              default: false,
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority level',
              default: 'medium',
            },
            dueDate: {
              type: 'string',
              format: 'date',
              description: 'Task due date',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Task tags',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication endpoints (signup, login)',
      },
      {
        name: 'Task Lists',
        description: 'Task list management endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/app.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

