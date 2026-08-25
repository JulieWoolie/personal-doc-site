import { DOMParser, DOMParserMimeType, Element } from "@b-fuze/deno-dom"
import { CollectedHeader } from "./common.ts";
import { numberHeaders } from "./processors/header-numerator.ts";
import { giveHeadersIds } from "./processors/id-gen.ts";
import { processTableOfContents } from "./processors/table-of-contents.ts";
import { processHeadings } from "./processors/link-achors.ts";
import { processFigures } from "./processors/figure-processor.ts";
import { processChapterRefs } from "./processors/chapter-refs.ts";
import { processFootnotes } from "./processors/footnotes.ts";

function collectHeaders(content: Element): CollectedHeader[] {
  const headings = content.querySelectorAll(":is(h2, h3, h4, h5, h6)")
  const result: CollectedHeader[] = []

  for (const h of headings) {
    result.push({
      element: h,
      level: parseInt(h.tagName.substring(1)),
      numbers: []
    })
  }

  return result 
}

export function processHtml(htmlString: string, mimeType: string): string {
  if (!htmlString.includes(`id="content"`)) {
    return htmlString
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(htmlString, mimeType as DOMParserMimeType)

  const content: Element = document.getElementById("content")!
  const headings = collectHeaders(content)

  giveHeadersIds(headings)
  numberHeaders(document, headings)
  processTableOfContents(document, headings)

  processFigures(document, content)
  processChapterRefs(document, content, headings)

  processHeadings(document, headings)

  processFootnotes(document)

  return document.documentElement?.outerHTML ?? ""
}