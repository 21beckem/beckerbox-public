let supportsPassive = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true
      return true
    },
  })
  window.addEventListener('testPassive', null as unknown as EventListener, opts)
  window.removeEventListener('testPassive', null as unknown as EventListener, opts)
} catch {
  // Ignore passive listener detection failures.
}

const passiveFalse = supportsPassive ? { passive: false } : false

let lastTouchEnd = 0

document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  },
  passiveFalse,
)

document.addEventListener(
  'touchmove',
  (e) => {
    if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) {
      e.preventDefault()
    }
  },
  passiveFalse,
)

document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
