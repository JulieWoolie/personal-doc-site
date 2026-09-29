import { Document, Element } from "@b-fuze/deno-dom";

interface Table {
  tableElement: Element
  caption: string
}

export function processTables(document: Document, content: Element) {
  const tables = content.getElementsByTagName("table")
  let tableNumCounter = 0

  const tableMap: {[tableId: string]: Table} = {}

  for (const t of tables) {
    const captions = t.getElementsByTagName("caption")
    if (captions.length != 1) {
      continue
    }

    const cap = captions[0]
    let tableId = ""

    tableNumCounter++

    cap.textContent = `Table ${tableNumCounter} - ${cap.textContent}`
    
    if (t.id == "") {
      tableId = `table-${tableNumCounter}`
      t.id = tableId
    } else {
      tableId = t.id
    }

    tableMap[tableId] = {
      tableElement: t,
      caption: cap.textContent
    }
  }

  const refs = content.getElementsByTagName("table-ref")
  for (const ref of refs) {
    const refId = ref.getAttribute("target")
    if (!refId) {
      console.warn(`Failed to find referenced table for ${ref} target=null`)
      continue
    }

    const targetted = tableMap[refId]
    if (targetted == undefined) {
      console.warn(`Failed to find referenced table for ${ref} target=${refId}`)
      continue
    }

    const a = document.createElement("a")
    a.setAttribute("href", `#${refId}`)
    a.textContent = targetted.caption

    ref.replaceWith(a)
  }
}