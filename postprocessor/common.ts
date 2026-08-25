import { Document, Element } from "@b-fuze/deno-dom";

export interface CollectedHeader {
  element: Element
  level: number
  numbers: string[]
}

export function headerNumbersToString(nums: string[]): string {
  let s = ""
  for (const n of nums) {
    s += `${n}.`
  }
  return s
}

export function createNumbersSpan(nums: string[]): string {
  return `<span latex-ignore class="section-num">${headerNumbersToString(nums)}</span>`
}

export function makeId(content: string) {
  return content.toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(",", "")
    .replaceAll("'", "")
    .replaceAll("/", "")
    .replaceAll("\"", "")
}