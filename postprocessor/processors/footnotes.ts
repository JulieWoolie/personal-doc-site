import { Document } from "@b-fuze/deno-dom";

interface Footnote {
  domId: string
  index: string
}

type FootnoteLookup = {[index: string]: Footnote | undefined}

export function processFootnotes(document: Document) {
  const footnoteList = document.getElementById("footnotes-list")
  if (footnoteList == null) {
    return
  }

  const noteItems = footnoteList.querySelectorAll("#footnotes-list > li")
  const lookup: FootnoteLookup = {}

  for (let i = 0; i < noteItems.length; i++) {
    const item = noteItems.item(i)
    let id = item.id

    if (id == "") {
      id = `footnote-${i}`
      item.id = id
    }

    lookup[`${i}`] = {
      domId: id,
      index: `${i}`
    }
  }

  const references = document.querySelectorAll("note[idx]")

  for (const ref of references) {
    const targetId = ref.getAttribute("idx") ?? ""

    if (targetId == "") {
      console.warn(`Failed to find footnote referenced by <note> index=${targetId}`)
      continue
    }

    const referenced = lookup[targetId]
    if (referenced == undefined) {
      console.warn(`Failed to find footnote referenced by <note> index=${targetId}`)
      continue
    }

    const a = document.createElement("a")
    a.setAttribute("href", `#${referenced.domId}`)
    a.setAttribute("class", "footnote-ref")
    a.textContent = `[${referenced.index}]`

    ref.replaceWith(a)
  }
}