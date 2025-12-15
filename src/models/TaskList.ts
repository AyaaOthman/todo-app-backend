import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskList extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskListSchema = new Schema<ITaskList>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Task list name is required'],
      trim: true,
      maxlength: [100, 'Task list name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
taskListSchema.index({ userId: 1, createdAt: -1 });

export const TaskList = mongoose.model<ITaskList>('TaskList', taskListSchema);

