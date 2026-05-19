import { z } from 'zod';

// Define the enum inline — keeps the DTO layer independent of the Prisma client.
// Prisma's schema enum values must stay in sync with these strings.
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatusType = z.infer<typeof TaskStatusEnum>;

export const CreateTaskDto = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: TaskStatusEnum.optional(),
});

export const UpdateTaskDto = z
  .object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: TaskStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field required',
  });

export const ListTasksQuery = z.object({
  status: TaskStatusEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type ListTasksQueryInput = z.infer<typeof ListTasksQuery>;

