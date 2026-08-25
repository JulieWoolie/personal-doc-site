import { Document } from "@b-fuze/deno-dom";
import { CollectedHeader, createNumbersSpan } from "../common.ts";

export function processTableOfContents(doc: Document, headers: CollectedHeader[]) {
  const tocEl = doc.getElementById("toc-out")
  if (!tocEl) {
    return
  }

  for (const h of headers) {
    let a = doc.createElement("a")

    a.setAttribute("href", `#${h.element.id}`)
    a.setAttribute("class", "toc-element")
    a.setAttribute("latex-ignore", "")

    if (h.level > 2) {
      const leftPad = (h.level - 2) * 3
      a.setAttribute("style", `padding-left: ${leftPad}mm;`)
    }

    a.innerHTML = `${createNumbersSpan(h.numbers)}${h.element.innerHTML.replaceAll(/id="[^"]*"/gi, "")}`

    tocEl.appendChild(a)
  }
}