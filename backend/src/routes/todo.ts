import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const todoCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().nullable(),
});

const todoUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  isCompleted: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional().nullable(),
});

// GET all todos for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(todos);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST create a todo
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const data = todoCreateSchema.parse(req.body);

    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });

    return res.status(201).json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT update a todo
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const data = todoUpdateSchema.parse(req.body);

    const existingTodo = await prisma.todo.findUnique({ where: { id } });
    if (!existingTodo || existingTodo.userId !== userId) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        isCompleted: data.isCompleted,
        priority: data.priority,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
    });

    return res.json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE a todo
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;

    const existingTodo = await prisma.todo.findUnique({ where: { id } });
    if (!existingTodo || existingTodo.userId !== userId) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await prisma.todo.delete({ where: { id } });

    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
});

export default router;
