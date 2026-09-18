// Where a scrolling window of `visible` rows should start so `selected` stays
// on screen, moving only as far as needed to reveal it.
export function fitWindow({
  start,
  selected,
  visible,
  total
}: {
  start: number
  selected: number
  visible: number
  total: number
}): number {
  if (visible >= total) return 0
  let next = start
  if (selected < next) next = selected
  else if (selected >= next + visible) next = selected - visible + 1
  return Math.max(0, Math.min(next, total - visible))
}
