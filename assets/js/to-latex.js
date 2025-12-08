let figCounter = 0

const latexTagHandlers = [
  {
    tagName: "h2",
    handler(c) {
      let prefix

      if (c.hasAttribute("no-pre-break")) {
        prefix = ""
      } else {
        prefix = "\n\\newpage"
      }

      return `${prefix}\n\\section{${toLateXString(c.childNodes)}}\\label{${normalizeId(c.id)}}`
    }
  },
  {
    tagName: "h3",
    handler(c) {
      return `\n\\subsection{${toLateXString(c.childNodes)}}\\label{${normalizeId(c.id)}}\n`
    }
  },
  {
    tagName: "h4",
    handler(c) {
      return `\n\\subsubsection{${toLateXString(c.childNodes)}}\\label{${normalizeId(c.id)}}\n`
    }
  },
  {
    tagName: "p",
    handler(c) {
      let prefix

      if (c.matches(":first-child")) {
        prefix = ""
      } else {
        prefix = "\n"
      }

      return `${prefix}${toLateXString(c.childNodes)}\n`
    }
  },
  {
    tagName: "b",
    handler(c) {
      return ` \\textbf{${toLateXString(c.childNodes)}} `
    }
  },
  {
    tagName: "i",
    handler(c) {
      return ` \\textit{${toLateXString(c.childNodes)}} `
    }
  },
  {
    tagName: "code",
    handler(c) {
      return ` \\texttt{${toLateXString(c.childNodes)}} `
    }
  },
  {
    tagName: "ul",
    handler(c) {
      return `\n\\begin{itemize}${toLateXString(c.childNodes)}\n\\end{itemize}`
    }
  },
  {
    tagName: "ol",
    handler(c) {
      return `\n\\begin{enumerate}${toLateXString(c.childNodes)}\n\\end{enumerate}`
    }
  },
  {
    tagName: "li",
    handler(c) {
      return `\n  \\item ${toLateXString(c.childNodes)}`
    }
  },
  {
    tagName: "dl",
    handler(c) {
      return `\n\\begin{description}${toLateXString(c.childNodes)}\\end{description}`
    }
  },
  {
    tagName: "dt",
    handler(c) {
      return `\n  \\item[\\textit{${toLateXString(c.childNodes)}}] \\hfill \\\\ \n`
    }
  },
  {
    tagName: "dd",
    handler(c) {
      return toLateXString(c.childNodes)
    }
  },
  {
    tagName: "table",
    handler: tableToLaTeX
  },
  {
    tagName: "sup",
    handler(c) {
      if (c.hasAttribute("footnote-idx")) {
        return footnoteToLaTeX(c)
      }

      return `\\textsuperscript{${toLateXString(c.childNodes)}}`
    }
  },
  {
    tagName: "pre",
    handler(c) {
      return `\n\\verbatim{${c.textContent}}`
    }
  },
  {
    tagName: "img",
    handler: imgToLaTeX
  },
  {
    tagName: "figure",
    handler: figureToLaTeX
  },
  {
    tagName: "pagebreak",
    handler(c) {
      return "\n\\newpage"
    }
  },
  {
    tagName: "br",
    handler(c) {
      return `\\linebreak `
    }
  },
  {
    tagName: "a",
    handler(c) {
      return `\\href{${c.href}}{${toLateXString(c.childNodes)}}`
    }
  },
  {
    tagName: "section",
    handler(c) {
      return toLateXString(c.childNodes)
    }
  }
]

latexConversionMain()

function latexConversionMain() {
  let el = document.getElementById("latex-convert-btn")
  if (el == null) {
    return
  }

  let latex = convertContentToLaTeX()

  if (latex == null) {
    return
  }

  el.onclick = (ev) => {
    window.navigator.clipboard.writeText(latex.doc)
  }
}

function convertContentToLaTeX() {
  let contentDiv = document.getElementById("content")

  if (contentDiv == null) {
    return null
  }

  let title = document.title
  let time = new Date()
  let author = document.getElementById("author")?.textContent ?? "Julie"

  let latexContent = toLateXString(contentDiv.childNodes)

  let preamble = `
\\documentclass{article}

\\usepackage{amsmath, amsthm, amssymb, amsfonts}
\\usepackage{thmtools}
\\usepackage{graphicx}
\\usepackage{setspace}
\\usepackage{geometry}
\\usepackage{float}
\\usepackage{hyperref}
\\usepackage[utf8]{inputenc}
\\usepackage[english]{babel}
\\usepackage{framed}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{tcolorbox}
\\usepackage{longtable}
\\usepackage{multirow}

\\colorlet{LightGray}{White!90!Periwinkle}
\\colorlet{LightOrange}{Orange!15}
\\colorlet{LightGreen}{Green!15}

\\newcommand{\\HRule}[1]{\\rule{\\linewidth}{#1}}

\\declaretheoremstyle[name=Theorem,]{thmsty}
\\declaretheorem[style=thmsty,numberwithin=section]{theorem}
\\tcolorboxenvironment{theorem}{colback=LightGray}

\\declaretheoremstyle[name=Proposition,]{prosty}
\\declaretheorem[style=prosty,numberlike=theorem]{proposition}
\\tcolorboxenvironment{proposition}{colback=LightOrange}

\\declaretheoremstyle[name=Principle,]{prcpsty}
\\declaretheorem[style=prcpsty,numberlike=theorem]{principle}
\\tcolorboxenvironment{principle}{colback=LightGreen}

\\setstretch{1.2}
\\geometry{
    textheight=9in,
    textwidth=5.5in,
    top=1in,
    headheight=12pt,
    headsep=25pt,
    footskip=30pt
}
\\begin{document}

\\title{ \\normalsize \\textsc{}
		\\\\ [2.0cm]
		\\LARGE \\textbf{\\uppercase{${title}}}
    \\vspace*{15\\baselineskip}
		}
\\date{}
\\author{\\textbf{Author} \\\\
		${author} \\\\ }
\\maketitle
${time.toDateString()} Edition
\\newpage

\\tableofcontents${figCounter > 0 ? "\n\\listoffigures" : ""}`

  let latexDoc = `${preamble}${latexContent}\n\\end{document}`

  return {doc: latexDoc, content: latexContent}
}

