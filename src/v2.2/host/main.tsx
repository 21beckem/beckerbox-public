/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import './bootstrap'

const root = document.getElementById('root')
if (!root) {
  throw new Error('Host root element was not found.')
}

render(() => <App />, root)
