
applyGrammarRuleHrefs()

function applyGrammarRuleHrefs() {
  const elements = document.querySelectorAll("rule")
  for (const el of elements) {
    el.onclick = onRuleRefClick
  }
}

function onRuleRefClick(ev) {
  window.location.href = `#${ev.target.textContent}`
}