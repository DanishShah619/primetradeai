import { prisma } from '../../prisma';
import { ApiError } from '../../utils/ApiError';
import { Role } from '@prisma/client';
import type { CreateTaskInput, UpdateTaskInput, ListTasksQueryInput } from './tasks.dto';

export async function listTasks(
  userId: string,
  role: Role,
  query: ListTasksQueryInput,
) {
  const { status, page, limit } = query;
  const where = {
    // Admin sees all tasks; regular user sees only their own
    ...(role !== Role.ADMIN && { userId }),
    ...(status && { status }),
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTask(id: string, userId: string, role: Role) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound('Task not found');
  if (role !== Role.ADMIN && task.userId !== userId) throw ApiError.forbidden();
  return task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({ data: { ...input, userId } });
}

export async function updateTask(
  id: string,
  userId: string,
  role: Role,
  input: UpdateTaskInput,
) {
  await getTask(id, userId, role); // ownership/existence check
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(id: string, userId: string, role: Role) {
  await getTask(id, userId, role);
  await prisma.task.delete({ where: { id } });
}
