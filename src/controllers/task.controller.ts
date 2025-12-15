import { Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task';
import { TaskList } from '../models/TaskList';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/errorHandler';

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      taskListId,
      completed,
      priority,
      tags,
      dueDate,
      search,
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by task list (must belong to user's task lists)
    if (taskListId) {
      // Verify task list belongs to user
      const taskList = await TaskList.findOne({
        _id: taskListId,
        userId: req.userId,
      });

      if (!taskList) {
        const error: ApiError = new Error('Task list not found');
        error.statusCode = 404;
        throw error;
      }

      query.taskListId = taskListId;
    } else {
      // If no taskListId specified, get all task lists for user and filter tasks
      const userTaskLists = await TaskList.find({ userId: req.userId });
      const taskListIds = userTaskLists.map((tl) => tl._id);
      query.taskListId = { $in: taskListIds };
    }

    // Filter by completion status
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by tags
    if (tags) {
      const tagString = Array.isArray(tags) ? tags.join(',') : (tags as string);
      const tagArray = tagString.split(',').map((tag: string) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by due date
    if (dueDate) {
      const date = new Date(dueDate as string);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Text search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify task list belongs to user
    const taskList = await TaskList.findOne({
      _id: task.taskListId,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { taskListId, title, description, priority, dueDate, tags } = req.body;

    if (!taskListId || !title) {
      const error: ApiError = new Error('Task list ID and title are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify task list belongs to user
    const taskList = await TaskList.findOne({
      _id: taskListId,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task list not found');
      error.statusCode = 404;
      throw error;
    }

    const task = new Task({
      taskListId,
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, completed, priority, dueDate, tags } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify task list belongs to user
    const taskList = await TaskList.findOne({
      _id: task.taskListId,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify task list belongs to user
    const taskList = await TaskList.findOne({
      _id: task.taskListId,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    task.completed = !task.completed;
    await task.save();

    res.json({
      success: true,
      message: `Task ${task.completed ? 'completed' : 'uncompleted'}`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify task list belongs to user
    const taskList = await TaskList.findOne({
      _id: task.taskListId,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

