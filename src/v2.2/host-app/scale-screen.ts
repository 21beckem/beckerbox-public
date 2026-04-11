function setPageScale(scaleFactor: number) {
  const body = document.body.style
  body.transform = `scale(${scaleFactor})`
  body.transformOrigin = 'top left'
  body.width = `${window.innerWidth * (1 / scaleFactor) * 0.99}px`
}

function isWindowScrollbarVisible() {
  const main = document.querySelector('main')
  if (!main) return false
  return main.getBoundingClientRect().height > window.innerHeight
}

async function scrollToTop() {
  window.scrollTo(0, 0)

  const firstPass = setInterval(() => window.scrollTo(0, 0), 10)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  clearInterval(firstPass)

  const secondPass = setInterval(() => window.scrollTo(0, 0), 100)
  await new Promise((resolve) => setTimeout(resolve, 3000))
  clearInterval(secondPass)

  setInterval(() => window.scrollTo(0, 0), 1000)
}

export default function scaleScreenToFit() {
  document.addEventListener('DOMContentLoaded', async () => {
    scrollToTop()

    let scale = 1.0
    while (isWindowScrollbarVisible()) {
      scale *= 0.99
      setPageScale(scale)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  })
}
