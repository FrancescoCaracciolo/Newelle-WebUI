import { registerBlockWidget } from './registry'
import JsonToolFence from './builtins/JsonToolFence.vue'
import { parseToolPayload } from '../utils/messageParsing'

export { registerBlockWidget, resolveBlockWidget } from './registry'

/**
 * JSON fences that encode a tool invocation render as ToolCallBlock; otherwise fall back to a normal code block.
 * Register more widgets from your own module: import { registerBlockWidget } from '@/blockWidgets/registry'
 */
registerBlockWidget({
  id: 'json-tool-fence',
  priority: 20,
  match(lang, code) {
    const l = (lang || '').toLowerCase()
    if (l !== 'json' && l !== '') return false
    try {
      const parsed = JSON.parse(code.trim())
      return parseToolPayload(parsed) !== null
    } catch {
      return false
    }
  },
  component: JsonToolFence,
})
