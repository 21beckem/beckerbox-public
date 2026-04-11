const noSleep = new window.NoSleep()
const byId = (id: string) => document.getElementById(id) as HTMLElement | null

let launchedFullScreen = false
const onMobile = window.matchMedia('(any-pointer: coarse)').matches
const searchParams = new URLSearchParams(window.location.search)

export function initializeGeneralGUIState() {
  if (!onMobile || searchParams.get('id') === 'dev-env') {
    document.documentElement.classList.add('mobile')
    const openPrompt = byId('openFullScreenPrompt')
    if (openPrompt) {
      openPrompt.style.display = 'none'
    } else {
      // In dev, module evaluation can race initial render on first load.
      requestAnimationFrame(() => {
        byId('openFullScreenPrompt')?.style.setProperty('display', 'none')
      })
    }
    launchedFullScreen = true
  }
}

export default class GeneralGUI {
  static async attemptFullscreen() {
    const motionCtor = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (window.DeviceMotionEvent && typeof motionCtor.requestPermission === 'function') {
      await motionCtor.requestPermission()
    }

    noSleep.enable()

    const elem = document.documentElement
    if (typeof elem.requestFullscreen === 'function') await elem.requestFullscreen()
    else if (typeof elem.mozRequestFullScreen === 'function') await elem.mozRequestFullScreen()
    else if (typeof elem.webkitRequestFullscreen === 'function') await elem.webkitRequestFullscreen()
    else if (typeof elem.webkitEnterFullscreen === 'function') await elem.webkitEnterFullscreen()
    else if (typeof elem.msRequestFullscreen === 'function') await elem.msRequestFullscreen()
    else if (typeof elem.oRequestFullscreen === 'function') await elem.oRequestFullscreen()
    else byId('openFullScreenPrompt')?.style.setProperty('display', 'none')

    try {
      await screen.orientation.lock('portrait')
    } catch {
      // Screen orientation lock is not supported on every browser.
    }

    window.scrollTo(0, 0)
    document.body.scrollTop = 0
    byId('RemotePage')?.style.setProperty('overflow-y', 'unset')
    setTimeout(() => {
      byId('RemotePage')?.style.setProperty('overflow-y', 'hidden')
    }, 10)

    launchedFullScreen = true
  }

  static updateHostCode(code: string, selector: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('id', code)
    window.history.replaceState({ path: url.href }, '', url.href)

    this.setQRCode(selector)
  }

  static setQRCode(selector: string) {
    const target = document.querySelector(selector)
    if (!target) {
      return
    }
    target.innerHTML = ''
    new window.QRCode(target, {
      text: window.location.href,
      width: 150,
      height: 150,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    })
  }

  static async waitForFullscreenLaunch() {
    while (!launchedFullScreen) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

window.GeneralGUI = GeneralGUI
