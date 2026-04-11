import GeneralGUI from './general-gui'
import { startBeckerboxTour } from './tutorial'

const JSAlert = window.JSAlert
const REFRESH = '<button class="wiiUIbtn" onclick="window.refreshConnection();" style="font-size: inherit; border-radius: 17px;">Refresh</button>'

const status = {
  connecting: `Connecting to BeckerBox host<br><br>Please wait...<br><br>If this takes more than 10 seconds, please ${REFRESH}`,
  connected: 'Connected!<br><br>Launching remote...',
  noCodeProvided: 'Looks like no game code was provided!<br><br>Please scan the QR code again.',
  cantconnect: `Sorry, it looks something went wrong while connecting!<br><br>Please ${REFRESH}`,
  disconnected: `Sorry, it looks like you got disconnected!<br><br>Please ${REFRESH}`,
  allSlotsTaken: 'Sorry, it looks like all the player slots have already been taken!',
  welcome: 'Thanks for playing with BeckerBox',
  error: (err: unknown) => `Oh no! There's been an error.
    <br>
    <div style="font-size: small;">
      <span onclick="this?.parentElement?.querySelector('p')?.classList?.toggle('hide');">Click here for more details <i class="fa-solid fa-caret-down"></i></span>
      <br>
      <p class="hide">${String(err)}</p>
    </div>
    <br>
    Please ${REFRESH}`,
}

const gameMenu = window.GameMenu.create({
  games: [],
  mode: 'remote',
  gamesSelectable: true,
  showGameNames: false,
})

export const PACKET: Record<string, number | boolean> = {
  Home: 0,
  Plus: 0,
  Minus: 0,
  A: 0,
  B: 0,
  One: 0,
  Two: 0,
  PadN: 0,
  PadS: 0,
  PadE: 0,
  PadW: 0,
  AccelerometerX: 0.0,
  AccelerometerY: 0.0,
  AccelerometerZ: 0.0,
  Gyroscope_Pitch: 0.0,
  Gyroscope_Yaw: 0.0,
  Gyroscope_Roll: 0.0,
  Nun: false,
  C: 0,
  Z: 0,
  NunX: 128,
  NunY: 128,
}

const iPhoneAdjustment =
  navigator.userAgent.toLowerCase().includes('iphone') || navigator.userAgent.toLowerCase().includes('macintosh') ? -1 : 1

const byId = (id: string) => document.getElementById(id) as HTMLElement

class RemoteGui {
  private remote: Remote
  remoteLayouts = ['Classic', 'Driver', 'Split']
  remoteLayout = Number(sessionStorage.getItem('last-remote-layout') || 1)
  handDominance = sessionStorage.getItem('last-hand-dominance') || 'right'
  bStates = [0, 0]

  constructor(remote: Remote) {
    this.remote = remote
    const bindClick = (id: string, handler: () => void | Promise<void>) => {
      document.getElementById(id)?.addEventListener('click', () => {
        void handler()
      })
    }

    bindClick('launchFullscreenBtn', () => GeneralGUI.attemptFullscreen())
    bindClick('menuBarsBtn', () => this.openMenu())
    bindClick('changeDiscBtn', () => this.changeDisc())
    bindClick('changeLayoutBtn', () => this.changeLayout())
    bindClick('handDominanceBtn', () => this.toggleHandDominance())
    bindClick('moreOptionsBtn', () => this.showMoreOptions())
    bindClick('PowerOffBtn', () => this.powerOff())

    this.setBposition()
    this.toggleHandDominance(this.handDominance)
    window.addEventListener('resize', () => this.setBposition())

    document.querySelectorAll('#RemotePage div.btn').forEach((div) => {
      const element = div as HTMLElement
      const key = element.dataset.key
      if (!key) return

      if (element.dataset.dispatchesEvents === 'true') {
        element.addEventListener('update-packet', (event) => {
          const custom = event as CustomEvent<{ value: number | boolean }>
          PACKET[key] = custom.detail.value
        })
        return
      }

      element.addEventListener('touchstart', () => {
        if (key === 'B') {
          this.bStates[element.id.includes('1') ? 0 : 1] = 1
          PACKET.B = 1
        } else {
          PACKET[key] = 1
        }
        element.classList.add('pressed')
        this.hapticFeedback()
      })

      element.addEventListener('touchend', () => {
        if (key === 'B') {
          this.bStates[element.id.includes('1') ? 0 : 1] = 0
          PACKET.B = this.bStates[0] || this.bStates[1] ? 1 : 0
        } else {
          PACKET[key] = 0
        }
        element.classList.remove('pressed')
        this.hapticFeedback()
      })
    })
  }

