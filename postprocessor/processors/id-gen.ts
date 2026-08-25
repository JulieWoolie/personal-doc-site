import { Element } from "@b-fuze/deno-dom";
import { CollectedHeader, makeId } from "../common.ts";

type UsedIdMap = {[id: string]: number | undefined}

export function giveHeadersIds(headers: CollectedHeader[]) {
  const map: UsedIdMap = {}

  for (const h of headers) {
    const el: Element = h.element
    let id: string = el.id

    if (id == "") {
      id = makeId(el.textContent)
      el.id = id
    }

    const uses: number | undefined = map[id]
    if (uses == undefined) {
      map[id] = 1
    } else {
      map[id] = uses + 1
      id = `${uses}-${id}`
    }
  }
}