type EventName = 'healthy' | 'sick' | 'dead'

type Listener = (...args: unknown[]) => void

export default class Heartbeat {
  private destroyed = false
  private failCount = 0
  private conn: any
  private listeners: Record<EventName, Listener[]> = {
    healthy: [],
    sick: [],
    dead: [],
  }

  interval = 500
  failsBeforeDisconnect = 10
  requestTimeout = 1000

  constructor(conn: any) {
    this.conn = conn
  }

  on(event: EventName, callback: Listener) {
    this.listeners[event].push(callback)
  }

  off(event: EventName, callback: Listener) {
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
  }

  private emit(event: EventName, ...args: unknown[]) {
    this.listeners[event].forEach((callback) => callback(...args))
  }

  destroy() {
    this.destroyed = true
  }

  start() {
    this.heartbeat()
  }

  private async heartbeat() {
    if (this.destroyed) return

    const result = await new Promise<boolean>((resolve) => {
      let gotData = false
      const randomId = Math.random().toString(36).slice(2)

      const handleData = (data: any) => {
        if (data !== null && data !== undefined && data.type === 'hbr' && data.id === randomId) {
          gotData = true
          this.conn.off('data', handleData)
          resolve(true)
        }
      }

      this.conn.on('data', handleData)
      this.conn.send({ type: 'hb', id: randomId })

      setTimeout(() => {
        if (gotData) return
        this.conn.off('data', handleData)
        resolve(false)
      }, this.requestTimeout)
    })

    if (this.destroyed) return

    if (result) {
      this.emit('healthy')
      this.failCount = 0
    } else {
      this.failCount += 1
      if (this.failCount < this.failsBeforeDisconnect) {
        this.emit('sick')
      } else {
        this.emit('dead')
      }
    }

    setTimeout(() => this.heartbeat(), this.interval)
  }
}
