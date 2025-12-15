import { Response, NextFunction } from 'express';
import { TaskList } from '../models/TaskList';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/errorHandler';

export const getAllTaskLists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskLists = await TaskList.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: taskLists.length,
      data: taskLists,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskListById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskList = await TaskList.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task list not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: taskList,
    });
  } catch (error) {
    next(error);
  }
};

export const createTaskList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      const error: ApiError = new Error('Task list name is required');
      error.statusCode = 400;
      throw error;
    }

    const taskList = new TaskList({
      userId: req.userId,
      name,
      description,
      color,
    });

    await taskList.save();

    res.status(201).json({
      success: true,
      message: 'Task list created successfully',
      data: taskList,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    const taskList = await TaskList.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, color },
      { new: true, runValidators: true }
    );

    if (!taskList) {
      const error: ApiError = new Error('Task list not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Task list updated successfully',
      data: taskList,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskList = await TaskList.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!taskList) {
      const error: ApiError = new Error('Task list not found');
      error.statusCode = 404;
      throw error;
    }

    // Also delete all tasks in this list
    const { Task } = await import('../models/Task');
    await Task.deleteMany({ taskListId: req.params.id });

    res.json({
      success: true,
      message: 'Task list deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

