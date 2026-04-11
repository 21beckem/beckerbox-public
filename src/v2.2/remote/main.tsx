/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import '../css/style.css'
import '../css/layout-1.css'
import '../css/layout-2.css'
import '../css/layout-3.css'
import './disable-zooming'
import './general-gui'
import { initLayout2 } from './layout-2'
import { initLayout3 } from './layout-3'
import { bootstrapRemote } from './init'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Remote root element was not found.')
}

render(() => <App />, root)

bootstrapRemote()

// Layout scripts attach to rendered elements and keep packet updates in sync.
initLayout2()
initLayout3()