/**
 * 
 * @param {NodeListOf<ChildNode>} nodes 
 */
function toLateXString(nodes) {
  let string = ""

  for (let c of nodes) {
    string += nodeToLatex(c)
  }

  return string
}

/**
 * @param {ChildNode} c 
 * @returns {string}
 */
function nodeToLatex(c) {
  if (c.nodeType == Node.TEXT_NODE) {
    return normalizeText(c.textContent)
  }
  if (c.nodeType != Node.ELEMENT_NODE) {
    return ""
  }

  if (c.hasAttribute("latex-ignore")) {
    return ""
  }

  let tagName = c.tagName.toLowerCase()
  let matching = null

  for (let h of latexTagHandlers) {
    if (h.tagName == tagName) {
      matching = h.handler
      break
    }
  }

  if (matching == null) {
    console.log(`Tag ${tagName} is not supported :(`)
    return ""
  }

  return matching(c)
}

/**
 * @param {HTMLElement} sup 
 * @returns {string}
 */
function footnoteToLaTeX(sup) {
  let fnList = document.getElementById("footnotes-list")
  let idx = sup.getAttribute("footnote-idx") ?? "0"

  if (fnList == null) {
    return ""
  }

  let foundNote = null

  for (let note of fnList.childNodes) {
    if (note.nodeType != Node.ELEMENT_NODE) {
      continue
    }

    console.log(note)
    let noteIdx = note.getAttribute("note-idx")
    if (noteIdx != idx) {
      continue
    }

    foundNote = note
    break
  }

  if (foundNote == null) {
    return ""
  }

  let out = `\\footnote{${toLateXString(foundNote.childNodes)}}`
  return out
}

/**
 * @param {HTMLImageElement} img 
 * @returns {string}
 */
function imgToLaTeX(img) {
  let src = img.getAttribute("src")
  let dotIdx = src.lastIndexOf('.')
  if (dotIdx >= 0) {
    src = src.substring(0, dotIdx)
  }
  if (src.startsWith("/")) {
    src = "." + src
  }

  return `\n\\includegraphics[width=0.5\\textwidth]{${src}}`
}

/**
 * @param {HTMLElement} fig 
 * @returns {string}
 */
function figureToLaTeX(fig) {
  let latexImg = null
  let latexCapt = null
  let latexSrc = null
  let center = false

  for (let c of fig.childNodes) {
    if (c.nodeType != Node.ELEMENT_NODE) {
      continue
    }

    let tagName = c.tagName.toLowerCase()
    if (tagName == "figcaption") {
      latexCapt = `\n\\caption{${toLateXString(c.childNodes)}}`
      continue
    }

    if (tagName == "img") {
      latexImg = imgToLaTeX(c)
      latexSrc = c.getAttribute("src")

      if (c.classList.contains("centeredimg")) {
        center = true
      }
      continue
    }
  }

  if (latexImg == null) {
    return ""
  }

  let encoded = encodeURIComponent(
    latexSrc
      .replaceAll("/", "-")
      .replaceAll(".", "-")
  )
  if (encoded.startsWith("-")) {
    encoded = encoded.substring(1)
  }
  let label = `fig:${encoded}`

  let centerText = center ? "\n\\centering" : ""
  let out = `\n\\begin{figure}[H]${centerText}${latexCapt ?? ""}${latexImg}\n\\label{${label}}\n\\end{figure}\nSee figure \\ref{${label}}`

  figCounter++

  return out
}

/**
 * @param {HTMLTableElement} table 
 * @returns {string}
 */
function tableToLaTeX(table) {
  let out = "\n\\begin{tabular}"
  let rows = table.rows
  let columnCount = 0

  for (let row of rows) {
    columnCount = Math.max(0, row.cells.length)
  }
  
  let fraction = 1.0 / columnCount

  for (let i = 0; i < columnCount; i++) {
    if (i == 0) {
      out += "{ |"
    }
    out += ` l|p{${fraction}\\textwidth}| `
  }

  out += "}\n"

  let capt = table.caption
  if (capt != null) {
    out += "\\hline\n"
    out += `\\multicolumn{${columnCount}}{|c|}{${toLateXString(capt.childNodes)}} \\\\ \n`
  }

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    let row = rows[rowIdx]
    let cells = row.cells

    if (rowIdx == 0) {
      out += "\\hline\n"
    }

    for (let i = 0; i < cells.length; i++) {
      let cell = cells.item(i)

      if (i != 0) {
        out += " & "
      }

      out += toLateXString(cell.childNodes)
    }

    out += "\\\\ \n"
    
    if (rowIdx != rows.length - 1) {
      out += "\n\\hline\n"
    }
  }

  out += "\\hline\n\\end{tabular}"

  return out
}

/**
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
  let filtered = text
    .replaceAll(/\s+/g, " ")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("/", "\\/")
    .replaceAll("%", "\\%")
    .trim()

  return filtered
}

/**
 * @param {string} text 
 * @returns {string}
 */
function normalizeId(id) {
  return id
    .replaceAll(/\s+/g, " ")
    .replaceAll("%20", "-")
    .trim()
}