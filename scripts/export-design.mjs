import fs from 'node:fs'
import path from 'node:path'
import * as sass from 'sass'
import postcss from 'postcss'

const directory = path.resolve('docs/design')
const source = path.join(directory, 'source')
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const round = value => Math.round(value * 100) / 100
const transparent = color => !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)'

function artwork(data) {
  let id = 0
  const defs = []
  const fontFile = path.join(directory, 'fonts/GolosText-Variable.ttf')
  if (fs.existsSync(fontFile)) {
    const font = fs.readFileSync(fontFile).toString('base64')
    defs.push(`<style>@font-face{font-family:'Golos Text';src:url(data:font/ttf;base64,${font}) format('truetype');font-weight:400 900;font-style:normal}</style>`)
  }
  function shape(node) {
    const x = round(node.x), y = round(node.y), width = round(node.width), height = round(node.height)
    if (node.svg) {
      return node.svg.replace(/<svg\b[^>]*>/, opening => {
        let root = opening.replace(/\s(?:width|height|x|y|style|color)="[^"]*"/g, '')
        return root.replace('>', ` x="${x}" y="${y}" width="${width}" height="${height}" color="${escape(node.color)}">`)
      })
    }
    const label = escape(node.name)
    // SVG rect has a single radius. Bubbles preserve the key rounded treatment.
    if (node.name.includes('welcome-bubble') || node.name.includes('message-bubble')) node.radius = 11
    let output = ''
    if (node.backdrop && !transparent(node.backdrop)) output += `<rect x="0" y="0" width="${data.width}" height="${data.height}" fill="${node.backdrop}"/>`
    const groupName = node.name.replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 64)
    output += `<g id="${escape(groupName)}-${++id}" data-name="${label}"${node.opacity !== 1 ? ` opacity="${node.opacity}"` : ''}><title>${label}</title>`
    if (!transparent(node.background)) output += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.radius}" fill="${node.background}"/>`
    const [top, right, bottom, left] = node.borders
    if (top.width && node.borders.every(border => border.width === top.width && border.color === top.color)) {
      output += `<rect x="${x + top.width / 2}" y="${y + top.width / 2}" width="${Math.max(0, width - top.width)}" height="${Math.max(0, height - top.width)}" rx="${node.radius}" fill="none" stroke="${top.color}" stroke-width="${top.width}"/>`
    } else {
      for (const [border, x1, y1, x2, y2] of [[top, x, y, x + width, y], [right, x + width, y, x + width, y + height], [bottom, x, y + height, x + width, y + height], [left, x, y, x, y + height]]) {
        if (border.width) output += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${border.color}" stroke-width="${border.width}"/>`
      }
    }
    if (node.clip) {
      const clip = `clip-${id}`
      defs.push(`<clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.radius}"/></clipPath>`)
      output += `<g clip-path="url(#${clip})">`
    }
    const text = node.name === 'ticket-problem' ? node.text.flatMap(line => {
      const limit = Math.floor((node.width - 28) / (line.size * .54))
      const lines = []
      let current = ''
      for (const word of line.text.split(' ')) {
        if (current && `${current} ${word}`.length > limit) { lines.push(current); current = word }
        else current += (current ? ' ' : '') + word
      }
      lines.push(current)
      return lines.map((value, index) => ({ ...line, text: value, y: line.y + index * line.size * 1.7 }))
    }) : node.text
    for (const line of text) {
      output += `<text x="${round(line.x)}" y="${round(line.y + line.size * .85)}" fill="${escape(line.color)}" font-family="${escape(line.family)}" font-size="${line.size}" font-weight="${line.weight}" letter-spacing="${line.spacing}" xml:space="preserve">${escape(line.text)}</text>`
    }
    for (const child of node.children) output += shape(child)
    if (node.clip) output += '</g>'
    return output + '</g>'
  }
  const content = shape(data.root)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${data.width}" height="${data.height}" viewBox="0 0 ${data.width} ${data.height}"><title>${escape(data.title)} — ${data.theme}</title><desc>Editable vector artwork exported from the implemented Vue interface. Text, panels and Lucide icons are native SVG elements; no raster images or foreignObject.</desc><defs>${defs.join('')}</defs><rect width="100%" height="100%" fill="${data.background}"/>${content}</svg>`
}

