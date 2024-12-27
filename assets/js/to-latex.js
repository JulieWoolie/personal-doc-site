
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

      return `${prefix}\n\\section{${normalizeText(c.textContent)}}\\label{${normalizeId(c.id)}}`
    }
  },
  {
    tagName: "h3",
    handler(c) {
      return `\n\\subsection{${normalizeText(c.textContent)}}\\label{${normalizeId(c.id)}}\n`
    }
  },
  {
    tagName: "p",
    handler(c) {
      return `\n${toLateXString(c.childNodes)}\n`
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
      return `\n  \\item[${toLateXString(c.childNodes)}] \\hfill \\\\ \n`
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
    handler(c) {
      return tableToLaTeX(c)
    }
  },
  {
    tagName: "sup",
    handler(c) {
      if (c.hasAttribute("footnote-idx")) {
        return footnoteToLaTeX(c)
      }

      return `\\textsuperscript{${toLateXString(c.childNodes)}}`
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

  el.onclick = (ev) => {
    window.navigator.clipboard.writeText(latex)
  }
}

function convertContentToLaTeX() {
  let contentDiv = document.getElementById("content")

  if (contentDiv == null) {
    return ""
  }

  let title = document.title
  let time = new Date()
  let author = document.getElementById("author")?.textContent ?? "Julie"

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
		\\HRule{1.5pt} \\\\
		\\LARGE \\textbf{\\uppercase{${title}}}
    \\HRule{1.5pt} \\\\ [0.6cm] \\vspace*{10\\baselineskip}
		}
\\date{}
\\author{\\textbf{Author} \\\\
		${author} \\\\ }
\\maketitle
${time.toDateString()} Edition
\\newpage

\\tableofcontents
\\newpage
`
  let latexContent = toLateXString(contentDiv.childNodes)
  return `${preamble}${latexContent}\n\\end{document}`
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
 * @param {HTMLTableElement} table 
 * @returns {string}
 */
function tableToLaTeX(table) {
  let out = "\n\\begin{tabular}"
  let rows = table.rows

  for (let i = 0; i < rows.length; i++) {
    if (i == 0) {
      out += "{ |"
    }
    out += "l|"
  }

  out += " }\n"

  let capt = table.caption
  if (capt != null) {
    out += "\\hline\n"
    out += `\\multicolumn{${rows.length}}{|c|}{${toLateXString(capt.childNodes)}} \\\\ \n`
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

    if (rowIdx == 0) {
      out += "\n\\hline\n"
    }
  }

  out += "\\hline\n\\end{tabular}"

  return out
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
function normalizeText(text) {
  return text
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll(/\s+/g, " ")
    .trim()
}

/**
 * 
 * @param {string} text 
 * @returns {string}
 */
function normalizeId(id) {
  return id
    .replaceAll(/\s+/g, " ")
    .replaceAll("%20", "-")
    .trim()
}