  private hapticFeedback(n = 50) {
    if (navigator.vibrate) navigator.vibrate(n)
  }

  private setBposition() {
    const visibleA = Array.from(document.querySelectorAll('[data-key="A"]')).find((x) => (x as HTMLElement).checkVisibility?.())
    if (!visibleA) return

    const dist = (visibleA as HTMLElement).getBoundingClientRect().top - 127.5
    document.documentElement.style.setProperty('--bBtn-top', `${dist}px`)
  }

  private keepSavingSlot(slot: number | null) {
    if (slot === null || slot === undefined) {
      localStorage.removeItem('preferredSlot')
      return
    }

    setInterval(() => {
      localStorage.setItem('preferredSlot', JSON.stringify({ slot, timestamp: Date.now() }))
    }, 1000)
  }

  getPreferredSlotFromSession() {
    const raw = localStorage.getItem('preferredSlot')
    if (!raw) return null

    try {
      const data = JSON.parse(raw)
      if (Date.now() - data.timestamp > 60 * 1000) return null
      return data.slot
    } catch {
      return null
    }
  }

  setSlot(slot: number | null) {
    this.keepSavingSlot(slot)
    Array.from(byId('lights').children).forEach((child) => child.classList.remove('on'))
    if (slot !== null) byId('lights').children[slot]?.classList.add('on')

    if (slot === null) {
      JSAlert.alert('Looks like all the player slots have already been taken!', 'Oh no...', JSAlert.Icons.Failed)
      return
    }

    if (slot === 0) {
      Array.from(document.querySelectorAll('.player-one-only')).forEach((el) => el.classList.add('enabled'))
    } else {
      Array.from(document.querySelectorAll('.player-one-only')).forEach((el) => el.classList.remove('enabled'))
    }
  }

  alertPowerOff() {
    JSAlert.alert('System powered off by Player 1. Come back soon! :)', 'Powered Off', JSAlert.Icons.Info)
    location.href = 'https://box.beckersuite.com/thankyou.html'
  }

  showRemotePage() {
    const connectPage = document.getElementById('connectPage') as HTMLElement | null
    if (connectPage) {
      connectPage.style.display = 'none'
    }

    const remotePage = document.getElementById('RemotePage') as HTMLElement | null
    if (remotePage) {
      remotePage.style.display = ''
    }

    Array.from(document.querySelectorAll('#RemotePage remote')).forEach((remote) => {
      ;(remote as HTMLElement).style.display = remote.classList.contains(`layout-${this.remoteLayout}`) ? '' : 'none'
    })

    this.setBposition()
    this.updateSideMenuText()
  }

  private updateSideMenuText() {
    const changeLayoutBtn = document.getElementById('changeLayoutBtn') as HTMLElement | null
    if (changeLayoutBtn) {
      changeLayoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right-arrow-left"></i> Layout<sub>current: ${this.remoteLayouts[this.remoteLayout - 1]}</sub>`
    }

    const handDominanceBtn = document.getElementById('handDominanceBtn') as HTMLElement | null
    if (handDominanceBtn) {
      handDominanceBtn.innerHTML = `<i class="fa-solid fa-arrow-right-arrow-left"></i> Hand Dominance<sub>current: ${this.handDominance}</sub>`
    }
  }

  setConnectingStatus(text: string) {
    const connectingText = document.getElementById('connectingText') as HTMLElement | null
    if (connectingText) {
      connectingText.innerHTML = text
    }

    const connectPage = document.getElementById('connectPage') as HTMLElement | null
    if (connectPage) {
      connectPage.style.display = ''
    }

    const remotePage = document.getElementById('RemotePage') as HTMLElement | null
    if (remotePage) {
      remotePage.style.display = 'none'
    }
  }

