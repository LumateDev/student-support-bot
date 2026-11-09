// Read-only DOM capture. Used by the browser export workflow, not by the app.
(() => {
  function textLines(node, style) {
    const range = document.createRange();
    const lines = [];
    let line;
    for (let index = 0; index < node.textContent.length; index++) {
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const char = node.textContent[index].replace(/\s/, ' ');
      if (!line || Math.abs(line.y - rect.top) > 2) {
        line = { x: rect.left, y: rect.top, text: char };
        lines.push(line);
      } else line.text += char;
    }
    return lines.filter(line => line.text.trim()).map(line => ({
      ...line, color: style.color, size: Number.parseFloat(style.fontSize),
      family: style.fontFamily, weight: style.fontWeight,
      spacing: style.letterSpacing === 'normal' ? 0 : Number.parseFloat(style.letterSpacing),
    }));
  }

  function visit(element) {
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return null;
    const rect = element.getBoundingClientRect();
    if (style.display === 'contents') {
      return {
        name: element.getAttribute('class') || element.tagName.toLowerCase(),
        x: 0, y: 0, width: 0, height: 0, background: 'transparent', radius: 0, opacity: 1,
        borders: Array.from({ length: 4 }, () => ({ width: 0, color: 'transparent' })),
        clip: false, text: [], children: [...element.children].map(visit).filter(Boolean),
      };
    }
    if (!rect.width || !rect.height) return null;
    const result = {
      name: element.getAttribute('aria-label') || element.id || element.getAttribute('class') || element.tagName.toLowerCase(),
      x: rect.left, y: rect.top, width: rect.width, height: rect.height,
      background: style.backgroundColor, radius: Number.parseFloat(style.borderTopLeftRadius) || 0,
      opacity: Number(style.opacity),
      borders: ['Top', 'Right', 'Bottom', 'Left'].map(side => ({
        width: Number.parseFloat(style[`border${side}Width`]), color: style[`border${side}Color`],
      })),
      clip: ['hidden', 'auto', 'scroll', 'clip'].includes(style.overflowY) || ['hidden', 'auto', 'scroll', 'clip'].includes(style.overflowX),
      children: [], text: [],
    };
    if (element.tagName.toLowerCase() === 'svg') {
      result.svg = element.outerHTML;
      result.color = style.color;
      return result;
    }
    if (element.tagName === "DIALOG" && element.open) {
      result.backdrop = getComputedStyle(element, '::backdrop').backgroundColor;
    }
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const placeholder = !element.value;
      const color = placeholder ? getComputedStyle(element, '::placeholder').color : style.color;
      const value = element.value || element.placeholder;
      const size = Number.parseFloat(style.fontSize);
      result.text = value.split('\n').map((text, index) => ({
        text, x: rect.left + Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.borderLeftWidth),
        y: rect.top + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.borderTopWidth) + index * Number.parseFloat(style.lineHeight),
        color, size, family: style.fontFamily, weight: style.fontWeight, spacing: 0,
      }));
    } else {
      for (const node of element.childNodes) {
        if (node.nodeType === 3 && node.textContent.trim()) result.text.push(...textLines(node, style));
        else if (node.nodeType === 1) {
          const child = visit(node);
          if (child) result.children.push(child);
        }
      }
    }
    return result;
  }

  return {
    width: innerWidth, height: innerHeight, title: document.title,
    background: getComputedStyle(document.body).backgroundColor,
    theme: document.documentElement.dataset.theme,
    root: visit(document.getElementById('app')),
  };
})()


