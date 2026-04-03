/**
 * Message segmentation for chat bubbles: thinking blocks, fenced code, inline tool JSON.
 * Tool detection accepts OpenAI-style { name, arguments } and Newelle-style { tool, arguments }.
 */

/**
 * @param {unknown} parsed
 * @returns {{ name: string, arguments: object } | null}
 */
export function parseToolPayload(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const name = parsed.name ?? parsed.tool
  if (typeof name !== 'string' || !name.length) return null
  if (!('arguments' in parsed)) return null
  const args = parsed.arguments
  if (args !== null && typeof args !== 'object') return null
  return { name, arguments: args }
}

/**
 * Find index of matching `}` for `{` at start, respecting JSON strings.
 * @param {string} s
 * @param {number} start index of `{`
 */
export function findBalancedBraceEnd(s, start) {
  if (s[start] !== '{') return -1
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (inString) {
      if (escape) {
        escape = false
      } else if (c === '\\') {
        escape = true
      } else if (c === '"') {
        inString = false
      }
      continue
    }
    if (c === '"') {
      inString = true
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function mergeAdjacentText(parts) {
  const out = []
  for (const p of parts) {
    if (p.type === 'text' && out.length && out[out.length - 1].type === 'text') {
      out[out.length - 1].content += p.content
    } else {
      out.push({ ...p })
    }
  }
  return out.length ? out : [{ type: 'text', content: '' }]
}

/**
 * @param {string} text
 * @returns {Array<{type: string, content?: string, language?: string}>}
 */
export function parseInlineToolCalls(text) {
  const parts = []
  let i = 0
  while (i < text.length) {
    const braceStart = text.indexOf('{', i)
    if (braceStart === -1) {
      if (i < text.length) parts.push({ type: 'text', content: text.slice(i) })
      break
    }
    if (braceStart > i) {
      parts.push({ type: 'text', content: text.slice(i, braceStart) })
    }
    const braceEnd = findBalancedBraceEnd(text, braceStart)
    if (braceEnd === -1) {
      parts.push({ type: 'text', content: text.slice(braceStart) })
      break
    }
    const slice = text.slice(braceStart, braceEnd + 1)
    try {
      const parsed = JSON.parse(slice)
      const tool = parseToolPayload(parsed)
      if (tool) {
        parts.push({ type: 'tool', content: tool })
      } else {
        parts.push({ type: 'text', content: slice })
      }
    } catch {
      parts.push({ type: 'text', content: slice })
    }
    i = braceEnd + 1
  }
  return mergeAdjacentText(parts)
}

function parseInlineContent(text) {
  return parseInlineToolCalls(text)
}

function parseContent(text) {
  const parts = []
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIdx = 0
  let m

  while ((m = codeRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(...parseInlineContent(text.slice(lastIdx, m.index)))
    }
    parts.push({ type: 'code', language: m[1] || 'text', content: m[2] })
    lastIdx = m.index + m[0].length
  }

  if (lastIdx < text.length) {
    parts.push(...parseInlineContent(text.slice(lastIdx)))
  }

  return parts.length ? parts : [{ type: 'text', content: text }]
}

/**
 * Full message → segments (thinking, code, tool, text).
 * @param {string} text
 */
export function parseMessageSegments(text) {
  const parts = []
  const thinkRegex = /<think(?:ing)?>([\s\S]*?)(?:<\/think(?:ing)?>|$)/gi
  let lastIndex = 0
  let match
  const tempText = text

  while ((match = thinkRegex.exec(tempText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseContent(tempText.slice(lastIndex, match.index)))
    }
    parts.push({ type: 'thinking', content: match[1].trim() })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < tempText.length) {
    parts.push(...parseContent(tempText.slice(lastIndex)))
  }

  return parts.length ? parts : [{ type: 'text', content: text }]
}
