import { For } from 'solid-js'
import type { Component } from 'solid-js'

const RemoteStatus: Component<{ index: number }> = (props) => (
  <remote-container class={`p${props.index + 1}`}>
    <div class="phone-icon">
      <i class="fa-solid fa-mobile"></i>
      <i class="fa-solid fa-circle-check"></i>
      <div class="connecting-loader"></div>
      <div class="signal-lost">reconnecting...</div>
    </div>
    <button class="wiiBtn small disconnect">scan now...</button>
  </remote-container>
)

const App: Component = () => {
  return (
    <>
      <main>
        <div id="version"></div>
        <button id="close" class="wiiBtn" onClick={() => window.close()}>
          Close
        </button>
        <button id="open-games-dir" class="wiiBtn" onClick={() => window.openGameMenu()}>
          Game Menu
        </button>

        <section class="middle">
          <div>
            <h1 id="title">BeckerBox</h1>
            <h2 style="margin: 0; color: gray">Time to connect your Remotes</h2>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h3>Scan this with your phone:</h3>
            <div id="qrcode" class="blueBorder">
              <div class="loader"></div>
            </div>
            <br />
            <button class="wiiBtn pointer-clickable" onClick={(e) => window.startWii(e.currentTarget as HTMLButtonElement)}>
              Start
            </button>
          </div>
        </section>

        <section class="connected-phones">
          <div id="remoteStatuses">
            <For each={[0, 1, 2, 3]}>{(index) => <RemoteStatus index={index} />}</For>
          </div>
        </section>
      </main>

      <div id="demo-mode-stamp">DEMO MODE</div>

      <div class="loader-container">
        <div class="loader-wave"></div>
        <div class="msg"></div>
      </div>
    </>
  )
}

export default App
