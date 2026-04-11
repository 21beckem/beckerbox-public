import Pointer from './pointer'
import Heartbeat from './heartbeat'

export default class Player {
  readonly slot: number
  readonly conn: any
  private parent: any
  private alertedAboutPowerOff = false
  private remoteContainer: HTMLElement
  private healthState: 'healthy' | 'sick' | 'dead' = 'healthy'
  private pointer: Pointer
  private heartbeat: Heartbeat | null = null
  private removed = false

  constructor(slot: number, conn: any, parent: any) {
    this.slot = slot
    this.conn = conn
    this.parent = parent
    this.pointer = new Pointer(this.slot, parent)
    this.remoteContainer = document.querySelector(`remote-container.p${slot + 1}`) as HTMLElement
    this.initConn()
    this.ui.healthy()
  }

  private ui = {
    healthy: () => {
      this.healthState = 'healthy'
      this.remoteContainer.classList.add('connected')
      this.remoteContainer.classList.remove('signal-lost')
      const button = this.remoteContainer.querySelector('.disconnect') as HTMLButtonElement
      button.innerText = 'Disconnect'
      button.onclick = () => this.parent.removePlayer(this.slot)
    },
    sick: () => {
      this.healthState = 'sick'
      this.remoteContainer.classList.remove('connected')
      this.remoteContainer.classList.add('signal-lost')
      const button = this.remoteContainer.querySelector('.disconnect') as HTMLButtonElement
      button.innerText = 'Disconnect'
      button.onclick = () => this.parent.removePlayer(this.slot)
    },
    dead: () => {
      this.healthState = 'dead'
      this.remoteContainer.classList.remove('connected')
      this.remoteContainer.classList.remove('signal-lost')
      const button = this.remoteContainer.querySelector('.disconnect') as HTMLButtonElement
      button.innerText = 'scan now...'
      button.onclick = null
    },
  }

  get health() {
    return this.healthState
  }

  private setupHeartbeat() {
    this.heartbeat = new Heartbeat(this.conn)
    this.heartbeat.start()

    this.heartbeat.on('healthy', () => this.ui.healthy())
    this.heartbeat.on('sick', () => this.ui.sick())
    this.heartbeat.on('dead', () => this.parent.removePlayer(this.slot))
  }

  private initConn() {
    if (this.conn.open) {
      this.conn.send({ slot: this.slot })
      this.setupHeartbeat()
    } else {
      this.conn.on('open', () => {
        this.conn.send({ slot: this.slot })
        this.setupHeartbeat()
      })
    }

    this.conn.on('data', (data: any) => {
      if (data.menuAction) {
        switch (data.menuAction) {
          case 'gameManager.getGames': {
            const omitDataUris = (result: any[]) =>
              result?.map((game) => ({
                ...game,
                images: {
                  ...game.images,
                  cover: { ...game.images.cover, uri: '' },
                  disc: { ...game.images.disc, uri: '' },
                },
              }))

            window.electron?.gameManager.getGames().then((result: any[]) => this.conn.send({ result: omitDataUris(result) }))
            break
          }
          case 'changeDisc':
            window.electron?.changeDisc(data.gameId)
            break
          case 'powerOff':
            window.electron?.powerOff().then((result: boolean) => {
              this.conn.send({ result })
              if (result) {
                this.alertedAboutPowerOff = true
                this.parent.alertPowerOff()
              }
            })
            break
          default:
            break
        }
        return
      }

      if (data.type === 'hbr') return

      this.pointer.newPacket(data)
      data.PointX = this.pointer.AnalogX
      data.PointY = this.pointer.AnalogY
      window.electron?.sendPacket(this.slot, data)
    })
  }

  remove() {
    this.disconnect()
    this.ui.dead()
  }

  alertPowerOff() {
    if (this.alertedAboutPowerOff) return
    this.alertedAboutPowerOff = true
    this.conn.send({ poweredOff: true })
  }

  alertNewCode(code: string) {
    this.conn.send({ newHostCode: code })
  }

  private disconnect() {
    if (this.removed) return
    this.removed = true

    this.heartbeat?.destroy()
    this.heartbeat = null

    this.conn.close()
    this.pointer.remove()
    this.parent.removePlayer(this.slot)
  }
}
