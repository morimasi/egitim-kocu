import { describe, it, expect } from 'vitest'
import { assignmentCreateSchema, messageSendSchema } from '@/lib/validation'

describe('validation schemas', () => {
  it('validates assignment create', () => {
    const ok = assignmentCreateSchema.safeParse({
      title: 'Test',
      studentId: '00000000-0000-0000-0000-000000000000',
      dueDate: new Date().toISOString(),
      priority: 'medium',
      maxScore: 100
    })
    expect(ok.success).toBe(true)
  })

  it('rejects short message', () => {
    const bad = messageSendSchema.safeParse({ toUserId: '00000000-0000-0000-0000-000000000000', content: 'a' })
    expect(bad.success).toBe(false)
  })
})


