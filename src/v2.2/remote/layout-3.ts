export function initLayout3() {
  let joy: any
  const nunX = document.querySelector('remote.layout-3 [data-key="NunX"]') as HTMLElement
  const nunY = document.querySelector('remote.layout-3 [data-key="NunY"]') as HTMLElement
  const nunElement = document.querySelector('.btn[data-key="Nun"]') as HTMLElement

  const hapticFeedback = (n = 50) => {
    if (navigator.vibrate) navigator.vibrate(n)
  }

  const removeJoystick = (options: { planningToReEnable?: boolean } = {}) => {
    if (joy) {
      joy.destroy()
      joy = null

      if (!options.planningToReEnable) {
        nunElement.dispatchEvent(new CustomEvent('update-packet', { detail: { value: false } }))
      }
    }
  }

  const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

  const makeJoystick = () => {
    removeJoystick({ planningToReEnable: true })

    nunElement.dispatchEvent(new CustomEvent('update-packet', { detail: { value: true } }))

    joy = (window as any).nipplejs.create({
      zone: document.querySelector('remote.layout-3 .joystick'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'gray',
    })

    joy.on('start', () => hapticFeedback())
    joy.on('move', (_evt: unknown, data: any) => {
      const x = data.distance * Math.sin(data.angle.radian) * -2
      const y = data.distance * Math.cos(data.angle.radian) * 2

      if (data.distance >= 50) hapticFeedback(25)

      nunX.dispatchEvent(new CustomEvent('update-packet', { detail: { value: clamp(x + 128, 0, 255) } }))
      nunY.dispatchEvent(new CustomEvent('update-packet', { detail: { value: clamp(y + 128, 0, 255) } }))
    })

    joy.on('end', () => {
      nunX.dispatchEvent(new CustomEvent('update-packet', { detail: { value: 128 } }))
      nunY.dispatchEvent(new CustomEvent('update-packet', { detail: { value: 128 } }))
    })
  }

  const remote = document.querySelector('remote.layout-3') as HTMLElement
  const restartJoystick = () => {
    if (remote.checkVisibility?.()) makeJoystick()
    else removeJoystick()
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
