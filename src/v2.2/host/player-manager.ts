import { Player } from './player'
import * as Overlay from './components/Overlay'

export class PlayerManager_template {
  pointerClicks = [false, false, false, false]
  players: Array<Player | null> = [null, null, null, null]

  constructor() {
    this.players = [new Player(0, this), new Player(1, this), new Player(2, this), new Player(3, this)]
    this.setHandlers()
    window.PlayerManager.getState()
  }

  private setHandlers() {
    window.PlayerManager.onEvent('state', (state: any) => {
      if (!state || !state.players) return
      if (!Array.isArray(state.players)) return
      if (state.players.length !== 4) return

      state.players.forEach((p: any, index: number) => {
        if (p && this.players[index]) {
          this.players[index].setState(p);
        }
      })
    })
    window.PlayerManager.onEvent('packet', ({slot, packet}: {slot: number, packet: any}) => {
      if (typeof slot !== 'number') return
      if (slot < 0 || slot > 3) return
      if (!this.players[slot]) return
      this.players[slot].newPacket(packet)
    })
  }

  bBtnClick() {
    Overlay.goBack()
  }
  homeBtnClick() {
    Overlay.setOpen((prev: boolean) => !prev)
  }
}

const PlayerManager = new PlayerManager_template()

export default PlayerManager
