/**
 * Merge an SSE chunk into the streaming buffer.
 * Backends may send either token deltas or cumulative full text (e.g. full_message each tick).
 * If `chunk` starts with the current buffer, treat it as cumulative and replace; otherwise append.
 */
export function mergeStreamChunk(previous, chunk) {
  if (chunk == null || chunk === undefined) return previous
  const s = String(chunk)
  if (s === '') return previous
  if (previous !== '' && s.startsWith(previous) && s.length >= previous.length) {
    return s
  }
  return previous + s
}
