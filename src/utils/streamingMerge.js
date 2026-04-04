/**
 * Merge an SSE chunk into the streaming buffer.
 * The SSE endpoint always sends true deltas (computed server-side
 * from the LLM handlers' cumulative text), so we always append.
 */
export function mergeStreamChunk(previous, chunk) {
  if (chunk == null || chunk === undefined) return previous
  const s = String(chunk)
  if (s === '') return previous
  return previous + s
}
