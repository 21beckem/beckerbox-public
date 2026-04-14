import Player from './player'
import * as Overlay from './components/Overlay'

class PlayerManager {
  private backendActivatedPlayers = [false, false, false, false]
  players: Array<Player | null> = [null, null, null, null]
  pointerClicks = [false, false, false, false]
  private peer: any

  private setQrCode(id: string | false, selector = '#qrcode') {
    const target = document.querySelector(selector) as HTMLElement
    if (!target) return

    target.innerHTML = '<div class="loader"></div>'
    if (id === false) return

    new window.QRCode(target, {
      text: new URL(`../?id=${id}`, location.href).href,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.H,
    })
  }

  init() {
    window.electron?.init()

    this.peer = new window.Peer(null, {
      host: 'peerjs.beckersuite.com',
      secure: true,
    })

    this.peer.on('error', () => this.peer.reconnect())
    this.peer.on('open', (id: string) => {
      this.setQrCode(id)
      this.alertNewCode(id)
    })
    this.peer.on('disconnect', () => this.peer.reconnect())
    this.peer.on('connection', (conn: any) => this.addNewPhone(conn))
  }

  private async addNewPhone(conn: any) {
    let slot: number | null = null

    const existing = this.players.find((p) => p && p.conn.peer === conn.peer)
    if (existing) {
      this.removePlayer(existing.slot)
      slot = existing.slot
    } else {
      const preferredSlot = await this.getResultFromConnection(conn, { getPreferredSlot: true }).catch(() => null)
      if (
        preferredSlot !== null &&
        preferredSlot !== undefined &&
        (this.players[preferredSlot] === null || this.players[preferredSlot]?.health === 'sick' || this.players[preferredSlot]?.health === 'dead') &&
        this.backendActivatedPlayers[preferredSlot] === true
      ) {
        this.removePlayer(preferredSlot)
        slot = preferredSlot
      }
    }

    if (slot === null || slot === undefined) {
      slot = await window.electron?.addPlayer()
      if (slot !== null && slot !== undefined) this.backendActivatedPlayers[slot] = true
    }

    if (slot === null || slot === undefined) {
      setTimeout(() => conn.send({ slot: null }), 500)
      return
    }

    this.players[slot] = new Player(slot, conn, this)
    conn.on('close', () => this.removePlayer(slot as number))
  }
  async addMouseAsFakePlayer() {
    let callbacks: Record<string, Array<Function>> = {};
    let isMouseDown = false;

    const listener = (event: MouseEvent) => {
      if (event.type === 'mousedown') isMouseDown = true;
      if (event.type === 'mouseup')   isMouseDown = false;

      if (!callbacks['data']) return;
      callbacks['data'].forEach(c => {
        if (typeof c === 'function')
           c({
            Gyroscope_Yaw: event.movementX * -2,
            Gyroscope_Pitch: event.movementY * -2,
            A: isMouseDown ? 1 : 0
          })
      })
    };
    window.addEventListener('mousemove', listener);
    window.addEventListener('mousedown', listener);
    window.addEventListener('mouseup',   listener);

    const conn = {
      open: true,
      send: (data: any) => {
        if (data.type !== 'hb') return;
        if (!callbacks['data']) return;
        callbacks['data'].forEach(c => {
          if (typeof c === 'function') c({type: 'hbr', id: data.id})
        })
      },
      on: (type: string, func: Function) => {
        if (!callbacks[type]) callbacks[type] = [];
        callbacks[type].push(func);
      },
      off: (type: string, func: Function) => {
        if (!callbacks[type]) return;
        callbacks[type] = callbacks[type].filter(c => c !== func);
      },
      close: () =>  {
        debugger;
      }
    }

    return this.addNewPhone(conn);
  }

  removePlayer(slot: number) {
    this.players[slot]?.remove()
    this.players[slot] = null
    window.electron?.removePlayer(slot)
    this.backendActivatedPlayers[slot] = false
  }

  alertPowerOff() {
    this.players.forEach((player) => player?.alertPowerOff())
  }

  alertNewCode(code: string) {
    this.players.forEach((player) => player?.alertNewCode(code))
  }

  bBtnClick() {
    Overlay.goBack()
  }
  homeBtnClick() {
    Overlay.setOpen((prev: boolean) => !prev)
  }

  private async getResultFromConnection(conn: any, toSend: any, timeout = 2000) {
    await new Promise<void>((resolve) => {
      if (conn.open) resolve()
      else conn.on('open', resolve)
    })

    return new Promise<any>((resolve, reject) => {
      let gotData = false
      const handleData = (data: any) => {
        if (data.result === undefined) return
        gotData = true
        conn.off('data', handleData)
        resolve(data.result)
      }

      conn.send(toSend)
      conn.on('data', handleData)

      setTimeout(() => {
        if (gotData) return
        conn.off('data', handleData)
        reject(false)
      }, timeout)
    })
  }
}

const manager = new PlayerManager()
manager.addMouseAsFakePlayer()

export default manager
