import GeneralGUI from './general-gui'
import { startBeckerboxTour } from './tutorial'
import BLE from './ble-bridge'
import { UUID } from './UUID'

const JSAlert = window.JSAlert
const REFRESH = '<button class="wiiUIbtn" onclick="window.location.reload();" style="font-size: inherit; border-radius: 17px;">Refresh</button>'

const status = {
  connecting: `Connecting to BeckerBox host<br><br>Please wait...<br><br>If this takes more than 10 seconds, please ${REFRESH}`,
  connected: 'Connected!<br><br>Launching remote...',
  cantconnect: `Sorry, it looks something went wrong while connecting!<br><br>Please ${REFRESH}`,
  disconnected: `Sorry, it looks like you got disconnected!<br><br>Please ${REFRESH}`,
  allSlotsTaken: 'Sorry, it looks like all the player slots have already been taken!',
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
    bindClick('reconnectBtn', () => this.reconnectBtnPress())
    bindClick('disconnectBtn', () => this.disconnectBtnPress())
    bindClick('changeDiscBtn', () => this.changeDisc())
    bindClick('changeLayoutBtn', () => this.changeLayout())
    bindClick('handDominanceBtn', () => this.toggleHandDominance())
    bindClick('moreOptionsBtn', () => this.showMoreOptions())

    if (!window.inAndroidApp) {
      document.getElementById('downloadAppBtn')?.style.setProperty('display', 'unset')
      bindClick('downloadAppBtn', () => {
        const link = 'https://raw.githubusercontent.com/21beckem/beckerbox-android-remote/refs/heads/master/app/release/app-release.apk'
        window.open(link, '_blank')
      })
    }

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

  setSlot(slot: number | null) {
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

  private async reconnectBtnPress() {
    await new Promise<void>((resolve) => {
      const panel = new JSAlert('Do you want to try to reconnect to the same player slot?', 'Reconnect')
      panel.setIcon(JSAlert.Icons.Question)
      panel.addButton('Yes').then(() => {
        resolve()
      })
      panel.addButton('No').then(() => {
        UUID.clear()
        resolve()
      })
      panel.show()
    })
    
    this.remote.destroy()
    await new Promise(r => setTimeout(r, 100));
    window.location.reload()
  }

  private disconnectBtnPress() {
    UUID.clear()
    this.remote.destroy()
  }
}





class BluetoothConnection {
  private remote: Remote
  private buttonElement: HTMLElement | null = null
  constructor(remote: Remote) {
    this.remote = remote
    this.buttonElement = document.getElementById('connectBluetoothBtn')
    this.status.setDisconnected()

    if (BLE.isAvailable) this.status.setDisconnected()
    else this.status.setUnavailable()

    this.buttonElement?.addEventListener('click', () => this.btnPress())
  }
  private async btnPress() {
    if (this.currentStatus === 'connected') {
      const confirmed = await JSAlert.confirm('You are already connected via Bluetooth. Do you want to disconnect?', 'Disconnect Bluetooth', JSAlert.Icons.Warning)
      if (!confirmed) return
      BLE.disconnect()
      this.status.setDisconnected()
    } else {
      await this.promptToConnect()
    }
  }

  private async promptToConnect() {
    if (!BLE.isAvailable) {
      JSAlert.alert('Bluetooth is not supported on this device.', 'Not Supported', JSAlert.Icons.Failed)
      return
    }
    this.initConnection();
  }

  private currentStatus = 'disconnected'
  private status = {
    setUnavailable: () => {
      this.currentStatus = 'unavailable'
      if (!this.buttonElement) return
      this.buttonElement.style.display = 'none'
    },
    setConnecting: () => {
      if (BLE.isAvailable === false)
        return this.status.setUnavailable()
      
      this.currentStatus = 'connecting'
      if (!this.buttonElement) return
      this.remote.conn?.emit('setInputMode', 'socket')
      this.buttonElement.innerHTML = `<i class="fa-brands fa-bluetooth-b" style="color: blue;" ></i> Bluetooth Connecting...`
      this.buttonElement.style.pointerEvents = 'none'
      this.buttonElement.style.display = 'unset'
      this.buttonElement.classList.add('pulse-animation')
    },
    setConnected: () => {
      if (BLE.isAvailable === false)
        return this.status.setUnavailable()
      
      this.currentStatus = 'connected'
      if (!this.buttonElement) return
      this.remote.conn?.emit('setInputMode', 'bluetooth')
      this.buttonElement.innerHTML = `<i class="fa-brands fa-bluetooth-b" style="color: green;"></i> Bluetooth Connected`
      this.buttonElement.style.pointerEvents = 'all'
      this.buttonElement.style.display = 'unset'
      this.buttonElement.classList.remove('pulse-animation')
    },
    setDisconnected: () => {
      if (BLE.isAvailable === false)
        return this.status.setUnavailable()

      this.currentStatus = 'disconnected'
      if (!this.buttonElement) return
      this.remote.conn?.emit('setInputMode', 'socket')
      this.buttonElement.innerHTML = `<i class="fa-brands fa-bluetooth-b"></i> Connect via Bluetooth`
      this.buttonElement.style.pointerEvents = 'all'
      this.buttonElement.style.display = 'unset'
      this.buttonElement.classList.remove('pulse-animation')
    }
  }

  private async initConnection() {
    this.status.setConnecting()
    try {

      const id = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Bluetooth connection timed out'))
        }, 10000)
        BLE.onConnected = (id) => {
          clearTimeout(timeout)
          resolve(id)
        }
        BLE.onDisconnected = () => {
          clearTimeout(timeout)
          reject(new Error('Bluetooth disconnected'))
        }
        BLE.onError = (msg) => {
          clearTimeout(timeout)
          reject(new Error(`Bluetooth error: ${msg}`))
        }
        BLE.connect()
      })

      JSAlert.alert(`Connected to BeckerBox via Bluetooth! Your controller ID is ${id}.`, 'Bluetooth Connected', JSAlert.Icons.Success)
      
    } catch (error: Error | any) {
      if (error?.message?.toLowerCase().includes('already connected')) {
        BLE.disconnect()
        JSAlert.alert('An error occurred. Please try again.', '', JSAlert.Icons.Info)
      } else {
        console.error('Bluetooth connection failed:', error)
        JSAlert.alert(error, 'Connection Failed', JSAlert.Icons.Failed)
      }
      this.status.setDisconnected()
      return
    }

    try {
      this.sendHandshake()
      await new Promise(r => setTimeout(r, 500)) // give it a moment to process the handshake before we start sending packets

    } catch (error) {
      console.error('Failed to send handshake over Bluetooth:', error)
      JSAlert.alert('Failed to communicate with the BeckerBox over Bluetooth. Please try again.', 'Communication Failed', JSAlert.Icons.Failed)
      this.status.setDisconnected()
      return
    }

    this.status.setConnected()
  }

  private async sendHandshake() {
    const handshakePacket = { bindToUuid: UUID.get().uuid, packetTemplate: PACKET }
    BLE.write(JSON.stringify(handshakePacket))
  }

  private sending: boolean = false
  async sendPacket(packet: any) {
    if (this.currentStatus !== 'connected') return
    if (this.sending) return
    this.sending = true

    await BLE.write(JSON.stringify(
      Object.values(packet)
        .map(v => {
          if (typeof v === 'boolean') return v ? 1 : 0
          if (typeof v === 'number') return Math.round(v * 100) / 100
            return v
          })
      )
    )
    this.sending = false
  }
}





