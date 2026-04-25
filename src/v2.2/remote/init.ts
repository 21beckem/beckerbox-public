import GoogleAnalytics from './google-an'
import { Remote } from './remote-core'
import { startBeckerboxTour } from './tutorial'

export function bootstrapRemote() {
  GoogleAnalytics.init()

  window.remote = new Remote()
  startBeckerboxTour()
}