  async changeDisc() {
    await this.remote.getGames()
    gameMenu.open()
    this.closeMenu()
    gameMenu.on('insert', (game: { gameId: string }) => {
      gameMenu.close()
      this.remote.changeDisc(game.gameId)
    })
  }

  private async powerOff() {
    const confirmed = await JSAlert.confirm('Are you sure you want to power off the BeckerBox?', 'Power Off', JSAlert.Icons.Warning)
    if (!confirmed) return

    const loader = JSAlert.loader('Powering off...')
    try {
      const result = await this.remote.powerOff()
      loader.dismiss()
      if (result !== false) {
        this.remote.destroy()
        this.alertPowerOff()
      } else {
        JSAlert.alert('Please switch to the system menu (Wii Menu) before you try to power off', 'Failed to power off', JSAlert.Icons.Failed)
      }
    } catch {
      JSAlert.alert('BeckerBox returned an error while powering off. Please try again.', 'Request failed', JSAlert.Icons.Failed)
    }
  }

  changeLayout(setTo: string | null = null) {
    if (setTo === null) {
      this.remoteLayout += 1
    } else {
      const layouts = this.remoteLayouts.map((x) => x.toLowerCase())
      const normalized = setTo.toLowerCase()
      if (!layouts.includes(normalized)) throw new Error('remote layout not found')
      this.remoteLayout = layouts.indexOf(normalized) + 1
    }

    if (this.remoteLayout > this.remoteLayouts.length) this.remoteLayout = 1
    this.showRemotePage()
    sessionStorage.setItem('last-remote-layout', String(this.remoteLayout))
  }

  private toggleHandDominance(setTo: string | null = null) {
    this.handDominance = setTo ?? (this.handDominance === 'right' ? 'left' : 'right')

    document.documentElement.style.setProperty('--bBtn-show-left', this.handDominance === 'right' ? 'flex' : 'none')
    document.documentElement.style.setProperty('--bBtn-show-right', this.handDominance === 'right' ? 'none' : 'flex')
    this.updateSideMenuText()
    sessionStorage.setItem('last-hand-dominance', this.handDominance)
  }

  private showMoreOptions() {
    const panel = new JSAlert('', 'More Options')
    panel.addButton('Show Intro Tutorial').then(() => {
      startBeckerboxTour(true)
      this.closeMenu()
    })
    panel.addButton('Show Developer Console').then(() => {
      window.mobileConsole.show()
      this.closeMenu()
    })
    panel.show()
  }

  openMenu() {
    byId('side-menu').classList.remove('closed')
  }

  closeMenu() {
    byId('side-menu').classList.add('closed')
  }
}

export class Remote {
  private searchParams = new URLSearchParams(window.location.search)
  GUI: RemoteGui
  peer: any
  conn: any
  connOpen = false

  constructor(code: string | null) {
    this.GUI = new RemoteGui(this)

    if ((code === null && this.searchParams.get('id') === 'dev-env') || code === 'dev-env') {
      this.GUI.showRemotePage()
      return
    }

    this.peer = new window.Peer(null, { host: 'peerjs.beckersuite.com', secure: true })
    this.GUI.setConnectingStatus(status.connecting)

    this.peer.on('open', () => this.connectWithCode(code))
    this.peer.on('connection', (c: any) => {
      c.on('open', () => {
        c.send('Connection to another remote is not allowed at this time.')
        setTimeout(() => c.close(), 500)
      })
    })
  }

  destroy() {
    this.connOpen = false
    this.peer?.destroy?.()
    this.GUI.setConnectingStatus(status.disconnected)
  }

