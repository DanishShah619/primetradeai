import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

export const CreateTaskDto = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const UpdateTaskDto = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field required',
  });

export const ListTasksQuery = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type ListTasksQueryInput = z.infer<typeof ListTasksQuery>;
