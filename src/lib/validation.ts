import { z } from 'zod'

export const assignmentCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().nullable(),
  subject: z.string().max(100).optional().nullable(),
  studentId: z.string().uuid(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedDuration: z.number().int().min(1).max(1440).optional().nullable(),
  instructions: z.string().max(5000).optional().nullable(),
  maxScore: z.number().int().min(1).max(1000)
})

export const assignmentUpdateSchema = assignmentCreateSchema.partial().extend({
  id: z.string().uuid()
})

export const reviewCreateSchema = z.object({
  assignmentId: z.string().uuid(),
  submissionId: z.string().uuid(),
  score: z.number().int().min(0).max(1000).optional().nullable(),
  feedback: z.string().max(5000).optional().nullable(),
  suggestions: z.string().max(5000).optional().nullable(),
  isFinal: z.boolean().default(true)
})

export const messageSendSchema = z.object({
  toUserId: z.string().uuid(),
  content: z.string().min(2).max(5000)
})