const files = fs.readdirSync(source).filter(name => name.endsWith('.json')).sort()
function showLatestReply(node) {
  if (node.name === 'Переписка с помощником' && node.children.length) {
    const lastBottom = Math.max(...node.children.map(child => child.y + child.height))
    const offset = Math.max(0, lastBottom - (node.y + node.height - 18))
    function shift(child) {
      child.y -= offset
      for (const line of child.text ?? []) line.y -= offset
      for (const nested of child.children ?? []) shift(nested)
    }
    for (const child of node.children) shift(child)
  } else for (const child of node.children ?? []) showLatestReply(child)
}
const screens = files.map(name => {
  const data = JSON.parse(fs.readFileSync(path.join(source, name), 'utf8'))
  if (name.startsWith('03-') || name.startsWith('04-')) showLatestReply(data.root)
  const filename = name.replace('.json', '.svg')
  fs.writeFileSync(path.join(directory, filename), artwork(data))
  return { filename, title: name.replace('.json', ''), width: data.width, height: data.height, theme: data.theme }
})
const copy = {}
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(source, file), 'utf8'))
  const content = new Set()
  function collect(node) {
    for (const line of node.text ?? []) if (line.text.trim()) content.add(line.text.trim())
    for (const child of node.children ?? []) collect(child)
  }
  collect(data.root)
  copy[file.replace('.json', '')] = [...content]
}
fs.writeFileSync(path.join(directory, 'copy.json'), JSON.stringify(copy, null, 2))

const palettes = {}
const css = postcss.parse(sass.compile('src/styles/themes.scss').css)
css.walkRules(rule => {
  const name = rule.selector === ':root' ? 'light' : rule.selector === ':root[data-theme=dark]' || rule.selector === ':root[data-theme="dark"]' ? 'dark' : undefined
  if (!name) return
  const values = {}
  rule.walkDecls(decl => { if (decl.prop.startsWith('--color-')) values[decl.prop.slice(8)] = decl.value })
  palettes[name] = values
})
fs.writeFileSync(path.join(directory, 'tokens.json'), JSON.stringify({ palettes, fontFamily: 'Golos Text', icons: '@lucide/vue', screens }, null, 2))
const tokens = Object.keys(palettes.light)
function compactColor(value) {
  const rgba = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  return rgba ? '#' + [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Math.round(Number(rgba[4]) * 255)].map(n => n.toString(16).padStart(2, '0')).join('') : value
}
let swatches = '<rect width="1366" height="1120" fill="#f5f6f8"/><text x="48" y="62" font-family="Segoe UI,sans-serif" font-size="30" fill="#24262c">Палитры интерфейса</text>'
for (const [column, theme] of ['light', 'dark'].entries()) {
  const start = 48 + column * 650
  swatches += `<text x="${start}" y="110" font-family="Segoe UI,sans-serif" font-size="20" fill="#24262c">${theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</text>`
  tokens.forEach((token, index) => {
    const y = 134 + index * 42
    const value = compactColor(palettes[theme]?.[token] ?? '')
    swatches += `<rect x="${start}" y="${y}" width="42" height="28" rx="5" fill="${value}" stroke="#ced2d8"/><text x="${start + 56}" y="${y + 19}" font-family="Consolas,monospace" font-size="15" fill="#24262c">${escape(token)}</text><text x="${start + 360}" y="${y + 19}" font-family="Consolas,monospace" font-size="14" fill="#68707a">${escape(value)}</text>`
  })
}
fs.writeFileSync(path.join(directory, '09-palettes.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1366" height="1120" viewBox="0 0 1366 1120">${swatches}</svg>`)
const gallery = screens.map(screen => `<section><h2>${screen.filename}</h2><p>${screen.width} × ${screen.height} · ${screen.theme}</p><a href="${screen.filename}" download>Скачать SVG</a><img src="${screen.filename}" alt="${screen.title}" class="${screen.width < 700 ? 'mobile' : 'desktop'}"></section>`).join('')
fs.writeFileSync(path.join(directory, 'index.html'), `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Макеты для дизайнера — поддержка учебного портала</title><style>body{font:15px/1.6 'Segoe UI',sans-serif;background:#eef0f3;color:#22252b;max-width:1400px;padding:32px;margin:auto}h1{font-size:32px;margin:0}header{margin-bottom:36px}h2{font-size:18px}section{margin-bottom:38px}p{color:#68707a}a{color:#27694e}img{display:block;width:100%;height:auto;border:1px solid #d9dee4;border-radius:12px;background:white;margin-top:14px}img.mobile{max-width:390px}</style><header><h1>Чат-бот поддержки учебного портала</h1><p>Векторные экраны по текущей реализации. Перетащите SVG-файлы на холст Figma. Палитры и правила находятся в README.md и tokens.json.</p></header>${gallery}<section><h2>Палитры</h2><img src="09-palettes.svg" alt="Палитры двух тем"></section></html>`)
console.log(`Exported ${screens.length} editable SVG screens and palette board to ${directory}`)
