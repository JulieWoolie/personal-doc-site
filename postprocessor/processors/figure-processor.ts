import { Document, Element } from "@b-fuze/deno-dom";

export function processFigures(document: Document, content: Element) {
  const captions = content.getElementsByTagName("figcaption")
  let num = 0
  let lookup: {[key: string]: string | undefined} = {}

  for (const capt of captions) {
    const prefix = document.createElement("span")
    prefix.setAttribute("latex-ignore", "")
    prefix.setAttribute("class", "figure-num")

    ++num

    let content = `Fig.${num}`
    if (capt.hasChildNodes()) {
      content += ` - `
    }
    prefix.textContent = content
    
    capt.insertBefore(prefix, capt.firstChild)

    const parent = capt.parentElement
    if (parent == null || parent.tagName != "FIGURE") {
      continue
    }

    parent.setAttribute("figure-number", `${num}`)
    let pid = parent.id
    if (pid == "") {
      parent.id = pid = `figure-${num}`
    }

    lookup[pid] = pid
    lookup[`${num}`] = pid
  }

  const references = content.getElementsByTagName("figref")
  for (const ref of references) {
    const refId = ref.getAttribute("fig") ?? ""
    if (refId == "") {
      continue
    }

    const pid = lookup[refId]
    if (pid == null) {
      continue
    }

    const a = document.createElement("a")
    a.setAttribute("href", `#${pid}`)
    a.setAttribute("class", "figref")
    a.setAttribute("latex-ignore", "")
    
    ref.before(a)
    ref.remove()
  }
}