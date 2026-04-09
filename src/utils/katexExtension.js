import katex from 'katex'

function renderKatex(latex, displayMode) {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      trust: true,
    })
  } catch {
    return displayMode
      ? `<span class="katex-error">$$${latex}$$</span>`
      : `<span class="katex-error">$${latex}$</span>`
  }
}

export const katexBlockExtension = {
  name: 'katexBlock',
  level: 'block',
  start(src) {
    return src.indexOf('$$')
  },
  tokenizer(src) {
    const match = /^\$\$([\s\S]+?)\$\$/.exec(src)
    if (match) {
      return {
        type: 'katexBlock',
        raw: match[0],
        latex: match[1],
      }
    }
  },
  renderer(token) {
    return renderKatex(token.latex, true)
  },
}

export const katexInlineExtension = {
  name: 'katexInline',
  level: 'inline',
  start(src) {
    return src.indexOf('$')
  },
  tokenizer(src) {
    const match = /^\$([^\$\n]+?)\$/.exec(src)
    if (match) {
      return {
        type: 'katexInline',
        raw: match[0],
        latex: match[1],
      }
    }
  },
  renderer(token) {
    return renderKatex(token.latex, false)
  },
}
