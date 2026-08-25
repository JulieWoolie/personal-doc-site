import { Document, Element } from "@b-fuze/deno-dom";
import { CollectedHeader, createNumbersSpan } from "../common.ts";

export function processHeadings(doc: Document, headers: CollectedHeader[]) {
  for (const h of headers) {
    const el: Element = h.element

    const linkAnchor = doc.createElement("a")
    linkAnchor.setAttribute("href", `#${el.id}`)
    linkAnchor.setAttribute("class", "copy-header-ref")
    linkAnchor.textContent = "\uD83D\uDD17"

    el.appendChild(linkAnchor)

    el.innerHTML = `${createNumbersSpan(h.numbers)}${el.innerHTML}`
  }
}