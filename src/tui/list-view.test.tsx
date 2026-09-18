import { describe, expect, spyOn, test } from 'bun:test'
import { Box } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'

import { ListRow, ListView, visibleRowCount } from './list-view'

const plain = (frame: string | undefined) => Bun.stripANSI(frame ?? '')

describe('visibleRowCount', () => {
  test('fits as many three-line rows as the panel has room for', () => {
    // 40 rows − 6 used outside the panel − 4 for its border and hint lines = 30 lines → 10 rows
    expect(visibleRowCount(40, 6)).toBe(10)
  })

  test('always shows at least one row, however short the terminal', () => {
    expect(visibleRowCount(5, 6)).toBe(1)
  })
})

describe('ListRow', () => {
  test('puts the title and meta on one line with the subtitle beneath', () => {
    const { lastFrame } = render(
      <ListRow
        selected={false}
        title="frontend-design"
        meta="899,291 installs"
        subtitle="anthropics/skills"
      />
    )
    const lines = plain(lastFrame()).split('\n')
    expect(lines[0]).toMatch(/frontend-design\s+899,291 installs/)
    expect(lines[1]).toContain('anthropics/skills')
  })

  test('marks the selected row with a pointer and leaves the others aligned', () => {
    const props = { title: 'frontend-design', meta: '1 installs', subtitle: 'anthropics/skills' }
    const selected = render(<ListRow selected {...props} />)
    const idle = render(<ListRow selected={false} {...props} />)
    expect(plain(selected.lastFrame()).split('\n')[0]).toMatch(/^❯ frontend-design/)
    expect(plain(idle.lastFrame()).split('\n')[0]).toMatch(/^ {2}frontend-design/)
  })

  test('truncates an overlong title instead of wrapping it onto the next line', () => {
    const { lastFrame } = render(
      <ListRow selected={false} title={'x'.repeat(300)} meta="5 installs" subtitle="owner/repo" />
    )
    const lines = plain(lastFrame()).split('\n')
    expect(lines[0]).toContain('5 installs')
    expect(lines[1]).toContain('owner/repo')
  })
})

describe('ListView', () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ id: `skill-${i}`, name: `skill-${i}` }))

  function view(props: Partial<React.ComponentProps<typeof ListView<(typeof items)[number]>>> = {}) {
    return (
      <ListView
        items={items}
        selectedIndex={0}
        windowStart={0}
        visibleCount={3}
        getKey={(item) => item.id}
        renderRow={(item, selected) => (
          <ListRow selected={selected} title={item.name} meta="1 installs" subtitle="owner/repo" />
        )}
        {...props}
      />
    )
  }

  test('draws the rows inside a rounded panel', () => {
    const lines = plain(render(view()).lastFrame()).split('\n')
    expect(lines[0]).toMatch(/^╭─+╮$/)
    expect(lines[lines.length - 1]).toMatch(/^╰─+╯$/)
    for (const line of lines.slice(1, -1)) expect(line).toMatch(/^│.*│$/)
  })

  test('renders only the rows inside the window', () => {
    const frame = plain(render(view()).lastFrame())
    expect(frame).toContain('skill-0')
    expect(frame).toContain('skill-2')
    expect(frame).not.toContain('skill-3')
  })

  test('says how many rows are hidden below and where the selection is', () => {
    const lines = plain(render(view()).lastFrame()).split('\n')
    const status = lines[lines.length - 2]
    expect(status).toMatch(/↓ 7 more\s+1\/10/)
    expect(lines.join('\n')).not.toContain('↑')
  })

  test('says how many rows are hidden on both sides once scrolled', () => {
    const frame = plain(render(view({ windowStart: 4, selectedIndex: 4 })).lastFrame())
    expect(frame).toContain('skill-4')
    expect(frame).toContain('skill-6')
    expect(frame).not.toContain('skill-3')
    expect(frame).not.toContain('skill-7')
    expect(frame).toContain('↑ 4 more')
    expect(frame).toMatch(/↓ 3 more\s+5\/10/)
  })

  test('pins the overflow line to the bottom edge when the panel is taller than its rows', () => {
    const lines = plain(render(<Box height={20}>{view()}</Box>).lastFrame()).split('\n')
    expect(lines).toHaveLength(20)
    expect(lines[lines.length - 1]).toMatch(/^╰─+╯$/)
    expect(lines[lines.length - 2]).toMatch(/↓ 7 more\s+1\/10/)
  })

  test('keeps the same height wherever the window sits, so the layout never jumps', () => {
    const height = (windowStart: number) =>
      plain(render(view({ windowStart, selectedIndex: windowStart })).lastFrame()).split('\n').length
    expect(height(4)).toBe(height(0))
    expect(height(7)).toBe(height(0))
  })

  test('points at the selected row only', () => {
    const lines = plain(render(view({ selectedIndex: 1 })).lastFrame()).split('\n')
    expect(lines.find((l) => l.includes('skill-1'))).toMatch(/^│ ❯ /)
    expect(lines.find((l) => l.includes('skill-0'))).not.toMatch(/^│ ❯ /)
  })

  test('does not warn about duplicate keys when the same skill is listed twice', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {})
    try {
      const twice = [items[0]!, items[0]!]
      render(view({ items: twice }))
      const warned = errorSpy.mock.calls.some((args) => String(args[0]).includes('same key'))
      expect(warned).toBe(false)
    } finally {
      errorSpy.mockRestore()
    }
  })
})
