/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import '../css/style.css'
import '../css/layout-1.css'
import '../css/layout-2.css'
import '../css/layout-3.css'
import './disable-zooming'
import { initLayout2 } from './layout-2'
import { initLayout3 } from './layout-3'
import { bootstrapRemote } from './init'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister()
    }
  })

  if ('caches' in window) {
    void caches.keys().then((cacheNames) => {
      for (const cacheName of cacheNames) {
        void caches.delete(cacheName)
      }
    })
  }
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('Remote root element was not found.')
}

render(() => <App />, root)

bootstrapRemote()

// Layout scripts attach to rendered elements and keep packet updates in sync.
initLayout2()
initLayout3()