export class Remote {
  GUI: RemoteGui
  Blue: BluetoothConnection
  socket: any
  conn: any
  connOpen = false
  slot: number | null = null

  constructor() {
    this.GUI = new RemoteGui(this)
    this.Blue = new BluetoothConnection(this)

    this.GUI.setConnectingStatus(status.connecting)
    void this.connect()

    window.__androidAppClosing = () => this.destroy()
  }

  async destroy() {
    this.connOpen = false
    this.conn?.disconnect?.()

    await new Promise(resolve => setTimeout(resolve, 500));

    this.socket = null
    this.conn = null
    this.GUI.setConnectingStatus(status.disconnected)
  }

  async connect() {
    this.GUI.setConnectingStatus(status.connecting)

    const ioFactory = (window as any).io
    if (typeof ioFactory !== 'function') {
      this.connOpen = false
      this.GUI.setConnectingStatus(status.error(new Error('Socket.IO client is not available on window.io')))
      return
    }

    this.conn?.disconnect?.()
    this.socket = ioFactory('/', {
      autoConnect: false,
      transports: ['websocket'],
      query: { role: 'remote', uuid: UUID.get().uuid, uuidTimestamp: UUID.get().timestamp },
    })
    this.conn = this.socket

    this.conn.on('connect', () => {
      this.connOpen = true
      this.GUI.closeMenu()
      this.GUI.showRemotePage()
      this.startSendingPackets()
      setTimeout(() => this.getGames(), 100)
    })

    this.conn.on('qr-link', (link: string) => {
      GeneralGUI.setQRCode(link)
    })

    this.conn.on('no-available-slots', () => {
      window.allSlotsTaken = true
      this.GUI.setConnectingStatus(status.allSlotsTaken)
    })
    this.conn.on('slotAssigned', (slot: number | null) => {
      this.connOpen = true
      console.log('Assigned to slot', slot)
      if (Number.isInteger(slot)) {
        this.GUI.setSlot(slot)
        this.slot = slot
      }
    })

    this.conn.on('powerOff', () => {
      this.destroy()
      this.GUI.alertPowerOff()
    })

    this.conn.on('data', (data: any) => {
      this.connOpen = true

      if (data.type === 'hb') {
        this.conn.emit('data', { type: 'hbr', id: data.id })
      }
    })

    this.conn.on('disconnect', () => {
      this.connOpen = false
      if (window.allSlotsTaken === true) this.GUI.setConnectingStatus(status.allSlotsTaken)
      else this.GUI.setConnectingStatus(status.disconnected)
    })

    const handleSocketError = (err: Error) => {
      this.connOpen = false
      this.GUI.setConnectingStatus(status.error(err))
    }

    this.conn.on('connect_error', handleSocketError)
    this.conn.on('error', handleSocketError)
    this.conn.connect()
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
    if (this.conn && this.conn.connected) {
      this.conn.emit('packet', PACKET)
    }
    if (this.Blue) {
      this.Blue.sendPacket(PACKET)
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

      this.conn.emit('data', toSend)
      this.conn.on('data', handleData)

      setTimeout(() => {
        if (gotData) return
        this.conn.off('data', handleData)
        reject(false)
      }, timeout)
    })
  }

  changeDisc(gameId: string) {
    this.conn.emit('data', { menuAction: 'changeDisc', gameId })
  }
}
