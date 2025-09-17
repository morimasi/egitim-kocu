import { describe, it, expect } from 'vitest'
import { startOfDayIso, endOfDayIso } from '@/lib/utils'

describe('date utils', () => {
  it('produces start and end of day iso', () => {
    const d = new Date('2024-01-02T15:30:00.000Z')
    const start = new Date(startOfDayIso(d))
    const end = new Date(endOfDayIso(d))
    expect(start.getUTCHours()).toBe(0)
    expect(start.getUTCMinutes()).toBe(0)
    expect(end.getUTCHours()).toBe(23)
    expect(end.getUTCMinutes()).toBe(59)
  })
})


