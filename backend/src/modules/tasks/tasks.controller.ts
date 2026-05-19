import { Request, Response, NextFunction } from 'express';
import * as tasksService from './tasks.service';
import { sendSuccess, sendCreated } from '../../utils/response';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tasks, meta } = await tasksService.listTasks(
      req.user!.id,
      req.user!.role,
      req.query as any,
    );
    sendSuccess(res, { data: tasks, meta });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.getTask(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, { data: task });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.createTask(req.user!.id, req.body);
    sendCreated(res, task);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksService.updateTask(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body,
    );
    sendSuccess(res, { data: task });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await tasksService.deleteTask(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, { data: { message: 'Task deleted' } });
  } catch (err) {
    next(err);
  }
};
