processTableOfContents()
processFootnotes()
processFigures()

function processFigures() {
  let content = document.getElementById("content")
  if (content == null) {
    return
  }

  let figcaptions = content.getElementsByTagName("figcaption")

  for (let i = 0; i < figcaptions.length; i++) {
    let capt = figcaptions.item(i)

    let prefix = document.createElement("span")
    prefix.setAttribute("latex-ignore", "")
    prefix.textContent = `Fig.${i + 1} - `

    capt.insertBefore(prefix, capt.firstChild)
  }
}

function processTableOfContents() {
  let content = document.getElementById("content")
  let tocOut = document.getElementById("toc-out")

  if (content == null) {
    return
  }

  const headerLevels = {
    'H1': 1,
    'H2': 2,
    'H3': 3,
    'H4': 4,
    'H5': 5,
    'H6': 6
  }

  let contentChildren = content.childNodes
  contentChildren.forEach(c => {
    if (c.nodeType == Node.TEXT_NODE || c.hasAttribute("toc-ignore")) {
      return
    }

    let level = headerLevels[c.tagName]
    if (level == undefined) {
      return
    }

    if (level < 2) {
      return
    }

    let txt = encodeURIComponent(c.textContent.toLowerCase())
    c.id = txt

    let a = document.createElement("a")
    if (level != 2) {
      a.style.paddingLeft = `${level - 2}em`
    }
    a.classList.add("toc-element")
    a.innerHTML = c.innerHTML
    a.href = `#${txt}`

    tocOut.appendChild(a)
  })
}

function processFootnotes() {
  let footnotesOl = document.getElementById("footnotes-list")
  let notes = document.querySelectorAll("note[idx]")

  if (footnotesOl == null) {
    return
  }

  let idxOrder = []
  let processedNotes = []
  
  function getNoteIndex(el) {
    if (!el.hasAttribute("idx")) {
      return undefined
    }
    return parseInt(el.getAttribute("idx"))
  }

  for (let i = 0; i < notes.length; i++) {
    let note = notes.item(i)
    let idx = getNoteIndex(note)

    if (!idxOrder.includes(idx)) {
      idxOrder.push(idx)
    }

    let replacement = document.createElement("sup")
    let a = document.createElement("a")

    replacement.classList.add("footnote-ref")
    a.href = `#footnote-${idx}`
    a.textContent = "AAAAA"

    replacement.appendChild(a)
    replacement.setAttribute("footnote-idx", idx.toString())

    let p = note.parentElement

    p.insertBefore(replacement, note)
    p.removeChild(note)

    processedNotes.push({
      index: idx,
      hrefEl: a
    })
  }

  let newOrder = []
  footnotesOl.childNodes.forEach(c => {
    if (c.nodeType == Node.TEXT_NODE) {
      return
    }
    if (!c.hasAttribute("note-idx")) {
      return
    }

    let noteIdx = parseInt(c.getAttribute("note-idx"))
    newOrder.push({
      noteIndex: noteIdx,
      li: c
    })
  })

  newOrder.sort((a, b) => {
    let aIdx = a.noteIndex
    let bIdx = b.noteIndex

    let aFoundIdx = idxOrder.indexOf(aIdx)
    let bFoundIdx = idxOrder.indexOf(bIdx)

    if (aFoundIdx == -1) {
      return -1
    } else if (bFoundIdx == -1) {
      return 1
    }

    return aFoundIdx - bFoundIdx
  })

  newOrder.forEach((o, arrIdx) => {
    o.displayIndex = arrIdx + 1
    let li = o.li
    li.id = `footnote-${o.displayIndex}`
    footnotesOl.appendChild(li)
  })

  processedNotes.forEach(o => {
    let matchingNote = newOrder.find(val => val.noteIndex == o.index)
    if (matchingNote == null) {
      o.hrefEl.parentElement.parentElement.removeChild(o.hrefEl)
      return
    }

    o.hrefEl.textContent = `[${matchingNote.displayIndex}]`
    o.hrefEl.href = `#footnote-${matchingNote.displayIndex}`
  })
}