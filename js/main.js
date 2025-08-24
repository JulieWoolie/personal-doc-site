const headerLevels = {
  'H1': 1,
  'H2': 2,
  'H3': 3,
  'H4': 4,
  'H5': 5,
  'H6': 6
}

numberHeaders()
processTableOfContents()
processFootnotes()
processFigures()
processFigureRefs()

scrollToTaggedElement()

// Yeah, sometimes the # in the URL doesn't work, because the ID
// processing happens after the elements are loaded,
// So we just do it ourselves, bad solution ngl
function scrollToTaggedElement() {
  const url = window.location.hash
  if (url === "") {
    return
  }

  const elementId = url.substring(1)
  const element = document.getElementById(elementId)
  if (!element) {
    return
  }

  element.scrollIntoView({behavior: "instant"})
}

function numberHeaders() {
  let content = document.getElementById("content")
  if (content == null) {
    return
  }

  applyHeaderNumbers(content)
}

/** 
 * @param {HTMLElement} element 
 */
function applyHeaderNumbers(element) {
  let children = element.childNodes
  let numbers = []
  let currentLevel = -1

  for (let child of children) {
    if (child.nodeType != Node.ELEMENT_NODE) {
      continue
    }

    let tname = child.tagName
    let level = headerLevels[tname]

    if (!level || level == 1) {
      continue
    }

    level--

    if (level == currentLevel) {
      numbers[numbers.length - 1]++
    } else if (level < currentLevel) {
      let dif = currentLevel - level;
      for (let i = 0; i < dif; i++) {
        numbers.pop()
        numbers[numbers.length - 1]++
      }
    } else {
      numbers.push(1)
    }

    currentLevel = level

    let span = document.createElement("span")
    span.setAttribute("latex-ignore", "")
    span.textContent = numbers.join(".") + " "
    span.className = "section-num"

    child.insertBefore(span, child.firstChild)
  }
}

function processFigureRefs() {
  let elements = [...document.getElementsByTagName("figref")]

  for (let el of elements) {
    let figureId = el.getAttribute("fig")

    if (!figureId) {
      console.warn(`No 'fig' attribute in`, el)
      continue
    }

    let figureEl = document.getElementById(figureId)
    if (!figureEl) {
      console.warn(`No figure found with id ${figureId}`, el)
      continue
    }

    let figNum = figureEl.getAttribute("figure-number") ?? "0"

    let ahref = document.createElement("a")
    ahref.href = `#${figureEl.id}`
    ahref.textContent = `(See Fig.${figNum})`
    ahref.className = "figref"
    ahref.setAttribute("latex-ignore", "")

    let parent = el.parentElement

    parent.insertBefore(ahref, el)
    parent.removeChild(el)
  }
}

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
    prefix.className = "figure-num"

    capt.insertBefore(prefix, capt.firstChild)

    let parent = capt.parentElement
    if (parent.tagName.toLowerCase() != "figure") {
      continue
    }

    parent.setAttribute("figure-number", i + 1)
  }
}

/**
 * 
 * @param {HTMLDivElement} content 
 * @returns 
 */
function applyHeadingIds(content) {
  if (!content) {
    return
  }

  let headings = content.querySelectorAll("h1, h2, h3, h4, h5, h6")

  for (let heading of headings) {
    processHeadingElement(heading)
  }
}

/**
 * @param {HTMLElement} heading 
 * @returns {string} ID
 */
function processHeadingElement(heading) {
  let txt = encodeURIComponent(
    heading.textContent.toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll(",", "")
      .replaceAll(".", "")
      .replaceAll("'", "")
      .replaceAll("/", "")
      .replaceAll("\"", "")
  )
  
  let linkAnchor = document.createElement("a")
  linkAnchor.href = `#${txt}`
  linkAnchor.className = "copy-header-ref"
  linkAnchor.textContent = "\uD83D\uDD17"
  linkAnchor.onclick = (ev) => {
    let url = window.location
    url.hash = txt
    window.navigator.clipboard.writeText(url.toString())
  }

  heading.lastChild.after(linkAnchor)
  heading.id = txt

  return txt
}

function processTableOfContents() {
  let content = document.getElementById("content")
  let tocOut = document.getElementById("toc-out")

  if (!content || !tocOut) {
    applyHeadingIds(content)
    return
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

    let txt = processHeadingElement(c)

    let a = document.createElement("a")
    if (level > 2) {
      let leftPad = (level - 2) * 3
      a.style.paddingLeft = `${leftPad}mm`
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