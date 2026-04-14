import Pointer from './pointer'
import Heartbeat from './heartbeat'
import { setPlayerSlot } from './host-state'

export default class Player {
  readonly slot: number
  readonly conn: any
  private parent: any
  private alertedAboutPowerOff = false
  private healthState: 'healthy' | 'sick' | 'dead' = 'dead'
  private pointer: Pointer
  private heartbeat: Heartbeat | null = null
  private removed = false
  private avatarSrc: string | null = null
  private lastHomeBtnState = 0

  constructor(slot: number, conn: any, parent: any) {
    this.slot = slot
    this.conn = conn
    this.parent = parent
    this.pointer = new Pointer(this.slot, parent)
    this.avatarSrc = this.generateAvatarSrc()
    this.initConn()
    this.ui.healthy()
  }

  private generateAvatarSrc() {
    return `https://api.dicebear.com/8.x/micah/svg?seed=player-${this.slot}-${Date.now()}&backgroundColor=b6e3f4&radius=50`
  }

  get avatar() {
    return this.avatarSrc
  }
  private updatePlayerSlot() {
    if (this.removed) return
    setPlayerSlot(this.slot, {
      slot: this.slot,
      connected: this.removed ? false : true,
      health: this.healthState,
      avatarSrc: this.removed ? null : this.avatarSrc,
    })
  }


  private ui = {
    healthy: () => {
      if (this.removed || this.healthState === 'healthy') return
      this.healthState = 'healthy'
      this.updatePlayerSlot()
      this.pointer.health.healthy()
    },
    sick: () => {
      if (this.removed || this.healthState === 'sick') return
      this.healthState = 'sick'
      this.updatePlayerSlot()
      this.pointer.health.sick()
    },
    dead: () => {
      if (this.removed || this.healthState === 'dead') return
      this.healthState = 'dead'
      this.updatePlayerSlot()
      this.pointer.health.dead()
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
      if (data.Home && !this.lastHomeBtnState) {
        this.parent.homeBtnClick()
      }
      this.lastHomeBtnState = data.Home
      
      // don't send home button presses to the actual console
      data.Home = 0

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
