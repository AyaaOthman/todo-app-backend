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
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Check if the server is running',
          responses: {
            '200': {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Server is running' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/signup': {
        post: {
          tags: ['Authentication'],
          summary: 'User signup',
          description: 'Create a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', format: 'password', minLength: 6, example: 'password123' },
                    name: { type: 'string', example: 'John Doe' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'User created successfully' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', format: 'password', example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                          user: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/task-lists': {
        get: {
          tags: ['Task Lists'],
          summary: 'Get all task lists',
          description: 'Get all task lists for the authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Task lists retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TaskList' },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Task Lists'],
          summary: 'Create task list',
          description: 'Create a new task list',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Work Tasks' },
                    description: { type: 'string', example: 'Tasks related to work' },
                    color: { type: 'string', example: '#FF5733' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Task list created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task list created successfully' },
                      data: { $ref: '#/components/schemas/TaskList' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/task-lists/{id}': {
        get: {
          tags: ['Task Lists'],
          summary: 'Get task list by ID',
          description: 'Get a specific task list',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task list ID',
            },
          ],
          responses: {
            '200': {
              description: 'Task list retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TaskList' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Task list not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Task Lists'],
          summary: 'Update task list',
          description: 'Update a task list',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task list ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Updated Name' },
                    description: { type: 'string', example: 'Updated description' },
                    color: { type: 'string', example: '#00FF00' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Task list updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task list updated successfully' },
                      data: { $ref: '#/components/schemas/TaskList' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Task list not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Task Lists'],
          summary: 'Delete task list',
          description: 'Delete a task list',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task list ID',
            },
          ],
          responses: {
            '200': {
              description: 'Task list deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
            '404': {
              description: 'Task list not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Get all tasks',
          description: 'Get all tasks with optional filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'taskListId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by task list ID',
            },
            {
              name: 'completed',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Filter by completion status',
            },
            {
              name: 'priority',
              in: 'query',
              schema: { type: 'string', enum: ['low', 'medium', 'high'] },
              description: 'Filter by priority',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search in title and description',
            },
          ],
          responses: {
            '200': {
              description: 'Tasks retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create task',
          description: 'Create a new task',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['taskListId', 'title'],
                  properties: {
                    taskListId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    title: { type: 'string', example: 'Complete project' },
                    description: { type: 'string', example: 'Finish the todo app' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
                    dueDate: { type: 'string', format: 'date', example: '2024-12-31' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['urgent', 'important'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Task created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task created successfully' },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get task by ID',
          description: 'Get a specific task',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID',
            },
          ],
          responses: {
            '200': {
              description: 'Task retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Task not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update task',
          description: 'Update a task',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated title' },
                    description: { type: 'string', example: 'Updated description' },
                    completed: { type: 'boolean', example: true },
                    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                    dueDate: { type: 'string', format: 'date' },
                    tags: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task updated successfully' },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Tasks'],
          summary: 'Toggle task completion',
          description: 'Toggle task completion status',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID',
            },
          ],
          responses: {
            '200': {
              description: 'Task toggled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Task toggled successfully' },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete task',
          description: 'Delete a task',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Task ID',
            },
          ],
          responses: {
            '200': {
              description: 'Task deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // No need for file scanning in serverless
};

export const swaggerSpec = swaggerJsdoc(options);

