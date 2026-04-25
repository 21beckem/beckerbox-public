export {}

declare global {
  interface Window {
    JSAlert: any
    GameMenu: any
    Peer: any
    QRCode: any
    NoSleep: any
    driver: any
    mobileConsole: any
    electron?: any
    remote?: any
    UUID?: any
    allSlotsTaken?: boolean
    DEMOMODE?: boolean
    GeneralGUI?: any
    startWii: (startBtn: HTMLButtonElement) => void
    openGameMenu: () => Promise<void>
    __androidAppClosing?: () => void
    PlayerManager?: any
    dataLayer?: unknown[]
    inAndroidApp?: boolean,
    AndroidBle?: any,

    __bleOnConnected?: (id: string) => void
    __bleOnDisconnected?: (id: string) => void
    __bleOnError?: (msg: string) => void
  }

  interface Navigator {
    bluetooth?: any
  }

  interface Document {
    mozCancelFullScreen?: () => Promise<void>
    webkitCancelFullScreen?: () => Promise<void>
    msExitFullscreen?: () => Promise<void>
    oCancelFullScreen?: () => Promise<void>
  }

  interface HTMLElement {
    mozRequestFullScreen?: () => Promise<void>
    webkitRequestFullscreen?: () => Promise<void>
    webkitEnterFullscreen?: () => Promise<void>
    msRequestFullscreen?: () => Promise<void>
    oRequestFullscreen?: () => Promise<void>
    checkVisibility?: () => boolean
  }

  interface WindowEventMap {
    devicemotion: DeviceMotionEvent
  }
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      remote: HTMLAttributes<HTMLElement>
      'remote-container': HTMLAttributes<HTMLElement>
    }
  }
}
