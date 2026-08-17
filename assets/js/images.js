imagesMain()

function imagesMain() {
  let el = document.getElementById("content")
  if (el == null) {
    return
  }

  el.onclick = (ev) => {
    let target = ev.target
    let tag = target.tagName.toLowerCase()

    if (tag != "img" || target.hasAttribute("ignore")) {
      return
    }

    ev.preventDefault()
    window.open(target.src, "_blank").focus()
  }
}
