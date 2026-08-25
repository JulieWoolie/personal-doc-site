import { Document } from "@b-fuze/deno-dom";
import { CollectedHeader } from "../common.ts";

export function numberHeaders(doc: Document, headers: CollectedHeader[]) {
  let numbers: number[] = []
  let currentLevel = -1

  let usingArabic = doc.head.querySelector(`meta[name="chapter-numbering"][content="arabic"]`) != null

  for (const h of headers) {
    let level = h.level
    level--

    if (level == currentLevel) {
      numbers[numbers.length - 1]++
    } else if (level < currentLevel) {
      const dif = currentLevel - level
      for (let i = 0; i < dif; i++) {
        numbers.pop()
        numbers[numbers.length - 1]++
      }
    } else {
      numbers.push(1)
    }

    currentLevel = level

    if (usingArabic) {
      h.numbers = numbers.map(i => i.toString())
    } else {
      h.numbers = numbers.map(i => toRoman(i))
    }
  }
}

function toRoman(number: number): string {
  if (isNaN(number)) {
    return "NaN"
  }
  if (number === 0) {
    return "0"
  }
  if (number < 0) {
    return `-${toRoman(-number)}`
  }

  const key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
      "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
      "","I","II","III","IV","V","VI","VII","VIII","IX"]

  const digits: string[] = String(number).split("")
  let roman = ""
  let i = 3;

  while (i--) {
    roman = (key[(parseInt(digits.pop() ?? "")) + (i * 10)] || "") + roman
  }

  return Array(+digits.join("") + 1).join("M") + roman;
}