export function initLayout2() {
  let joy: any

  const removeJoystick = () => {
    if (joy) {
      joy.destroy()
      joy = null
    }
  }

  const dPad = {
    upBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadN"]') as HTMLElement,
    leftBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadW"]') as HTMLElement,
    rightBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadE"]') as HTMLElement,
    downBtn: document.querySelector('remote.layout-2 .dpad [data-key="PadS"]') as HTMLElement,
    applyPattern(pattern: number[]) {
      this.up(pattern[0] === 1)
      this.left(pattern[1] === 1)
      this.right(pattern[2] === 1)
      this.down(pattern[3] === 1)
    },
    up(press: boolean) {
      if (press && !this.upBtn.classList.contains('pressed')) this.upBtn.dispatchEvent(new Event('touchstart'))
      else if (!press && this.upBtn.classList.contains('pressed')) this.upBtn.dispatchEvent(new Event('touchend'))
    },
    left(press: boolean) {
      if (press && !this.leftBtn.classList.contains('pressed')) this.leftBtn.dispatchEvent(new Event('touchstart'))
      else if (!press && this.leftBtn.classList.contains('pressed')) this.leftBtn.dispatchEvent(new Event('touchend'))
    },
    right(press: boolean) {
      if (press && !this.rightBtn.classList.contains('pressed')) this.rightBtn.dispatchEvent(new Event('touchstart'))
      else if (!press && this.rightBtn.classList.contains('pressed')) this.rightBtn.dispatchEvent(new Event('touchend'))
    },
    down(press: boolean) {
      if (press && !this.downBtn.classList.contains('pressed')) this.downBtn.dispatchEvent(new Event('touchstart'))
      else if (!press && this.downBtn.classList.contains('pressed')) this.downBtn.dispatchEvent(new Event('touchend'))
    },
  }

  const patternGetter = (() => {
    const degreesFor1ButtonOnly = 65
    const angleOptions: Record<string, number[]> = {
      right: [0, 0, 1, 0],
      rightUp: [1, 0, 1, 0],
      up: [1, 0, 0, 0],
      upLeft: [1, 1, 0, 0],
      left: [0, 1, 0, 0],
      leftDown: [0, 1, 0, 1],
      down: [0, 0, 0, 1],
      downRight: [0, 0, 1, 1],
    }

    let angleCursor = -(degreesFor1ButtonOnly / 2)
    const allAngles = Object.keys(angleOptions).map((key, i) => {
      angleCursor += i % 2 === 0 ? degreesFor1ButtonOnly : 90 - degreesFor1ButtonOnly
      return {
        angle: angleCursor,
        pattern: angleOptions[key],
      }
    })
    allAngles.push({ angle: 360, pattern: angleOptions.right })

    return (data: any) => {
      if (data.distance < 30 || !data.angle || !data.angle.degree) return [0, 0, 0, 0]

      let angle = data.angle.degree
      if (angle < 0) angle += 360

      for (let i = 0; i < allAngles.length; i += 1) {
        if (angle < allAngles[i].angle) {
          return allAngles[i].pattern
        }
      }

      return [0, 0, 0, 0]
    }
  })()

  const makeJoystick = () => {
    removeJoystick()
    joy = (window as any).nipplejs.create({
      zone: document.querySelector('remote.layout-2 .dpad'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'gray',
    })

    joy.on('move', (_evt: unknown, data: any) => {
      dPad.applyPattern(patternGetter(data))
    })
    joy.on('end', () => {
      dPad.applyPattern([0, 0, 0, 0])
    })
  }

  const remote = document.querySelector('remote.layout-2') as HTMLElement
  const restartJoystick = () => {
    if (remote.checkVisibility?.()) {
      makeJoystick()
    } else {
      removeJoystick()
    }
  }

  window.addEventListener('resize', restartJoystick)
  let lastVisible = true
  setInterval(() => {
    const isVisible = remote.checkVisibility?.() ?? false
    if (lastVisible !== isVisible) {
      lastVisible = isVisible
      restartJoystick()
    }
  }, 10)
}
