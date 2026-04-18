import { setPlayerSlot } from './host-state'
import { PlayerManager_template } from './player-manager'

interface PlayerState {
  slot: number
  connected: boolean
  health: 'healthy' | 'sick' | 'dead'
  avatarSrc: string | null
}

export class Player {
  readonly slot: number
  private parent: PlayerManager_template
  private pointer: Pointer | null = null
  private healthState: 'healthy' | 'sick' | 'dead' = 'dead'
  private _connected = false
  private avatarSrc: string | null = null
  private lastHomeBtnState = 0

  constructor(slot: number, parent: PlayerManager_template) {
    this.slot = slot
    this.parent = parent
    this.pointer = null
    this.ui.healthy()
  }

  set connected(value: boolean) {
    if (!!value === this._connected) return
    this._connected = !!value

    if (!this._connected) {
      this.ui.dead()
      this.pointer?.remove()
      this.pointer = null
    } else {
      this.pointer = new Pointer(this.slot, this.parent)
      this.ui.healthy()
    }
  }
  get connected() {
    return this._connected
  }
  
  setState(state: Partial<PlayerState>) {
    let somethingChanged = false

    if (state.connected !== undefined && state.connected !== this._connected) {
      this.connected = state.connected
      somethingChanged = true
    }
    if (state.avatarSrc !== undefined && state.avatarSrc !== this.avatarSrc) {
      this.avatarSrc = state.avatarSrc
      somethingChanged = true
    }
    if (state.health !== undefined && state.health !== this.healthState) {
      this.healthState = state.health
      somethingChanged = true
    }

    if (somethingChanged) {
      this.updatePlayerSlot()
    }
  }

  get avatar() {
    return this.avatarSrc
  }
  private updatePlayerSlot() {
    setPlayerSlot(this.slot, {
      slot: this.slot,
      connected: this.connected,
      health: this.healthState,
      avatarSrc: this.avatarSrc,
    })
  }


  private ui = {
    healthy: () => {
      if (!this.connected || this.healthState === 'healthy') return
      this.healthState = 'healthy'
      this.updatePlayerSlot()
      this.pointer?.health.healthy()
    },
    sick: () => {
      if (!this.connected || this.healthState === 'sick') return
      this.healthState = 'sick'
      this.updatePlayerSlot()
      this.pointer?.health.sick()
    },
    dead: () => {
      if (!this.connected || this.healthState === 'dead') return
      this.healthState = 'dead'
      this.updatePlayerSlot()
      this.pointer?.health.dead()
    },
  }

  get health() {
    return this.healthState
  }

  newPacket(data: any) {
    this.pointer?.newPacket(data)
    if (data.Home && !this.lastHomeBtnState) {
      this.parent.homeBtnClick()
    }
    this.lastHomeBtnState = data.Home

    data.PointX = this.pointer?.AnalogX
    data.PointY = this.pointer?.AnalogY
    window.electron?.sendPacket(this.slot, data)
  }

  remove() {
    this.ui.dead()
  }
}








class Pointer {
  private slot: number
  private playerManager: PlayerManager_template
  private states: Record<string, number> = {}
  private pos = { x: 0, y: 0 }
  private hoveredElements: HTMLElement[] = []
  private div: HTMLDivElement
  private pointersContainer: HTMLElement
  private aBtnIsDown: boolean = false;
  private statusEl: HTMLDivElement;
  // private healthState = 'healthy';

