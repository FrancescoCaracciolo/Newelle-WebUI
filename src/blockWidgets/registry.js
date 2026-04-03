/**
 * Extensible registry: map fenced code blocks (language + body) to Vue components.
 * Higher priority wins. Register additional widgets from blockWidgets/index.js.
 */

/** @type {Array<{ id: string, priority: number, match: (lang: string, code: string) => boolean, component: object }>} */
const widgets = []

/**
 * @param {{ id: string, priority?: number, match: (lang: string, code: string) => boolean, component: object }} def
 */
export function registerBlockWidget(def) {
  const { id, priority = 0, match, component } = def
  widgets.push({ id, priority, match, component })
  widgets.sort((a, b) => b.priority - a.priority)
}

/**
 * @param {string} language fence info string (markdown lang tag)
 * @param {string} code raw block body
 * @returns {{ id: string, component: object } | null}
 */
export function resolveBlockWidget(language, code) {
  const lang = (language || 'text').toLowerCase()
  for (const w of widgets) {
    try {
      if (w.match(lang, code)) {
        return { id: w.id, component: w.component }
      }
    } catch {
      /* ignore matcher errors */
    }
  }
  return null
}
