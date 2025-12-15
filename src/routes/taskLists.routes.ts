import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAllTaskLists,
  getTaskListById,
  createTaskList,
  updateTaskList,
  deleteTaskList,
} from '../controllers/taskList.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/task-lists:
 *   get:
 *     summary: Get all task lists for the authenticated user
 *     tags: [Task Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of task lists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskList'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllTaskLists);

/**
 * @swagger
 * /api/task-lists/{id}:
 *   get:
 *     summary: Get a task list by ID
 *     tags: [Task Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task list ID
 *     responses:
 *       200:
 *         description: Task list details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TaskList'
 *       404:
 *         description: Task list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getTaskListById);

/**
 * @swagger
 * /api/task-lists:
 *   post:
 *     summary: Create a new task list
 *     tags: [Task Lists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Work Tasks
 *               description:
 *                 type: string
 *                 example: Tasks related to work
 *               color:
 *                 type: string
 *                 format: hex
 *                 example: "#FF5733"
 *     responses:
 *       201:
 *         description: Task list created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task list created successfully
 *                 data:
 *                   $ref: '#/components/schemas/TaskList'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createTaskList);

/**
 * @swagger
 * /api/task-lists/{id}:
 *   put:
 *     summary: Update a task list
 *     tags: [Task Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task list ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Work Tasks
 *               description:
 *                 type: string
 *                 example: Updated description
 *               color:
 *                 type: string
 *                 format: hex
 *                 example: "#33FF57"
 *     responses:
 *       200:
 *         description: Task list updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task list updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/TaskList'
 *       404:
 *         description: Task list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateTaskList);

/**
 * @swagger
 * /api/task-lists/{id}:
 *   delete:
 *     summary: Delete a task list
 *     tags: [Task Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task list ID
 *     responses:
 *       200:
 *         description: Task list deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Task list deleted successfully
 *       404:
 *         description: Task list not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteTaskList);

export default router;