  async connectWithCode(code: string | null = null) {
    this.GUI.setConnectingStatus(status.connecting)

    if (code === false as unknown as string) {
      this.GUI.setConnectingStatus(status.welcome)
      return
    }

    if (!code && !this.searchParams.get('id')) {
      this.GUI.setConnectingStatus(status.noCodeProvided)
      return
    }

    code = code || this.searchParams.get('id')
    GeneralGUI.setQRCode('#joinCode .qr-code')
    if (code === 'dev-env') {
      this.GUI.showRemotePage()
      return
    }

    this.conn = this.peer.connect(code)

    this.conn.on('open', () => {
      this.connOpen = true
      this.GUI.closeMenu()
      this.GUI.showRemotePage()
      this.startSendingPackets()
      setTimeout(() => this.getGames(), 100)
      history.replaceState(null, '', `?id=${code}`)
    })

    this.conn.on('data', (data: any) => {
      this.connOpen = true

      if (data.slot !== undefined) {
        this.GUI.setSlot(data.slot)
        if (data.slot === null) {
          window.allSlotsTaken = true
          this.conn.close()
        }
      } else if (data.poweredOff === true) {
        this.destroy()
        this.GUI.alertPowerOff()
      } else if (data.type === 'hb') {
        this.conn.send({ type: 'hbr', id: data.id })
      } else if (typeof data.newHostCode === 'string') {
        GeneralGUI.updateHostCode(data.newHostCode, '#joinCode .qr-code')
      } else if (data.getPreferredSlot === true) {
        this.conn.send({ result: this.GUI.getPreferredSlotFromSession() })
      }
    })

    this.conn.on('disconnected', () => {
      this.connOpen = false
      if (window.allSlotsTaken === true) this.GUI.setConnectingStatus(status.allSlotsTaken)
      else this.GUI.setConnectingStatus(status.disconnected)
    })

    this.conn.on('error', (err: Error) => {
      this.connOpen = false
      if (err.message?.toLowerCase().includes('connection is not open')) {
        window.refreshConnection()
        return
      }
      this.GUI.setConnectingStatus(status.error(err))
    })
  }

  private handleMotion(e: DeviceMotionEvent) {
    if (!e.accelerationIncludingGravity || !e.rotationRate) return

    PACKET.AccelerometerX = (e.accelerationIncludingGravity.x ?? 0) * iPhoneAdjustment
    PACKET.AccelerometerY = (e.accelerationIncludingGravity.y ?? 0) * iPhoneAdjustment
    PACKET.AccelerometerZ = (e.accelerationIncludingGravity.z ?? 0) * iPhoneAdjustment

    PACKET.Gyroscope_Yaw = e.rotationRate.gamma ?? 0
    PACKET.Gyroscope_Pitch = e.rotationRate.alpha ?? 0
    PACKET.Gyroscope_Roll = e.rotationRate.beta ?? 0
  }

  private sendPacketNow() {
    if (this.peer && !this.peer.disconnected && this.conn && this.conn.open) {
      this.conn.send(PACKET)
    }
  }

  private startSendingPackets() {
    const motionCtor = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }
    if (window.DeviceMotionEvent && typeof motionCtor.requestPermission === 'function') {
      motionCtor.requestPermission()
    }
    window.addEventListener('devicemotion', (e) => this.handleMotion(e))
    setInterval(() => this.sendPacketNow(), 10)
  }

  async getGames() {
    const result = await this.getResultFromConnection({ menuAction: 'gameManager.getGames' })
    result?.forEach((game: any) => {
      const img = new Image()
      img.src = game.images.cover.uri ?? game.images.cover.url ?? game.images.disc.uri ?? game.images.disc.url ?? ''
    })
    gameMenu.updateGames(result)
    return result
  }

  private getResultFromConnection(toSend: any, timeout = 2000): Promise<any> {
    return new Promise((resolve, reject) => {
      let gotData = false
      const handleData = (data: any) => {
        if (data.result === undefined) return
        gotData = true
        this.conn.off('data', handleData)
        resolve(data.result)
      }

      this.conn.send(toSend)
      this.conn.on('data', handleData)

      setTimeout(() => {
        if (gotData) return
        this.conn.off('data', handleData)
        reject(false)
      }, timeout)
    })
  }

  changeDisc(gameId: string) {
    this.conn.send({ menuAction: 'changeDisc', gameId })
  }

  powerOff() {
    if (!this.connOpen) return Promise.resolve(false)
    return this.getResultFromConnection({ menuAction: 'powerOff' }, 10000)
  }
}
