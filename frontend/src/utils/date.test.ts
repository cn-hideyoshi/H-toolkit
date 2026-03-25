import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('date presets', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-25T12:00:00'))
    vi.resetModules()
  })

  it('returns the expected last 7 and last 30 day ranges', async () => {
    const { LAST_7_DAYS, LAST_30_DAYS } = await import('./date')

    expect(LAST_7_DAYS).toEqual(['2026-03-18', '2026-03-24'])
    expect(LAST_30_DAYS).toEqual(['2026-02-23', '2026-03-24'])
  })
})
