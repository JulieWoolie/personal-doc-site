const BACKGROUNDS = [
  // {
  //   "imageUrl": "bgs/greeks.jpg",
  //   "info": "Greeks worshipping (idk the full title)"
  // },
  {
    "imageUrl": "bgs/pandemonium.jpg",
    "info": "Satan's palace, Pandemonium, from 'Paradise Lost'"
  },
  // {
  //   "imageUrl": "bgs/reception.png",
  //   "info": "Reception of the Grand Condé at Versailles, by Jean-Léon Gérôme"
  // },
  // {
  //   "imageUrl": "bgs/villa.jpg",
  //   "info": "Ancient Roman Villa Scene"
  // },
  // {
  //   "imageUrl": "bgs/village.jpg",
  //   "info": "Medieval town painting"
  // }
]

backgroundMain()

function backgroundMain() {
  let storVal = localStorage.getItem("backgrounds-enabled") ?? "false"
  let state = storVal == "true"

  onBgStateChange(state)

  let btnEl = document.getElementById("bg-toggle-btn")
  if (!btnEl) {
    return
  }

  btnEl.onclick = () => {
    state = !state

    onBgStateChange(state)
    localStorage.setItem("backgrounds-enabled", state)
  }
}

function onBgStateChange(state) {
  let body = document.body
  let s = body.style

  let bgInfoEl = document.getElementById("bg-info")

  if (!state) {
    s.removeProperty("background-image")

    if (bgInfoEl) {
      bgInfoEl.style.visibility = "hidden"
    }

    return
  }

  let idx = Math.floor(Math.random() * BACKGROUNDS.length)
  let bg = BACKGROUNDS[idx]

  s.backgroundImage = `url("/${bg.imageUrl}")`

  if (!bgInfoEl) {
    return
  }

  bgInfoEl.style.visibility = "visible"
  bgInfoEl.textContent = `Background info: ${bg.info}`
}