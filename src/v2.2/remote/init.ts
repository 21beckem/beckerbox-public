import GoogleAnalytics from './google-an'
import { Remote } from './remote-core'
import { startBeckerboxTour } from './tutorial'

export function bootstrapRemote() {
  GoogleAnalytics.init()

  window.remote = null

  window.refreshConnection = (code: string | null = null, force = true) => {
    if (force) {
      window.location.reload()
      return
    }

    window.remote?.destroy()
    window.remote = new Remote(code)
  }

  window.disconnectRemote = () => {
    window.remote?.destroy()
    window.remote = null
  }

  window.refreshConnection(null, false)
  startBeckerboxTour()
}
