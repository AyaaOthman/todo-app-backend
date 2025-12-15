import mongoose, { Document, Schema } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  taskListId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    taskListId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskList',
      required: [true, 'Task list ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: 'Cannot have more than 10 tags',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
taskSchema.index({ taskListId: 1, createdAt: -1 });
taskSchema.index({ taskListId: 1, completed: 1 });
taskSchema.index({ taskListId: 1, priority: 1 });
taskSchema.index({ taskListId: 1, dueDate: 1 });
taskSchema.index({ tags: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);