  constructor(slot: number, playerManager: PlayerManager_template) {
    this.slot = slot
    this.playerManager = playerManager
    this.pointersContainer = document.getElementById('pointers-container') as HTMLElement
    let { div, statusEl } = this.createPointerDOM(slot);
    this.div = div
    this.statusEl = statusEl
    this.pointersContainer?.appendChild(this.div)
    this.center()

    this.playerManager.pointerClicks[slot] = false
  }
  private createPointerDOM(slot: number): Record<string, HTMLDivElement> {
    let div = document.createElement('div')
    div.classList.add(`P${slot + 1}`, 'pointer')

    let pointerBody = document.createElement('div')
    pointerBody.classList.add('pointer-body')
    div.appendChild(pointerBody);
    
    let statusEl = document.createElement('div')
    statusEl.classList.add('status-icon')
    pointerBody.appendChild(statusEl);

    return  { div, statusEl }
  }
  health = {
    healthy: () => {
      // this.healthState = 'healthy'
      this.setStatus('&check;', 'color: green')
    },
    sick: () => {
      // this.healthState = 'sick'
      this.setStatus('&hellip', '')
    },
    dead: () => {
      // this.healthState = 'dead'
      this.setStatus('&times;', '')
    },
  }
  private setStatus(innerHTML:string, style:string) {
    this.statusEl.innerHTML = innerHTML
    this.statusEl.setAttribute('style', style);
  }

  private clickAtPointer() {
    this.playerManager.pointerClicks[this.slot] = true
    this.hoveredElements[0]?.click()
    this.playerManager.pointerClicks[this.slot] = false
  }
  private aBtnDown() {
    this.aBtnIsDown = true;
  }
  private aBtnUp() {
    if (this.aBtnIsDown) this.clickAtPointer()
    this.aBtnIsDown = false;
  }
  private bBtnClick() {
    this.playerManager.bBtnClick()
  }

  newPacket(data: any) {
    console.log(data.A)
    this.move(-data.Gyroscope_Yaw, -data.Gyroscope_Pitch)
    if (data.raw) this.rotateTo(data.raw.Gyroscope_Roll)

    if (data.A === 1 && this.states.A === 0) this.aBtnDown()
    if (data.A === 0 && this.states.A === 1) this.aBtnUp()
    if (data.B === 1 && this.states.B === 0) this.bBtnClick()


    this.states = data
  }

  private center() {
    this.moveTo(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2)
  }

  private moveTo(x: number, y: number) {
    this.pos = { x, y }
    this.div.style.left = `${x}px`
    this.div.style.top = `${y}px`
    this.handleMoveEvents()
  }

  private rotateTo(angle: number) {
    this.div.style.transform = `rotate(${angle}deg)`
  }

  private move(x: number, y: number) {
    const speedFactor = 0.00025
    const xSpeed = document.documentElement.clientWidth * speedFactor
    const ySpeed = document.documentElement.clientHeight * speedFactor

    this.pos = { x: this.pos.x + x * xSpeed, y: this.pos.y + y * ySpeed }
    this.pos = {
      x: Math.min(Math.max(this.pos.x, 0), document.documentElement.clientWidth),
      y: Math.min(Math.max(this.pos.y, 0), document.documentElement.clientHeight),
    }

    this.div.style.left = `${this.pos.x}px`
    this.div.style.top = `${this.pos.y}px`
    this.handleMoveEvents()
  }

  get AnalogX() {
    return (this.pos.x / document.documentElement.clientWidth) * 255
  }

  get AnalogY() {
    return (this.pos.y / document.documentElement.clientHeight) * 255
  }

  private handleMoveEvents() {
    const oldElements = [...this.hoveredElements]
    this.hoveredElements = []

    document.elementsFromPoint(this.pos.x, this.pos.y).forEach((el) => {
      if (!(el instanceof HTMLElement)) return
      if (!el.classList.contains('pointer-clickable')) return
      if (el.classList.contains('pointer')) return

      if (oldElements.includes(el)) {
        oldElements.splice(oldElements.indexOf(el), 1)
      }

      this.hoveredElements.push(el)
      el.dispatchEvent(new MouseEvent('mouseenter'));
      el.classList.add('hover')
    })

    oldElements.forEach((e) => {
      e.dispatchEvent(new MouseEvent('mouseleave'));
      e.classList.remove('hover')
    })

    if (this.hoveredElements.length > 0)
      this.div.classList.add('hovering')
    else
      this.div.classList.remove('hovering');
  }

  remove() {
    this.div.remove()
  }
}
