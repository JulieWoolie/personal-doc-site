
applyGrammarRuleHrefs()
setupHeaderRefClicks()

function applyGrammarRuleHrefs() {
  const elements = document.querySelectorAll("rule")
  for (const el of elements) {
    el.onclick = onRuleRefClick
  }
}

function setupHeaderRefClicks() {
  const elements = document.querySelectorAll(".copy-header-ref")
  for (const el of elements) {
    el.onclick = onHeaderRefClick
  }
}

function onRuleRefClick(ev) {
  window.location.href = `#${ev.target.textContent}`
}

async function onHeaderRefClick(ev) {
  const href = ev.target.href
  console.log("clicked href:", href)
  await navigator.clipboard.writeText(href)
}