import { Document, Element } from "@b-fuze/deno-dom";
import { CollectedHeader, headerNumbersToString } from "../common.ts";

function findReferenced(headers: CollectedHeader[], id: string): CollectedHeader | null {
  for (const h of headers) {
    if (h.element.id != id) {
      continue
    }
    return h
  }
  return null
}

export function processChapterRefs(document: Document, content: Element, headers: CollectedHeader[]) {
  const references = content.getElementsByTagName("chapter-ref")

  for (const ref of references) {
    const targetId = ref.getAttribute("target") ?? ""
    const target = findReferenced(headers, targetId)

    if (target == null) {
      console.warn(`Couldn't find chapter referenced by <chapter-ref> with target "${targetId}"`)
      continue
    }

    const a = document.createElement("a")
    a.setAttribute("href", `#${target.element.id}`)
    a.innerHTML = `${headerNumbersToString(target.numbers)} ${target.element.innerHTML}`

    ref.before(a)
    ref.remove()
  }
}