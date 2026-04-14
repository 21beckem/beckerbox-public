export default class Pointer {
  private slot: number
  private playerManager: any
  private states: Record<string, number> = {}
  private pos = { x: 0, y: 0 }
  private hoveredElements: HTMLElement[] = []
  private div: HTMLDivElement
  private pointersContainer: HTMLElement
  private aBtnIsDown: boolean = false;

  constructor(slot: number, playerManager: any) {
    this.slot = slot
    this.playerManager = playerManager
    this.pointersContainer = document.getElementById('pointers-container') as HTMLElement
    this.div = document.createElement('div')
    this.div.setAttribute('class', `P${slot + 1} pointer`)
    this.div.innerHTML = '<div class="pointer-inner"></div>'
    this.pointersContainer.appendChild(this.div)
    this.center()

    this.playerManager.pointerClicks[slot] = false
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
